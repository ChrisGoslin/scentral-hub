// Scentral Offline-First Service Worker
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

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
