// Staff App Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('tawelty-staff-v1').then((cache) => cache.addAll([
      './index.html',
      './manifest.json',
      '../logo.jpeg'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
