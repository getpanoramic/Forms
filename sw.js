const CACHE_NAME = 'curve-v2';

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST') {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('csv_file');
        if (file) {
          const cache = await caches.open(CACHE_NAME);
          const text = await file.text();
          await cache.put('/__shared_csv__', new Response(text));
        }
        // Use a 303 redirect to turn the POST into a GET
        return Response.redirect('/', 303);
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
