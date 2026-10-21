// Ave service worker: makes the app installable and lets it open offline.
//
// - Pages: network first, falling back to the cached app shell when offline.
// - App code (/_expo/static, hashed file names): cache first.
// - Supabase requests are left alone: the app has a built-in copy of the
//   prayers (lib/supabase/queries.ts), and forwarding cross-origin requests
//   through the worker is a known source of failures in Safari on iOS.
// Bump CACHE_VERSION to drop everything cached by an older version.

const CACHE_VERSION = "v2";
const SHELL_CACHE = `ave-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `ave-static-${CACHE_VERSION}`;

const SHELL_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const current = [SHELL_CACHE, STATIC_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !current.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(fallbackUrl ?? request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(fallbackUrl ?? request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Every route is the same single-page app, so cache one copy of the shell
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE, "/index.html"));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_expo/static/")) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest") {
      event.respondWith(networkFirst(request, SHELL_CACHE));
    }
    return;
  }
});

// Prayer reminders, sent by supabase/functions/send-reminders
self.addEventListener("push", (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(message.title || "Ave", {
      body: message.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: message.tag,
      data: { url: message.url || "/home" },
    })
  );
});

// Tapping a reminder opens its prayer, in the open app if there is one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/home";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("focus" in client) {
          if ("navigate" in client) await client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })()
  );
});
