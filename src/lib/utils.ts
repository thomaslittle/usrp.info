import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get Appwrite session token from cookies with improved fallback mechanism
export function getAppwriteSessionToken(): string | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null; // Ensure this only runs on the client-side
  }

  try {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const projectId = '684492280037c88a3856';
    const possibleSessionKeys = [
      `a_session_${projectId}`,
      `a_session_${projectId}_legacy`,
      `appwrite_session_${projectId}`,
      'a_session',
      'appwrite_session'
    ];

    // Try to find session token in cookies
    for (const key of possibleSessionKeys) {
      if (cookies[key]) {
        console.log('🔑 Found session token in cookies:', key);
        return cookies[key];
      }
    }

    // Fallback to localStorage (for cookie fallback mechanism)
    try {
      const fallbackToken = localStorage.getItem('cookieFallback');
      if (fallbackToken) {
        console.log('🔑 Using localStorage fallback token');
        return fallbackToken;
      }
    } catch (localStorageError) {
      console.warn('📦 localStorage not available:', localStorageError);
    }

    console.warn('🚫 No session token found in cookies or localStorage');
    return null;
  } catch (error) {
    console.error('❌ Error getting session token:', error);
    return null;
  }
}
