const CACHE_NAME = 'curve-v4'; // Updated version
const ASSETS = [
  '/Forms/',
  '/Forms/index.html',
  '/Forms/manifest.json',
  '/Forms/js/config.js',
  '/Forms/js/dataProcessor.js',
  '/Forms/js/uiUtils.js',
  '/Forms/js/api.js',
  '/Forms/js/db.js',
  '/Forms/js/charts.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.includes('/Forms/')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('csv_file');
        if (file) {
          const cache = await caches.open(CACHE_NAME);
          const text = await file.text();
          await cache.put('/Forms/__shared_csv__', new Response(text));
        }
        return Response.redirect('/Forms/', 303);
      } catch (err) {
        return fetch(event.request);
      }
    })());
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
});
