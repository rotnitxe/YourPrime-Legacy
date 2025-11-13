const CACHE_NAME = 'yourprime-v17';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.js',
  '/manifest.json',
  '/favicon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;700&family=Roboto+Condensed:wght@400;700&family=Great+Vibes&family=Tahoma:wght@400;700&family=Courier+Prime:wght@400;700&display=swap',

  // Google Drive API scripts
  'https://apis.google.com/js/api.js',
  'https://accounts.google.com/gsi/client',

  // Audio files
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/beep.mp3',
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/toggle.mp3',
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/click.mp3',
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/switch.mp3',
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/tada.mp3',
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/pop.mp3',
  'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/success.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching essential assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache essential assets during install:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});