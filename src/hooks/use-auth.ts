"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { getCurrentUser, getDiscordUserInfo, getDiscordServerUsername } from '@/lib/auth';

// Your Discord server ID for getting server-specific usernames
const DISCORD_SERVER_ID = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID || '';

export function useAuth() {
  const { user, userProfile, isLoading, setUser, setUserProfile, setLoading, refresh, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Use API route to get user profile instead of direct database call
          try {
            const response = await fetch(`/api/users/profile?email=${encodeURIComponent(currentUser.email)}`);
            let userRecord = null;
            
            if (response.ok) {
              const data = await response.json();
              userRecord = data.user;
            }
            
            // If no user record exists, create one (for Discord OAuth users)
            if (!userRecord) {
              console.log('No user record found, creating one for OAuth user...');
              
              let username = currentUser.name || 'Unknown';
              let gameCharacterName = '';
              
              // If this is a Discord OAuth user, try to get server-specific info
              if (DISCORD_SERVER_ID) {
                try {
                  const discordUser = await getDiscordUserInfo();
                  if (discordUser) {
                    // Try to get server nickname first
                    const serverUsername = await getDiscordServerUsername(
                      discordUser.id, 
                      DISCORD_SERVER_ID
                    );
                    
                    if (serverUsername) {
                      // Use server nickname for both username and character name
                      gameCharacterName = serverUsername;
                      username = serverUsername;
                    } else {
                      // Fall back to Discord display name or username
                      username = discordUser.global_name || discordUser.username || username;
                      gameCharacterName = discordUser.global_name || discordUser.username || '';
                    }
                    
                    console.log(`Discord user setup: username="${username}", character="${gameCharacterName}"`);
                  }
                } catch (error) {
                  console.warn('Could not fetch Discord server info (using basic Discord info):', error);
                }
              }
              
              // Create user record via API route
              const createResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: currentUser.$id,
                  email: currentUser.email,
                  username: username,
                  department: 'ems', // Default department - can be changed later
                  role: 'viewer', // Default role for new users
                  gameCharacterName: gameCharacterName,
                  rank: '',
                  createdAt: new Date().toISOString(),
                }),
              });
              
              if (createResponse.ok) {
                const createData = await createResponse.json();
                userRecord = createData.user;
                console.log('Created user record:', userRecord);
              } else {
                throw new Error('Failed to create user record');
              }
            }
            
            // Set user profile from database record
            setUserProfile({
              $id: userRecord.$id,
              userId: userRecord.userId,
              email: userRecord.email,
              username: userRecord.username,
              department: userRecord.department,
              role: userRecord.role,
              gameCharacterName: userRecord.gameCharacterName || '',
              rank: userRecord.rank || '',
              lastLogin: new Date().toISOString(),
              createdAt: userRecord.createdAt,
              $createdAt: userRecord.$createdAt,
              $updatedAt: userRecord.$updatedAt
            });
          } catch (dbError) {
            console.error('Database operation failed:', dbError);
            // Set user but no profile if database operations fail
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    // Only run if loading is true (initial load or after refresh)
    if (isLoading) {
      checkAuth();
    }
  }, [isLoading, setUser, setUserProfile, setLoading]);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    refresh,
    logout
  };
} 