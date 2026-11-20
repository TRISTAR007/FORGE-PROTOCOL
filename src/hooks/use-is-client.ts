'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/** False during server rendering and hydration, true afterwards — for browser-only UI. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
