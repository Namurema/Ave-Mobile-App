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
    const data = await signInWithGoogle();
    set({ session: data.session, user: data.user });
  },

  signOut: async () => {
    await signOut();
    set({ session: null, user: null });
  },
}));