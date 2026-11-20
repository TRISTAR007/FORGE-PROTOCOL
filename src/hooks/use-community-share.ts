'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getMyProfile, shareWorkout } from '@/lib/community/api';
import type { SessionResult } from '@/components/workout/session-player';

/** Posts a finished workout card to #victories. Resolves false if the person hasn't joined the community. */
export function useCommunityShare() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  return useCallback(
    async (result: SessionResult, title: string, coachId: string): Promise<boolean> => {
      const { data: profile, error } = await getMyProfile(supabase, user.id);
      if (error || !profile) return false;
      const { error: shareError } = await shareWorkout(supabase, user.id, {
        title,
        sets: result.sets,
        minutes: Math.max(1, Math.round(result.durationSec / 60)),
        reps: result.reps.flat().reduce<number>((s, r) => s + (r ?? 0), 0),
        coachId,
      });
      return !shareError;
    },
    [supabase, user.id]
  );
}
