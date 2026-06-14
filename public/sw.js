/**
 * Scentral Service Worker
 * Using Workbox via CDN for simplicity in dev/production without complex bundling.
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  const { registerRoute } = workbox.routing;
  const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;

  // Cache Supabase API calls
  registerRoute(
    ({ url }) => url.hostname === 'lrkdwobnemczvhpixpky.supabase.co',
    new StaleWhileRevalidate({
      cacheName: 'supabase-data',
      plugins: [
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    })
  );

  // Cache Fragrance Images
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'fragrance-images',
      plugins: [
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    })
  );

  // Default caching for pages
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new StaleWhileRevalidate({
      cacheName: 'pages-cache',
    })
  );
} else {
  console.log('Workbox could not be loaded.');
}
