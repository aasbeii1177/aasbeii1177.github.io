// staff/sw.js
const CACHE_NAME = 'tawelty-staff-v2'; // Updated version
const ASSETS = [
  './',                
  './index.html',      
  './manifest.json',   
  '../logo.jpeg',      
  'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap'
];

// 1. INSTALL
self.addEventListener('install', (evt) => {
  self.skipWaiting(); // Force the new version to take over immediately
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE (Clean old caches)
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. FETCH (NETWORK FIRST, FALLBACK TO CACHE)
self.addEventListener('fetch', (evt) => {
  // Ignore Firebase database calls
  if (evt.request.url.includes('firestore') || evt.request.url.includes('googleapis')) {
    return;
  }
  
  evt.respondWith(
    fetch(evt.request)
      .then((networkResponse) => {
        // If internet works, save the newest version to cache and show it
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(evt.request.url, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If internet is down, load from the offline cache
        return caches.match(evt.request);
      })
  );
});
