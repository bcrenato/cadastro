// Importa Firebase Messaging para Service Worker (compat) 
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Config Firebase - use seu próprio config (igual firebase-config.js)
firebase.initializeApp({
  apiKey: "AIzaSyCv6pzl34tyPTARtGxV6g2AJfkrtQeA-xU",
  authDomain: "cadastro-igreja-23042.firebaseapp.com",
  databaseURL: "https://cadastro-igreja-23042-default-rtdb.firebaseio.com",
  projectId: "cadastro-igreja-23042",
  messagingSenderId: "977906864836",
  appId: "1:977906864836:web:1a21a29f4b941ac5aeaf91"
});

const messaging = firebase.messaging();

// Recebe notificações em segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {};

  const notificationTitle = notification.title || data.title || 'Nova Notificação';
  const notificationBody = notification.body || data.body || '';
  const notificationIcon = notification.icon || '/cadastro/icons/icon-192x192.png';
  const notificationImage = notification.image || data.image || undefined;
  const targetUrl = data.url || notification.click_action || '/cadastro/';

  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    image: notificationImage,
    data: { url: targetUrl }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});







self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/cadastro/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        // Se já estiver aberta em uma aba, foca nela
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // Abre nova aba com a URL da notificação
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});









// SEU CÓDIGO DE CACHE E FETCH (mantido igual ao seu original)
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // Se for navegação (HTML), buscar direto do servidor
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => caches.match('/cadastro/index.html'))
    );
    return;
  }

  // Para outros arquivos (CSS, JS, imagens, etc), usar cache ou rede
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

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
