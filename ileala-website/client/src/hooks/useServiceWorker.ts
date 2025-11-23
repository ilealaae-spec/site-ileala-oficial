import { useEffect, useState } from 'react';

/**
 * Hook to register and manage Service Worker for PWA functionality
 */
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if Service Workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);

      // Register Service Worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setIsRegistered(true);
          setRegistration(reg);

          // Check for updates every hour
          setInterval(() => {
            reg.update();
          }, 60 * 60 * 1000);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to reload
                  if (confirm('A new version is available. Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
          setIsRegistered(false);
        });
    } else {
      setIsSupported(false);
    }
  }, []);

  return {
    isSupported,
    isRegistered,
    registration,
  };
}

