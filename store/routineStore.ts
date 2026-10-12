import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { cleanEntries, type RoutineEntry } from '../lib/routines';
import { fetchRoutine, saveRoutine, deleteRoutine } from '../lib/supabase/routines';

// The prayer routine, kept like progress and favourites (store/userDataStore.ts):
// - always saved on the device, separately for guests and each account;
// - signed in, also saved to Supabase. On sign-in the account's saved routine
//   wins; if it has none, the routine made as a guest is moved to the account.

type Stored = { entries: RoutineEntry[]; dismissed: boolean };

interface RoutineState extends Stored {
  owner: string; // "guest" or a user id
  setRoutine: (entries: RoutineEntry[]) => void;
  clearRoutine: () => void;
  // "Not now" on the suggestion card
  dismissSuggestions: () => void;
}

const GUEST = 'guest';
const storageKey = (owner: string) => `ave-routine-${owner}`;

async function readStored(owner: string): Promise<Stored> {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(storageKey(owner))) ?? '{}');
    return { entries: cleanEntries(parsed.entries ?? []), dismissed: !!parsed.dismissed };
  } catch {
    return { entries: [], dismissed: false };
  }
}

function persist() {
  const { owner, entries, dismissed } = useRoutineStore.getState();
  AsyncStorage.setItem(storageKey(owner), JSON.stringify({ entries, dismissed })).catch(() => {});
}

const remote = (write: () => Promise<void>) => {
  if (useRoutineStore.getState().owner !== GUEST) {
    write().catch((error) => console.log('Routine sync failed:', error?.message));
  }
};

export const useRoutineStore = create<RoutineState>((set) => ({
  owner: GUEST,
  entries: [],
  dismissed: false,

  setRoutine: (entries) => {
    const cleaned = cleanEntries(entries);
    set({ entries: cleaned });
    persist();
    remote(() => saveRoutine(cleaned));
  },

  clearRoutine: () => {
    set({ entries: [] });
    persist();
    remote(() => deleteRoutine());
  },

  dismissSuggestions: () => {
    set({ dismissed: true });
    persist();
  },
}));

async function switchOwner(userId: string | null) {
  if (!userId) {
    useRoutineStore.setState({ owner: GUEST, ...(await readStored(GUEST)) });
    return;
  }

  const [account, guest] = await Promise.all([readStored(userId), readStored(GUEST)]);
  const local = account.entries.length ? account.entries : guest.entries;
  useRoutineStore.setState({
    owner: userId,
    entries: local,
    dismissed: account.dismissed || guest.dismissed,
  });
  persist();
  if (guest.entries.length) AsyncStorage.removeItem(storageKey(GUEST)).catch(() => {});

  try {
    const saved = await fetchRoutine();
    if (useRoutineStore.getState().owner !== userId) return;
    if (saved && saved.length) {
      useRoutineStore.setState({ entries: cleanEntries(saved) });
      persist();
    } else if (local.length) {
      await saveRoutine(local);
    }
  } catch (error: any) {
    // Offline, or the table isn't set up yet: keep the device copy
    console.log('Could not sync the routine:', error?.message);
  }
}

// Called once from the root layout
let started = false;
export function startRoutineSync() {
  if (started) return;
  started = true;
  let queue = Promise.resolve();
  const enqueue = (userId: string | null) => {
    queue = queue.then(() => switchOwner(userId));
  };
  let currentUserId = useAuthStore.getState().user?.id ?? null;
  enqueue(currentUserId);
  useAuthStore.subscribe((state) => {
    const nextUserId = state.user?.id ?? null;
    if (nextUserId === currentUserId) return;
    currentUserId = nextUserId;
    enqueue(nextUserId);
  });
}
