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


self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  let link = null;

  if (event.notification.data && event.notification.data.link) {
    link = event.notification.data.link;
  } else if (event.notification.click_action) {
    link = event.notification.click_action;
  }

  if (link) {
    event.waitUntil(
      clients.openWindow(link)
    );
  }
});



self.registration.showNotification(payload.notification.title, {
  body: payload.notification.body,
  icon: payload.notification.icon,
  image: payload.notification.image,
  data: payload.data, // link incluso aqui
});







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
