/**
 * nota. Service Worker
 * Using Workbox via CDN for simplicity in dev/production without complex bundling.
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const CACHE_VERSION = 'v1';
const SUPABASE_CACHE = `supabase-data-${CACHE_VERSION}`;
const IMAGES_CACHE = `fragrance-images-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-cache-${CACHE_VERSION}`;
const OFFLINE_CACHE = `offline-fallback-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const CURRENT_CACHES = [SUPABASE_CACHE, IMAGES_CACHE, PAGES_CACHE, OFFLINE_CACHE];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_URL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

if (workbox) {
  const { registerRoute, setCatchHandler } = workbox.routing;
  const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;

  // Cache Supabase API calls
  registerRoute(
    ({ url }) => url.hostname === 'lrkdwobnemczvhpixpky.supabase.co',
    new StaleWhileRevalidate({
      cacheName: SUPABASE_CACHE,
      plugins: [
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    })
  );

  // Cache Fragrance Images
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: IMAGES_CACHE,
      plugins: [
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    })
  );

  // Default caching for pages
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new StaleWhileRevalidate({
      cacheName: PAGES_CACHE,
    })
  );

  // Offline fallback when both network and cache miss on a navigation
  setCatchHandler(async ({ request }) => {
    if (request.mode === 'navigate') {
      const cache = await caches.open(OFFLINE_CACHE);
      return (await cache.match(OFFLINE_URL)) || Response.error();
    }
    return Response.error();
  });
} else {
  console.log('Workbox could not be loaded.');
}

// Push Notification Listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
