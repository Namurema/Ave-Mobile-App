import { create } from 'zustand';

// The sign-in pop-up (components/auth/AuthDialog.tsx), opened from anywhere
export type AuthView = 'signIn' | 'signUp' | 'forgot' | 'confirmEmail';

interface AuthDialogState {
  view: AuthView | null;
  // Where to go after signing in, e.g. Home from the first screen
  redirectTo: string | null;
  open: (view?: AuthView, redirectTo?: string) => void;
  show: (view: AuthView) => void;
  close: () => void;
}

export const useAuthDialog = create<AuthDialogState>((set) => ({
  view: null,
  redirectTo: null,
  open: (view = 'signIn', redirectTo) => set({ view, redirectTo: redirectTo ?? null }),
  show: (view) => set({ view }),
  close: () => set({ view: null, redirectTo: null }),
}));
