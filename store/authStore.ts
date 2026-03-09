import { create } from 'zustand';
import { getSession, signInWithGoogle, signOut } from '../lib/supabase/auth';

interface AuthState {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  loadSession: async () => {
    try {
      const session = await getSession();
      set({ session, user: session?.user ?? null, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  signIn: async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.log('Sign in not available yet:', error);
    }
  },

  signOut: async () => {
    await signOut();
    set({ session: null, user: null });
  },
}));