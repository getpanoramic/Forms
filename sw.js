const CACHE_NAME = 'curve-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener('fetch', (event) => {
  // Check if this is a POST request from the Share Target
  if (event.request.method === 'POST' && event.request.url.includes('/')) {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('csv_file');
      
      // Store the file in cache so the main page can grab it after redirect
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/__shared_csv__', new Response(await file.text()));
      
      // Redirect to the main page to process the file
      return Response.redirect('/', 303);
    })());
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
