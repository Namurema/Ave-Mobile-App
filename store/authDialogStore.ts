import { create } from 'zustand';

// The sign-in pop-up (components/auth/AuthDialog.tsx), opened from anywhere
export type AuthView = 'signIn' | 'signUp' | 'forgot' | 'confirmEmail';

interface AuthDialogState {
  view: AuthView | null;
  // Where to go after signing in, e.g. Home from the first screen
  redirectTo: string | null;
  // An action waiting on the guest's choice (e.g. saving a favourite). It runs
  // after signing in, or straight away on "Not now".
  pendingAction: (() => void) | null;
  // The guest chose "Not now" once; don't ask again until the app reloads
  skippedThisSession: boolean;
  open: (view?: AuthView, redirectTo?: string) => void;
  show: (view: AuthView) => void;
  close: () => void;
}

export const useAuthDialog = create<AuthDialogState>((set) => ({
  view: null,
  redirectTo: null,
  pendingAction: null,
  skippedThisSession: false,
  open: (view = 'signIn', redirectTo) => set({ view, redirectTo: redirectTo ?? null, pendingAction: null }),
  show: (view) => set({ view }),
  close: () => set({ view: null, redirectTo: null, pendingAction: null }),
}));
