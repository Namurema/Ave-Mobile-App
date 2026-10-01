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
