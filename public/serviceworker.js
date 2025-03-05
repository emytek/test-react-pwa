import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Install Event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Cache static assets (CSS, JS, Images)
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache API responses (JSON, GraphQL, etc.)
registerRoute(
  ({ request }) => request.destination === 'document' || request.destination === 'json',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cache) => {
            if (cache !== 'static-assets' && cache !== 'api-cache') {
              console.log('Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        )
      )
    );
  });

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('app-shell').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/favicon.png',
          '/styles.css',
          '/logo192.png'
        ]);
      })
    );
  });
  