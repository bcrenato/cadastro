const CACHE_NAME = 'igreja-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/relogio/index.html',
  '/icons/church.png',
  '/icons/family.png',
  '/icons/heart.png',
  '/icons/join.png',
  '/icons/retreat.png',
  '/icons/tv.png',
  '/icons/radio.png',
  '/icons/video.png',
  '/icons/articles.png',
  '/logo.png',
  '/banner-leitura.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('⚙️ Service Worker ativado');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});