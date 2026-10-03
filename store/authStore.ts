import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { getSession, signOut } from '../lib/supabase/auth';
import { checkIsAdmin } from '../lib/supabase/admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // True after opening a password-reset link, until a new password is set
  recoveringPassword: boolean;
  // Whether the signed-in account is the admin (checked by the database)
  isAdmin: boolean;
  loadSession: () => Promise<void>;
  finishPasswordRecovery: () => void;
  signOut: () => Promise<void>;
}

let subscribed = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  recoveringPassword: false,
  isAdmin: false,

  loadSession: async () => {
    // Keep the store in sync with Supabase: sign in/out, token refresh, and
    // sessions arriving from email links
    if (!subscribed) {
      subscribed = true;
      supabase.auth.onAuthStateChange((event, session) => {
        set({ session, user: session?.user ?? null, loading: false });
        if (event === 'PASSWORD_RECOVERY') set({ recoveringPassword: true });
        // Supabase calls must not run inside this callback, so defer the check
        setTimeout(() => refreshAdmin(!!session), 0);
      });
    }
    try {
      const session = await getSession();
      set({ session, user: session?.user ?? null, loading: false });
      refreshAdmin(!!session);
    } catch {
      set({ loading: false });
    }
  },

  finishPasswordRecovery: () => set({ recoveringPassword: false }),

  signOut: async () => {
    await signOut();
    set({ session: null, user: null, isAdmin: false });
  },
}));

async function refreshAdmin(signedIn: boolean) {
  useAuthStore.setState({ isAdmin: signedIn ? await checkIsAdmin() : false });
}

// Name for greetings: the name given at sign-up, else the start of the email
export function displayName(user: User | null) {
  if (!user) return null;
  return (user.user_metadata?.full_name as string | undefined)?.trim() || user.email?.split('@')[0] || null;
}
