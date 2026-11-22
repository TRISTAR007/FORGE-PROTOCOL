'use client';

import { useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { raidHit } from '@/lib/community/raid';

/**
 * Returns `hit(damage)`: every workout, quest and boss win also chips away at
 * the weekly community raid boss. Silent by design — if the person has no
 * community profile/guild yet, or the raid tables aren't set up, nothing happens.
 */
export function useRaidHit() {
  const supabase = useMemo(() => createClient(), []);
  return useCallback(
    (damage: number) => {
      if (damage <= 0) return;
      void raidHit(supabase, damage).then(
        () => undefined,
        () => undefined
      );
    },
    [supabase]
  );
}
