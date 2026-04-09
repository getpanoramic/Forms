const CACHE = 'curve-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Handle the incoming share POST request
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (e.request.method === 'POST' && url.pathname === '/Forms/') {
    e.respondWith((async () => {
      const formData = await e.request.formData();
      const file = formData.get('csv_file');

      if (file) {
        // Store the file temporarily so the page can pick it up
        const cache = await caches.open(CACHE);
        await cache.put('/__shared_csv__', new Response(file, {
          headers: { 'Content-Type': 'text/csv' }
        }));
      }

      // Redirect to the app
      return Response.redirect('/Forms/', 303);
    })());
  }
});
