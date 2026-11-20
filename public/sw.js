/*
 * FORGE Protocol service worker — deliberately conservative.
 *
 *  - Build assets (/_next/static, content-hashed) and images: cache-first.
 *  - Page navigations: network-first; the last good copy of each page is
 *    kept so the app still opens offline, with /offline as the fallback.
 *  - Everything else — Supabase API calls, auth routes, RSC/data
 *    requests, other origins — is never touched, so data is always live.
 *
 * Bump VERSION to drop every old cache on the next visit.
 */
const VERSION = 'v1';
const STATIC_CACHE = `forge-static-${VERSION}`;
const PAGE_CACHE = `forge-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/')
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/auth/') || url.pathname.startsWith('/api/')) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Only keep real pages — never redirects (e.g. to /login) or errors.
          if (response.ok && response.type === 'basic' && !response.redirected) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          const cached = await caches.match(request, { ignoreSearch: false });
          return cached || (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
  }
});
