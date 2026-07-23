'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { resolveWorkout, PROGRAM_LENGTH_DAYS } from '@/lib/program/program';
import { daysBetween, clamp, parseDateKey } from '@/lib/utils';
import type { ResolvedWorkout } from '@/lib/types';

/** Everything a page needs to know about "today" in the user's 365-day program. */
export function useProgram() {
  const { profile } = useAuth();

  return useMemo(() => {
    const startDate = profile?.program_start_date ? parseDateKey(profile.program_start_date) : new Date();
    const rawDay = daysBetween(startDate, new Date()) + 1;
    const todayDayNumber = clamp(rawDay, 1, PROGRAM_LENGTH_DAYS);

    const getWorkout = (dayNumber: number): ResolvedWorkout =>
      resolveWorkout(clamp(dayNumber, 1, PROGRAM_LENGTH_DAYS), startDate);

    return {
      startDate,
      todayDayNumber,
      totalDays: PROGRAM_LENGTH_DAYS,
      getWorkout,
      today: getWorkout(todayDayNumber),
    };
  }, [profile?.program_start_date]);
}
