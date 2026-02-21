const CACHE_NAME = 'tawelty-stable-v1'; 
const ASSETS = [
  './',
  './index.html',
  './index_ar.html',
  './manifest.json',
  './logo.jpeg',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

self.addEventListener('install', (evt) => {
  self.skipWaiting(); 
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim(); 
    })
  );
});

self.addEventListener('fetch', (evt) => {
  // Never cache database requests
  if (evt.request.url.includes('firestore') || evt.request.url.includes('googleapis') || evt.request.url.includes('firebase')) return;
  
  evt.respondWith(
    fetch(evt.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(evt.request.url, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(evt.request))
  );
});
