import { account } from './appwrite';
import { adminClient, adminAccount } from './appwrite-server';
import { UserRole } from '@/types';
import { Models, OAuthProvider, Client, Account } from 'appwrite';
import { NextRequest } from 'next/server';

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// Server-side authentication for API routes
export async function getCurrentUserFromRequest(request: NextRequest): Promise<Models.User<Models.Preferences> | null> {
  try {
    // First, try to get session from cookies
    const cookieHeader = request.headers.get('cookie');
    let sessionToken = null;

    if (cookieHeader) {
      // Parse cookies to find Appwrite session cookies
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      // Look for Appwrite session cookies in various formats
      const projectId = '684492280037c88a3856';
      const possibleSessionKeys = [
        `a_session_${projectId}`,
        `a_session_${projectId}_legacy`,
        `appwrite_session_${projectId}`,
        'a_session',
        'appwrite_session'
      ];
      
      for (const key of possibleSessionKeys) {
        if (cookies[key]) {
          sessionToken = cookies[key];
          break;
        }
      }
    }

    // If no session in cookies, try fallback headers (for localStorage sessions)
    if (!sessionToken) {
      // Check for X-Fallback-Cookies header (Appwrite's fallback mechanism)
      const fallbackCookies = request.headers.get('x-fallback-cookies');
      
      if (fallbackCookies) {
        sessionToken = fallbackCookies;
      }
      
      // Also check for Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }
    
    if (!sessionToken) {
      return null;
    }

    // Use the server client to validate the session
    const { Client: ServerClient, Account: ServerAccount } = await import('node-appwrite');
    
    const sessionClient = new ServerClient();
    sessionClient
      .setEndpoint('https://appwrite.usrp.info/v1')
      .setProject('684492280037c88a3856')
      .setSession(sessionToken);

    const sessionAccount = new ServerAccount(sessionClient);
    
    // Get the current user using the session
    return await sessionAccount.get();
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

export async function clearExistingSessions() {
  try {
    // Try to delete the current session if it exists
    await account.deleteSession('current');
  } catch {
    // Ignore errors - session might not exist
  }
}

export async function login(email: string, password: string) {
  try {
    // First, try to clear any existing sessions
    await clearExistingSessions();
    
    // Then create a new session
    await account.createEmailPasswordSession(email, password);
    return { success: true };
  } catch (error: unknown) {
    // If we still get a session exists error, try to handle it
    if (error instanceof Error && error.message.includes('session is active')) {
      try {
        // Force delete all sessions and try again
        await account.deleteSessions();
        await account.createEmailPasswordSession(email, password);
        return { success: true };
      } catch (retryError: unknown) {
        return { success: false, error: retryError instanceof Error ? retryError.message : 'Login failed after session cleanup' };
      }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function register(email: string, password: string, username: string) {
  try {
    await account.create('unique()', email, password, username);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Discord OAuth functions
export async function loginWithDiscord() {
  try {
    // Clear any existing sessions first
    await clearExistingSessions();
    
    // Request additional Discord scopes to access server information
    const scopes = ['identify', 'email', 'guilds', 'guilds.members.read'];
    
    // Use the correct app domains from the allowed hosts list
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.usrp.info'
      : 'http://localhost:3000'; // No port number - just localhost
    
    // Redirect to Discord OAuth - Appwrite will handle the callback internally
    account.createOAuth2Session(
      OAuthProvider.Discord,
      `${baseUrl}/dashboard`, // Success redirect
      `${baseUrl}/auth/login`, // Simplified failure redirect - no query params
      scopes
    );
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getDiscordServerUsername(userId: string, guildId: string): Promise<string | null> {
  try {
    // Get the current user's session to access Discord token
    const session = await account.getSession('current');
    
    // Extract Discord access token from session
    // Note: This requires the session to have Discord OAuth data
    const discordToken = session.providerAccessToken;
    
    if (!discordToken) {
      console.warn('No Discord access token found');
      return null;
    }

    // Call Discord API to get guild member info
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
      headers: {
        'Authorization': `Bearer ${discordToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Discord guild access denied - user may not be in server or bot lacks permissions');
        return null;
      } else if (response.status === 403) {
        console.warn('Discord guild access forbidden - bot may not have proper permissions');
        return null;
      } else if (response.status === 404) {
        console.warn('Discord user not found in guild or guild not found');
        return null;
      } else {
        console.warn(`Discord API error: ${response.status}`);
        return null;
      }
    }

    const memberData = await response.json();
    
    // Return nickname (if set) or null to fall back to basic user info
    return memberData.nick || null;
  } catch (error) {
    console.warn('Error fetching Discord server username (will fall back to basic info):', error);
    return null;
  }
}

export async function getDiscordUserInfo(): Promise<any> {
  try {
    const session = await account.getSession('current');
    const discordToken = session.providerAccessToken;
    
    if (!discordToken) {
      return null;
    }

    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${discordToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Discord user info:', error);
    return null;
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    viewer: 0,
    editor: 1,
    admin: 2,
    super_admin: 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canEditContent(userRole: UserRole, userDepartment: string, contentDepartment: string): boolean {
  // Super admin can edit everything
  if (userRole === 'super_admin') return true;
  
  // Admin and editor can edit within their department
  if ((userRole === 'admin' || userRole === 'editor') && userDepartment === contentDepartment) return true;
  
  return false;
}

export function canPublishContent(userRole: UserRole, userDepartment: string, contentDepartment: string): boolean {
  // Super admin can publish everything
  if (userRole === 'super_admin') return true;
  
  // Admin can publish within their department
  if (userRole === 'admin' && userDepartment === contentDepartment) return true;
  
  return false;
} 