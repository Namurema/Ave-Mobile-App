// Ave service worker: makes the app installable and lets prayers that have
// been opened once work offline.
//
// - Pages: network first, falling back to the cached app shell when offline.
// - App code (/_expo/static, hashed file names): cache first.
// - Prayer text from Supabase: network first, falling back to the last copy.
// Bump CACHE_VERSION to drop everything cached by an older version.

const CACHE_VERSION = "v1";
const SHELL_CACHE = `ave-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `ave-static-${CACHE_VERSION}`;
const DATA_CACHE = `ave-data-${CACHE_VERSION}`;

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
  const current = [SHELL_CACHE, STATIC_CACHE, DATA_CACHE];
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

  // Prayer data (read-only REST queries)
  if (url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/rest/v1/")) {
    event.respondWith(networkFirst(request, DATA_CACHE));
  }
});
