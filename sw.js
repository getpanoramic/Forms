const CACHE_NAME = 'curve-v3';

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
  // Check if the request is a POST to our specific subfolder
  if (event.request.method === 'POST' && event.request.url.includes('/Forms/')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('csv_file');
        if (file) {
          const cache = await caches.open(CACHE_NAME);
          const text = await file.text();
          // Store it with the subfolder path
          await cache.put('/Forms/__shared_csv__', new Response(text));
        }
        // Redirect back to the subfolder index
        return Response.redirect('/Forms/', 303);
      } catch (err) {
        return fetch(event.request);
      }
    })());
  } else {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
