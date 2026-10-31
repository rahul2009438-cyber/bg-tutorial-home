// B.G. TUTORIAL HOME - AUTOMATIC CACHE PURGE & SERVICE WORKER UNINSTALLER
// Version: 2026-10-31-PURGE-ALL

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // 1. Delete ALL cache storage versions
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[SW Purge] Deleting cache storage:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      // 2. Unregister this service worker from the client's browser
      return self.registration.unregister();
    }).then(() => {
      // 3. Claim all clients and notify them to refresh
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url && 'navigate' in client) {
          client.navigate(client.url);
        }
      });
    })
  );
});

// Passthrough network-only: Never cache, never intercept
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
