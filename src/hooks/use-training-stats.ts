'use client';

import { useMemo } from 'react';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import {
  calculateLongestStreak,
  calculateStreak,
  getMissedRun,
  getTrainedDays,
} from '@/lib/program/training-stats';
import { computeXp, levelInfo } from '@/lib/program/levels';

/** Streak, trained-day and XP stats, derived the same way on every page. */
export function useTrainingStats() {
  const { progress } = useProgress();
  const { startDate, todayDayNumber } = useProgram();

  return useMemo(() => {
    const trainedDays = getTrainedDays(progress, startDate);
    return {
      trainedDays,
      workoutsCompleted: trainedDays.size,
      streak: calculateStreak(trainedDays, todayDayNumber),
      longestStreak: calculateLongestStreak(trainedDays, todayDayNumber),
      missed: getMissedRun(trainedDays, todayDayNumber),
      level: levelInfo(computeXp(progress, trainedDays)),
    };
  }, [progress, startDate, todayDayNumber]);
}
