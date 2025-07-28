// Importa Firebase Messaging para Service Worker (compat) 
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCv6pzl34tyPTARtGxV6g2AJfkrtQeA-xU",
  authDomain: "cadastro-igreja-23042.firebaseapp.com",
  databaseURL: "https://cadastro-igreja-23042-default-rtdb.firebaseio.com",
  projectId: "cadastro-igreja-23042",
  messagingSenderId: "977906864836",
  appId: "1:977906864836:web:1a21a29f4b941ac5aeaf91"
});

const messaging = firebase.messaging();

// 🔔 Notificações em segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensagem recebida:', payload);

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
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/cadastro/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// CACHE OFFLINE
const CACHE_NAME = 'cadastro-app-v4';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
      }))
    ).then(() => self.clients.claim())
  );
});

// ✅ Fetch corrigido para não interferir em navegações
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  // ✅ 1. Se for arquivo HTML (login.html, membros.html etc.), sempre busca da rede primeiro
  if (requestURL.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // ✅ 2. Para navegação raiz (ex: apenas /cadastro/), retorna index.html do cache (modo PWA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/cadastro/index.html')
    );
    return;
  }

  // ✅ 3. Para arquivos estáticos (CSS, JS, ícones), mantém cache-first
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
