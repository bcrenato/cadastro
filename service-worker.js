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

// Clique em notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/cadastro/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// CACHE OFFLINE
const CACHE_NAME = 'cadastro-app-v3';
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
  self.skipWaiting(); // 🔥 ativa imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      }))
    ).then(() => self.clients.claim()) // 🔥 assume abas abertas
  );
});

// Corrigido: não forçar sempre index.html
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // apenas GET

  if (urlsToCache.includes(new URL(event.request.url).pathname)) {
    // Arquivos cacheados (CSS, JS, HTML offline)
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  } else {
    // Para navegação e outros arquivos, vai direto à rede
    event.respondWith(fetch(event.request).catch(() => caches.match('/cadastro/index.html')));
  }
});
