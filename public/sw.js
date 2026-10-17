self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
  
    // Skip cross-origin requests (Google Fonts, Analytics, etc.) to prevent CSP errors
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) {
      return;
    }
  
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  });