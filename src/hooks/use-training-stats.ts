'use client';

import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import {
  calculateLongestStreak,
  calculateStreak,
  getMissedRun,
  getTrainedDays,
} from '@/lib/program/training-stats';
import { computeXp, levelInfo, type LevelInfo } from '@/lib/program/levels';
import { computeStats, type StatSheet } from '@/lib/program/stats';
import { questStreak } from '@/lib/program/quests';
import type { ProgressData } from '@/lib/types';
import { todayKey, toDateKey } from '@/lib/utils';

export interface TrainingStats {
  trainedDays: Set<number>;
  workoutsCompleted: number;
  streak: number;
  longestStreak: number;
  missed: ReturnType<typeof getMissedRun>;
  level: LevelInfo;
  stats: StatSheet;
  questStreak: number;
  bossesDefeated: number;
}

/**
 * Shared cache: ~15 components on a screen ask for these stats. Keyed on the
 * progress object (a new object on every change), so the work runs once per
 * change instead of once per component.
 */
const cache = new WeakMap<ProgressData, { key: string; value: TrainingStats }>();

function compute(progress: ProgressData, startDate: Date, todayDayNumber: number, today: string): TrainingStats {
  const trainedDays = getTrainedDays(progress, startDate);
  const level = levelInfo(computeXp(progress, trainedDays));
  return {
    trainedDays,
    workoutsCompleted: trainedDays.size,
    streak: calculateStreak(trainedDays, todayDayNumber),
    longestStreak: calculateLongestStreak(trainedDays, todayDayNumber),
    missed: getMissedRun(trainedDays, todayDayNumber),
    level,
    stats: computeStats(progress, trainedDays.size, level.level),
    questStreak: questStreak(progress.quests ?? {}, today),
    bossesDefeated: Object.values(progress.bosses ?? {}).filter((b) => b.defeatedOn).length,
  };
}

/** Streak, trained-day, XP, rank and stat numbers, derived the same way on every page. */
export function useTrainingStats(): TrainingStats {
  const { progress } = useProgress();
  const { startDate, todayDayNumber } = useProgram();
  const today = todayKey();
  const key = `${toDateKey(startDate)}|${todayDayNumber}|${today}`;

  const hit = cache.get(progress);
  if (hit && hit.key === key) return hit.value;
  const value = compute(progress, startDate, todayDayNumber, today);
  cache.set(progress, { key, value });
  return value;
}
