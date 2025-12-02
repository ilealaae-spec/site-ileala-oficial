import { useEffect, useState } from 'react';

/**
 * Hook to register and manage Service Worker for PWA functionality
 * DISABLED: Service worker causes caching issues preventing updates
 */
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // DISABLED: Service worker registration disabled to fix caching issues
    console.log('[SW] Service Worker registration DISABLED');
    
    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          console.log('[SW] Unregistering existing service worker');
          reg.unregister();
        });
      });
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            console.log('[SW] Deleting cache:', cacheName);
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  return {
    isSupported,
    isRegistered,
    registration,
  };
}
