'use client';

import { useEffect } from 'react';
// Imported for its side effect: starts listening for the browser's install prompt as early as possible.
import '@/lib/pwa-install';

/** Registers the offline service worker in production builds only (dev servers change too often to cache). */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is an enhancement; the app works without it.
    });
  }, []);
  return null;
}
