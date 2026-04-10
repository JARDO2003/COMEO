// ============================================================
// SYSCOHADA — Service Worker v2.0
// Cache-first strategy + offline support complet
// ============================================================

const APP_NAME = 'SYSCOHADA';
const CACHE_VERSION = 'v2.0.0';
const CACHE_STATIC = `${APP_NAME}-static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `${APP_NAME}-dynamic-${CACHE_VERSION}`;
const CACHE_FONTS = `${APP_NAME}-fonts-${CACHE_VERSION}`;

// Fichiers à mettre en cache immédiatement à l'installation
const STATIC_ASSETS = [
  '/index.html',
  '/J.html',
  '/manifest.json',
  '/sw.js',
  '/images/icon-72.png',
  '/images/icon-96.png',
  '/images/icon-128.png',
  '/images/icon-144.png',
  '/images/icon-152.png',
  '/images/icon-192.png',
  '/images/icon-384.png',
  '/images/icon-512.png',
  '/images/u.jpg'
];

// Domaines à mettre en cache dynamiquement
const CACHEABLE_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ——— INSTALL ———
self.addEventListener('install', event => {
  console.log(`[SW] Installing ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        // Cache chaque fichier individuellement pour éviter l'échec total
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn(`[SW] Could not cache ${url}:`, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting(); // Prend le contrôle immédiatement
      })
  );
});

// ——— ACTIVATE ———
self.addEventListener('activate', event => {
  console.log(`[SW] Activating ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              // Supprime les anciens caches de cette app
              return name.startsWith(APP_NAME) && 
                     name !== CACHE_STATIC && 
                     name !== CACHE_DYNAMIC &&
                     name !== CACHE_FONTS;
            })
            .map(name => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim(); // Contrôle tous les onglets ouverts
      })
  );
});

// ——— FETCH — Stratégie intelligente ———
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET et les requêtes Firebase
  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebase') || url.hostname.includes('google-analytics')) return;
  if (url.protocol === 'chrome-extension:') return;

  // FONTS — Cache-first avec fallback réseau
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_FONTS).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // ASSETS STATIQUES — Cache-first
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_STATIC).then(cache => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => {
          // Fallback offline pour les pages HTML
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // AUTRES REQUÊTES — Network-first avec fallback cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && url.origin === self.location.origin) {
          caches.open(CACHE_DYNAMIC).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // Page offline générique pour les requêtes HTML
          if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// ——— SYNC EN ARRIÈRE-PLAN ———
self.addEventListener('sync', event => {
  if (event.tag === 'sync-interactions') {
    console.log('[SW] Background sync: interactions');
  }
});

// ——— NOTIFICATIONS PUSH (prêt pour extension future) ———
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'SYSCOHADA', {
    body: data.body || 'Mise à jour disponible',
    icon: '/images/icon-192.png',
    badge: '/images/icon-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/index.html' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/index.html')
  );
});

// ——— MESSAGE depuis la page ———
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
