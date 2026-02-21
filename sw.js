const CACHE_NAME = 'tawelty-customer-v6'; 
const ASSETS = [
  './',
  './index.html',
  './index_ar.html',
  './manifest.json',
  './logo.jpeg',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;800&display=swap'
];

// 1. Install & Skip Waiting (Force the new worker to install instantly)
self.addEventListener('install', (evt) => {
  self.skipWaiting(); 
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate & Claim Clients (Aggressively kick out the old version)
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      // Take control of all open tabs/apps immediately
      return self.clients.claim(); 
    })
  );
});

// 3. Network-First Fetch Strategy (Always try the internet first, fallback to cache ONLY if offline)
self.addEventListener('fetch', (evt) => {
  // Never cache Firebase database calls
  if (evt.request.url.includes('firestore') || evt.request.url.includes('googleapis')) return;
  
  evt.respondWith(
    fetch(evt.request)
      .then((networkResponse) => {
        // We got a good response from the internet, update the cache
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(evt.request.url, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // The internet failed (user is offline), so serve the cached version
        return caches.match(evt.request);
      })
  );
});
