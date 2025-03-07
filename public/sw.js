const CACHE_NAME = 'bevcan-v1';

// Install event: Cache necessary files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const coreUrls = [
        '/',                  // Root page
        '/index.html',        // Main HTML file
        '/sw.js',             // Service Worker itself
        '/manifest.json',     // PWA manifest
        '/favicon.png',       // Favicon
        '/images/logo/wyze.png', // Explicitly cache logo 
      ];

      try {
        // Fetch `index.html` to get latest asset references
        const response = await fetch('/index.html');
        const text = await response.text();

        // Extract built JS & CSS from index.html
        const assetMatches = [...text.matchAll(/\/assets\/[a-zA-Z0-9\-_]+\.(?:js|css|png|jpg|svg)/g)];
        const assetUrls = assetMatches.map(match => match[0]);

        // Add extracted asset URLs to the cache list
        coreUrls.push(...assetUrls);

        console.log('Caching assets:', coreUrls);
        return cache.addAll(coreUrls);
      } catch (error) {
        console.error('Error caching assets:', error);
      }
    })
  );
  self.skipWaiting();
});

// Activate Service Worker: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/images/logo/wyze.png'); // Serve logo if offline ✅
        }
        return caches.match('/index.html');
      });
    })
  );
});
