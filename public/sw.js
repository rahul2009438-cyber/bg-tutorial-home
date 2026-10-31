// B.G. TUTORIAL HOME - AUTOMATIC HARD CACHE PURGE & SERVICE WORKER SHIELD
// Target Cache Version: bg-tutorial-v8
const CACHE_NAME = 'bg-tutorial-v8';

self.addEventListener('install', (event) => {
  // Immediately activate without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // 1. Iterate through all caches and execute hard purge of any cache not matching 'bg-tutorial-v8'
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW Purge] Deleting outdated cache key:', key);
            return caches.delete(key);
          }
        })
      );
     }).then(() => {
      // 2. Claim all active clients immediately
      return self.clients.claim();
    })
  );
});

// Network-first policy with graceful passthrough: ensures all static chunks load fresh without 404s
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch((err) => {
      // If network fails and request is in current cache, serve it
      return caches.match(event.request);
    })
  );
});
