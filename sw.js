/* Bhakti — Service Worker
   Cache-first for local assets so the band works offline.
   Network-first for the (small set of) external tiles/scripts. */

const CACHE = "bhakti-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./shlokas.js",
  "./logo.png",
  "./favicon.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // App shell: cache-first, fall back to network, then to cached index.
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => caches.match("./index.html"));
      })
    );
    return;
  }

  // Cross-origin (CDN scripts, map tiles): network-first, cache as fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.destination === "script" || req.destination === "style"
                       || req.destination === "image" || req.destination === "font")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
