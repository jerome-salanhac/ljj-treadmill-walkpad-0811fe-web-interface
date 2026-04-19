// Service worker minimal : nécessaire pour déclencher le prompt d'installation PWA.
// Met en cache le strict minimum pour fonctionner hors-ligne.

const CACHE_NAME = 'tapis-ljj-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Stratégie : cache-first pour les assets statiques, réseau sinon.
  // On n'intercepte pas les requêtes BLE (elles ne passent pas par fetch de toute façon).
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
