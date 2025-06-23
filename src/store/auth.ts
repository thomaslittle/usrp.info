import { create } from 'zustand';
import { User } from '@/types';
import { Models } from 'appwrite';

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  userProfile: User | null;
  isLoading: boolean;
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  refresh: () => {
    // Trigger a re-check by setting loading to true
    // The useAuth hook will detect this and re-run the auth check
    set({ isLoading: true });
  },
  logout: () => set({ user: null, userProfile: null }),
})); 