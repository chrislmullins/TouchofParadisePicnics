const CACHE_NAME = 'static-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .then(fetchRes => {
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request.url, fetchRes.clone());
                return fetchRes;
              });
          });
      })
      .catch(() => {
        // Fallback to offline page if you have one
        return caches.match('/index.html');
      })
  );
});