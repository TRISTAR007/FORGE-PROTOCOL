'use client';

import { useCallback, useSyncExternalStore } from 'react';

const SAME_TAB_EVENT = 'forge-local-storage';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(SAME_TAB_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SAME_TAB_EVENT, onChange);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes a value and notifies every `useLocalStorageValue` reader in this tab. */
export function writeLocalStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode / quota) — callers treat it as best-effort.
  }
  window.dispatchEvent(new Event(SAME_TAB_EVENT));
}

/**
 * Reads a localStorage string reactively. Returns null during server
 * rendering and hydration, so markup always matches the server.
 */
export function useLocalStorageValue(key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  );
  const set = useCallback((next: string | null) => writeLocalStorage(key, next), [key]);
  return [value, set];
}
