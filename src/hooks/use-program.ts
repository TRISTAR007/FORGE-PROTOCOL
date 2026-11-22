'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { resolveWorkout, PROGRAM_LENGTH_DAYS } from '@/lib/program/program';
import { daysBetween, clamp, parseDateKey } from '@/lib/utils';
import { safeExercises } from '@/lib/program/safety';
import type { Limitation, ResolvedWorkout } from '@/lib/types';

/** Everything a page needs to know about "today" in the user's 365-day program. */
export function useProgram() {
  const { profile } = useAuth();
  const { settings, progress } = useProgress();
  const startKey = profile?.program_start_date;
  const mode = settings.trainingMode;
  // Joined into a string so the memo below only re-runs when the answers change.
  const limitKey = (progress.plan?.limitations ?? []).join(',');

  return useMemo(() => {
    const startDate = startKey ? parseDateKey(startKey) : new Date();
    const rawDay = daysBetween(startDate, new Date()) + 1;
    const todayDayNumber = clamp(rawDay, 1, PROGRAM_LENGTH_DAYS);

    const limitations = (limitKey ? limitKey.split(',') : []) as Limitation[];
    const getWorkout = (dayNumber: number): ResolvedWorkout => {
      const workout = resolveWorkout(clamp(dayNumber, 1, PROGRAM_LENGTH_DAYS), startDate, mode);
      // Injury-friendly swaps from the plan questionnaire.
      return limitations.length ? { ...workout, exercises: safeExercises(workout.exercises, limitations, mode) } : workout;
    };

    return {
      startDate,
      todayDayNumber,
      totalDays: PROGRAM_LENGTH_DAYS,
      mode,
      getWorkout,
      today: getWorkout(todayDayNumber),
    };
  }, [startKey, mode, limitKey]);
}
