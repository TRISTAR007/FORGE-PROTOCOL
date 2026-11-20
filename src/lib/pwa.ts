/**
 * Removes the service worker's cached pages. Called on sign-out and
 * account deletion so the next person on a shared device can't open a
 * cached copy of someone else's dashboard while offline.
 */
export async function clearOfflinePageCache() {
  if (typeof caches === 'undefined') return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('forge-pages-')).map((k) => caches.delete(k)));
  } catch {
    // Cache API unavailable — nothing cached to clear.
  }
}
