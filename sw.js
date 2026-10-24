// B.G. Tutorial Home Service Worker (Offline Cache & PWA Support - v3)
const CACHE_NAME = 'bg-tutorial-cache-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  './images/teacher-poster.jpg',
  './images/banner-board.jpg',
  './images/visiting-card.jpg',
  './images/teacher-portrait.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful image and static asset responses
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          (event.request.destination === 'image' || event.request.url.match(/\.(jpg|jpeg|png|svg|webp|css|js)$/i))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ONLY fallback to index.html for page navigation requests!
        if (event.request.mode === 'navigate' || event.request.destination === 'document') {
          return caches.match('./index.html') || caches.match('/');
        }
        // Do NOT return HTML for images or assets!
        return new Response('Asset not available offline', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});
