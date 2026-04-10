// ============================================================
// SYSCOHADA — Service Worker v2.0.1
// Cache-first strategy + offline support complet
// FIX: Response clone before body is consumed
// ============================================================

const APP_NAME = 'COMEO';
const CACHE_VERSION = 'v2.0.1';
const CACHE_STATIC = `${APP_NAME}-static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `${APP_NAME}-dynamic-${CACHE_VERSION}`;
const CACHE_FONTS = `${APP_NAME}-fonts-${CACHE_VERSION}`;

// Fichiers à mettre en cache immédiatement à l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ——— INSTALL ———
self.addEventListener('install', event => {
  console.log(`[SW] Installing ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn(`[SW] Could not cache ${url}:`, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
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
            .filter(name =>
              name.startsWith(APP_NAME) &&
              name !== CACHE_STATIC &&
              name !== CACHE_DYNAMIC &&
              name !== CACHE_FONTS
            )
            .map(name => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// ——— FETCH — Stratégie intelligente ———
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET, Firebase, analytics, extensions
  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebase') || url.hostname.includes('google-analytics')) return;
  if (url.protocol === 'chrome-extension:') return;

  // FONTS — Cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_FONTS).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            // ✅ FIX: clone AVANT toute consommation
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached || new Response('', { status: 503 }));
        })
      )
    );
    return;
  }

  // ASSETS STATIQUES — Cache-first avec fallback réseau
  const isStaticAsset = STATIC_ASSETS.some(asset =>
    url.pathname === asset || url.pathname === asset.replace(/^\//, '')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          // ✅ FIX: clone AVANT toute consommation
          if (response && response.ok) {
            caches.open(CACHE_STATIC).then(cache => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => {
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // AUTRES REQUÊTES — Network-first avec fallback cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // ✅ FIX: vérifier que la réponse est valide avant de cloner
        if (response && response.ok && response.status < 400 && url.origin === self.location.origin) {
          const responseClone = response.clone();
          caches.open(CACHE_DYNAMIC).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // Fallback HTML
          const acceptHeader = request.headers.get('accept') || '';
          if (acceptHeader.includes('text/html')) {
            return caches.match('/index.html');
          }
          // Réponse vide pour éviter l'erreur "Failed to convert value to Response"
          return new Response('', {
            status: 503,
            statusText: 'Service Unavailable'
          });
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

// ——— NOTIFICATIONS PUSH ———
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
