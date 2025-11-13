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
  'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  'https://actions.google.com/sounds/v1/impacts/crash.ogg',
  'https://actions.google.com/sounds/v1/emergency/beeper_confirm.ogg',
  'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
  'https://actions.google.com/sounds/v1/switches/switch_toggle_on.ogg',
  'https://actions.google.com/sounds/v1/ui/ui_tap_forward.ogg',
  'https://actions.google.com/sounds/v1/ui/ui_tap_reverse.ogg'
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