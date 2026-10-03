import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { dayString, logId, splitLogId } from '../lib/progress';
import {
  fetchLog,
  insertLog,
  deleteLog,
  fetchFavourites,
  insertFavourites,
  deleteFavourite,
} from '../lib/supabase/userData';

// Prayer progress and favourites.
// - Always saved on the device, so they work offline and without an account.
// - Guests and each account have separate device copies, so signing out on a
//   shared phone hides the account's data.
// - Signed in, every change is also saved to Supabase, and signing in merges
//   anything saved as a guest into the account.

type StoredData = { log: string[]; favourites: string[] };

interface UserDataState {
  owner: string; // "guest" or a user id
  log: Set<string>; // "YYYY-MM-DD|item-key"
  favourites: string[]; // newest first
  syncing: boolean;
  markPrayed: (key: string) => void;
  unmarkPrayed: (key: string) => void;
  toggleFavourite: (key: string) => void;
}

const GUEST = 'guest';
const storageKey = (owner: string) => `ave-userdata-${owner}`;

async function readStored(owner: string): Promise<StoredData> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(owner));
    const parsed = raw ? JSON.parse(raw) : {};
    return { log: parsed.log ?? [], favourites: parsed.favourites ?? [] };
  } catch {
    return { log: [], favourites: [] };
  }
}

function persist() {
  const { owner, log, favourites } = useUserDataStore.getState();
  AsyncStorage.setItem(storageKey(owner), JSON.stringify({ log: [...log], favourites })).catch(() => {});
}

const signedIn = () => useUserDataStore.getState().owner !== GUEST;

// Remote writes are best effort: the device copy is the source of truth until
// the next sign-in sync uploads anything that didn't reach Supabase
const remote = (write: () => Promise<void>) => {
  if (signedIn()) write().catch((error) => console.log('Sync failed:', error?.message));
};

export const useUserDataStore = create<UserDataState>((set, get) => ({
  owner: GUEST,
  log: new Set(),
  favourites: [],
  syncing: false,

  markPrayed: (key) => {
    const day = dayString();
    const id = logId(day, key);
    if (get().log.has(id)) return;
    set({ log: new Set(get().log).add(id) });
    persist();
    remote(() => insertLog([{ item_key: key, prayed_on: day }]));
  },

  unmarkPrayed: (key) => {
    const day = dayString();
    const log = new Set(get().log);
    if (!log.delete(logId(day, key))) return;
    set({ log });
    persist();
    remote(() => deleteLog({ item_key: key, prayed_on: day }));
  },

  toggleFavourite: (key) => {
    const { favourites } = get();
    if (favourites.includes(key)) {
      set({ favourites: favourites.filter((k) => k !== key) });
      persist();
      remote(() => deleteFavourite(key));
    } else {
      set({ favourites: [key, ...favourites] });
      persist();
      remote(() => insertFavourites([key]));
    }
  },
}));

// Switch to the guest's or an account's data, merging guest data into the
// account and syncing with Supabase
async function switchOwner(userId: string | null) {
  if (!userId) {
    const guest = await readStored(GUEST);
    useUserDataStore.setState({ owner: GUEST, log: new Set(guest.log), favourites: guest.favourites });
    return;
  }

  const [account, guest] = await Promise.all([readStored(userId), readStored(GUEST)]);
  const log = new Set([...account.log, ...guest.log]);
  const favourites = [...new Set([...guest.favourites, ...account.favourites])];
  useUserDataStore.setState({ owner: userId, log, favourites, syncing: true });
  persist();
  // Guest data now belongs to the account
  AsyncStorage.removeItem(storageKey(GUEST)).catch(() => {});

  try {
    const [remoteLog, remoteFavourites] = await Promise.all([fetchLog(), fetchFavourites()]);
    // Signed out or switched account while loading
    if (useUserDataStore.getState().owner !== userId) return;

    const remoteIds = new Set(remoteLog.map((e) => logId(e.prayed_on, e.item_key)));
    const localOnly = [...log].filter((id) => !remoteIds.has(id));
    const favouritesToUpload = favourites.filter((key) => !remoteFavourites.includes(key));
    await Promise.all([
      insertLog(localOnly.map((id) => {
        const { day, key } = splitLogId(id);
        return { item_key: key, prayed_on: day };
      })),
      insertFavourites(favouritesToUpload),
    ]);

    const current = useUserDataStore.getState();
    useUserDataStore.setState({
      log: new Set([...current.log, ...remoteIds]),
      favourites: [...new Set([...current.favourites, ...remoteFavourites])],
    });
    persist();
  } catch (error: any) {
    // Offline, or the tables aren't set up yet: keep using the device copy
    console.log('Could not sync progress and favourites:', error?.message);
  } finally {
    useUserDataStore.setState({ syncing: false });
  }
}

// Called once from the root layout: load the right data now and whenever the
// signed-in account changes
let started = false;
export function startUserDataSync() {
  if (started) return;
  started = true;
  // Run switches one at a time, in order, so a slow load can't overwrite a
  // newer one
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

// Selectors
export const usePrayedToday = (key: string) =>
  useUserDataStore((state) => state.log.has(logId(dayString(), key)));

export const useIsFavourite = (key: string) =>
  useUserDataStore((state) => state.favourites.includes(key));
