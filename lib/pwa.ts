import { useEffect, useState } from "react";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web" && typeof window !== "undefined";

export function registerServiceWorker() {
  // Skip in development so the cache never serves stale dev bundles
  if (!isWeb || __DEV__ || !("serviceWorker" in navigator)) return;
  const register = () =>
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("Service worker registration failed:", error);
    });
  // Wait for the page to finish loading so caching doesn't compete with it
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

// ---- Updates ---------------------------------------------------------------
// Each build loads a uniquely named bundle (/_expo/static/js/web/entry-<hash>.js).
// An installed app is usually resumed rather than reloaded, and browsers only
// check for a new service worker about once a day, so compare the running
// bundle with the live index.html whenever the app comes back to the
// foreground, and every 30 minutes while it is open.
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;
const BUNDLE_PATTERN = /\/_expo\/static\/js\/web\/entry-[\w-]+\.js/;
let updateReady = false;
const updateListeners = new Set<() => void>();

async function checkForUpdate() {
  if (updateReady || !navigator.onLine) return;
  navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {});
  try {
    const html = await (await fetch("/index.html", { cache: "no-store" })).text();
    const latest = html.match(BUNDLE_PATTERN)?.[0];
    const running = Array.from(document.scripts).map((s) => s.src).find((src) => BUNDLE_PATTERN.test(src));
    if (latest && running && !running.endsWith(latest)) {
      updateReady = true;
      updateListeners.forEach((listener) => listener());
    }
  } catch {
    // Offline or the server is unreachable: try again next time
  }
}

export function startUpdateChecks() {
  if (!isWeb || __DEV__) return;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForUpdate();
  });
  setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);
  setTimeout(checkForUpdate, 10_000);
}

export function useUpdateReady() {
  const [ready, setReady] = useState(updateReady);
  useEffect(() => {
    const listener = () => setReady(true);
    updateListeners.add(listener);
    return () => {
      updateListeners.delete(listener);
    };
  }, []);
  return ready;
}

// Reloading fetches the new index.html (network first) and its new bundle
export function applyUpdate() {
  window.location.reload();
}

// Chrome/Edge/Android fire `beforeinstallprompt` once the app is installable.
// Keep the event so an Install button can show the native prompt later.
let deferredPrompt: any = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

if (isWeb) {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export function useInstallPrompt() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const userAgent = isWeb ? navigator.userAgent : "";
  const isStandalone =
    isWeb &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true);
  // iPadOS reports itself as a Mac, so also check for touch
  const isIOS =
    /iphone|ipad|ipod/i.test(userAgent) ||
    (isWeb && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(userAgent);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
  };

  return {
    isWeb,
    isStandalone,
    isIOS,
    isAndroid,
    canPrompt: !!deferredPrompt,
    promptInstall,
  };
}
