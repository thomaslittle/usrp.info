import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get Appwrite session token from localStorage
export function getAppwriteSessionToken(): string | null {
  if (typeof window === 'undefined') return null; // Server-side check
  
  try {
    const cookieFallback = localStorage.getItem('cookieFallback');
    if (!cookieFallback) return null;
    
    const fallbackData = JSON.parse(cookieFallback);
    const projectId = '684492280037c88a3856';
    
    // Try different possible session key formats
    const possibleKeys = [
      `a_session_${projectId}`,
      `appwrite_session_${projectId}`,
      'a_session',
      'appwrite_session'
    ];
    
    for (const key of possibleKeys) {
      if (fallbackData[key]) {
        return fallbackData[key];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}
