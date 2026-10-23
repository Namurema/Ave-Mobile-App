import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { fetchAccess, type Access } from "../lib/billing";

// The signed-in account's free trial and subscription, from the server
// (public.access_status). Refreshed on sign-in and after a payment.
interface AccessState {
  access: Access | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useAccessStore = create<AccessState>((set) => ({
  access: null,
  loading: false,
  refresh: async () => {
    if (!useAuthStore.getState().session) {
      set({ access: null, loading: false });
      return;
    }
    set({ loading: true });
    const access = await fetchAccess();
    set({ access, loading: false });
  },
}));

// Called once from the root layout
let started = false;
export function startAccessSync() {
  if (started) return;
  started = true;
  let userId = useAuthStore.getState().user?.id ?? null;
  useAccessStore.getState().refresh();
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") useAccessStore.getState().refresh();
    });
  }
  useAuthStore.subscribe((state) => {
    const next = state.user?.id ?? null;
    if (next === userId) return;
    userId = next;
    useAccessStore.getState().refresh();
  });
}
