// Main Customer sw.js
const CACHE_NAME = 'tawelty-customer-v4'; // Bumped version number
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpeg',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap'
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
    })
  );
});

// NETWORK FIRST STRATEGY
self.addEventListener('fetch', (evt) => {
  if (evt.request.url.includes('firestore') || evt.request.url.includes('googleapis')) return;
  
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
