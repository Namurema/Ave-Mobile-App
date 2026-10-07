import { useAuthStore } from '../store/authStore';
import { useAuthDialog } from '../store/authDialogStore';
import { useUserDataStore } from '../store/userDataStore';

// For actions worth keeping across devices (saving a favourite, marking a
// prayer as prayed): signed-in users just do it; guests first see the sign-in
// pop-up, where they can sign in or choose "Not now" to do it on this device.
export function withAccountPrompt(action: () => void) {
  const { session } = useAuthStore.getState();
  const { skippedThisSession } = useAuthDialog.getState();
  if (session || skippedThisSession) {
    action();
    return;
  }
  useAuthDialog.setState({ view: 'signIn', redirectTo: null, pendingAction: action });
}

// "Not now": remember the choice for this session and do the action locally
export function continueWithoutAccount() {
  const { pendingAction } = useAuthDialog.getState();
  useAuthDialog.setState({ skippedThisSession: true });
  useAuthDialog.getState().close();
  pendingAction?.();
}

// After signing in, wait until the account's progress and favourites are
// loaded, so the action is saved to the account and not the guest copy
export function runWhenAccountReady(userId: string, action: () => void) {
  if (useUserDataStore.getState().owner === userId) {
    action();
    return;
  }
  const unsubscribe = useUserDataStore.subscribe((state) => {
    if (state.owner !== userId) return;
    unsubscribe();
    action();
  });
}
