// self.addEventListener('install', (event) => {
//     self.skipWaiting();
//   });
  
//   self.addEventListener('activate', (event) => {
//     event.waitUntil(clients.claim());
//   });
  
//   self.addEventListener('fetch', (event) => {
//     // Only handle GET requests
//     if (event.request.method !== 'GET') return;
  
//     // Skip cross-origin requests (Google Fonts, Analytics, etc.) to prevent CSP errors
//     const url = new URL(event.request.url);
//     if (url.origin !== location.origin) {
//       return;
//     }
  
//     event.respondWith(
//       caches.match(event.request).then((cachedResponse) => {
//         return cachedResponse || fetch(event.request);
//       })
//     );
//   });

const CACHE_NAME = 'portfolio-v3';

// Install event: skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-First strategy with safety checks
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // BYPASS PDF FILES: Let browser handle Range (206) requests natively
  if (url.pathname.endsWith('.pdf') || event.request.headers.has('range')) {
    return; // Fallback directly to network without SW interception
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (Google Fonts, Analytics, etc.)
  if (url.origin !== location.origin) return;

  // Bypass service worker entirely for APIs, PDFs, or admin routes
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.includes('.pdf') || 
    url.searchParams.has('admin')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Only cache valid, complete responses (status 200). 
        // Skips status 206 partial responses to prevent Cache.put errors.
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails (offline mode)
        return caches.match(event.request);
      })
  );
});