import { create } from "zustand";
import { onAuthStateChange, getCurrentProfile } from "@/services/authService";
import type { User } from "@/services/authService";
import type { Profile } from "@/services/authService";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  cleanup: () => void;
}

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setProfile: (profile) =>
    set({
      profile,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  initializeAuth: () => {
    // Prevent duplicate subscriptions
    if (unsubscribe) {
      return;
    }

    set({ isLoading: true });

    // Subscribe to auth state changes
    const subscription = onAuthStateChange(async (user) => {
      if (user) {
        set({ user, isAuthenticated: true });
        // Fetch profile data
        const profile = await getCurrentProfile();
        set({ profile, isLoading: false });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    unsubscribe = () => {
      subscription?.unsubscribe?.();
    };
  },

  cleanup: () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  },
}));
