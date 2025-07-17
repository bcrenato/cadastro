const CACHE_NAME = 'cadastro-app-v1';
const urlsToCache = [
  '/cadastro/index.html',
  '/cadastro/login.html',
  '/cadastro/style.css',
  '/cadastro/app.js',
  '/cadastro/manifest.json',
  '/cadastro/icons/icon-192x192.png',
  '/cadastro/icons/icon-512x512.png'
];

// Instala e salva no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Responde com cache se offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
