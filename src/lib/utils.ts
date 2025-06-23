import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get Appwrite session token from cookies
export function getAppwriteSessionToken(): string | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null; // Ensure this only runs on the client-side
  }

  try {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const projectId = '684492280037c88a3856';
    const possibleSessionKeys = [
      `a_session_${projectId}`,
      `a_session_${projectId}_legacy`,
    ];

    for (const key of possibleSessionKeys) {
      if (cookies[key]) {
        return cookies[key];
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting session token from cookies:', error);
    return null;
  }
}
