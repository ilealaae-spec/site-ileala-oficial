// Service Worker DISABLED - Unregister and clear all caches
// This fixes the issue where cached JavaScript prevents updates from loading

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker disabled - unregistering...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Clearing all caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('[SW] All caches cleared, unregistering service worker...');
      return self.registration.unregister();
    })
    .then(() => {
      console.log('[SW] Service worker unregistered successfully');
      return self.clients.claim();
    })
  );
});

// Don't intercept any fetch requests
self.addEventListener('fetch', (event) => {
  // Let all requests go through to the network
  return;
});
