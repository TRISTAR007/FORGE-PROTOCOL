import type { ProgressData } from '@/lib/types';
import { getSettings } from '@/lib/types';
import { resolveWorkout, PROGRAM_LENGTH_DAYS } from './program';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'flame' | 'dumbbell' | 'trophy' | 'droplet' | 'camera' | 'ruler' | 'zap' | 'calendar' | 'crown';
  unlocked: boolean;
  /** 0–1 progress toward unlocking, for locked badges. */
  progress: number;
  hint?: string;
}

interface Inputs {
  progress: ProgressData;
  trainedDays: Set<number>;
  longestStreak: number;
  currentPhase: number;
}

function countPerfectWeeks(trainedDays: Set<number>): number {
  let perfect = 0;
  for (let week = 0; week * 7 < PROGRAM_LENGTH_DAYS; week++) {
    const trainingDays = Array.from({ length: 7 }, (_, i) => week * 7 + i + 1).filter(
      (d) => d <= PROGRAM_LENGTH_DAYS && !resolveWorkout(d, new Date()).isRestDay
    );
    if (trainingDays.length === 5 && trainingDays.every((d) => trainedDays.has(d))) perfect++;
  }
  return perfect;
}

function tiered(
  idPrefix: string,
  value: number,
  tiers: number[],
  make: (n: number) => Omit<Achievement, 'id' | 'unlocked' | 'progress'>
): Achievement[] {
  return tiers.map((n) => ({
    id: `${idPrefix}-${n}`,
    ...make(n),
    unlocked: value >= n,
    progress: Math.min(1, value / n),
    hint: value >= n ? undefined : `${value}/${n}`,
  }));
}

/** Every badge, locked or not, computed from the progress document — nothing extra is stored. */
export function computeAchievements({ progress, trainedDays, longestStreak, currentPhase }: Inputs): Achievement[] {
  const workouts = trainedDays.size;
  const waterGoal = getSettings(progress).waterGoal;
  const hydratedDays = Object.values(progress.waterIntake).filter((n) => n >= waterGoal).length;
  const perfectWeeks = countPerfectWeeks(trainedDays);
  const guided = progress.sessionLogs.length;

  return [
    {
      id: 'first-workout',
      title: 'First Spark',
      description: 'Complete your first workout.',
      icon: 'flame',
      unlocked: workouts >= 1,
      progress: Math.min(1, workouts),
    },
    ...tiered('workouts', workouts, [10, 25, 50, 100, 200], (n) => ({
      title: `${n} Workouts`,
      description: `Complete ${n} program days.`,
      icon: n >= 100 ? 'crown' : 'dumbbell',
    })),
    ...tiered('streak', longestStreak, [7, 30, 60, 100], (n) => ({
      title: `${n}-Day Streak`,
      description: `Train ${n} days in a row (rest days don't break it).`,
      icon: 'zap',
    })),
    ...tiered('perfect-week', perfectWeeks, [1, 4, 12], (n) => ({
      title: n === 1 ? 'Perfect Week' : `${n} Perfect Weeks`,
      description: 'Finish all five training days in a program week.',
      icon: 'calendar',
    })),
    ...tiered('guided', guided, [1, 10, 50], (n) => ({
      title: n === 1 ? 'Guided Start' : `${n} Guided Sessions`,
      description: n === 1 ? 'Finish a guided workout session.' : `Finish ${n} guided workout sessions.`,
      icon: 'trophy',
    })),
    ...[2, 3, 4, 5, 6].map((phase) => ({
      id: `phase-${phase}`,
      title: `Phase ${phase}`,
      description: `Reach phase ${phase} of the program.`,
      icon: 'crown' as const,
      unlocked: currentPhase >= phase,
      progress: Math.min(1, (currentPhase - 1) / (phase - 1)),
    })),
    ...tiered('hydrated', hydratedDays, [7, 30], (n) => ({
      title: n === 7 ? 'Hydrated' : 'Well of Strength',
      description: `Hit your water goal on ${n} days.`,
      icon: 'droplet',
    })),
    {
      id: 'first-measurement',
      title: 'Baseline',
      description: 'Log your body measurements.',
      icon: 'ruler',
      unlocked: progress.measurementHistory.length > 0,
      progress: progress.measurementHistory.length > 0 ? 1 : 0,
    },
    {
      id: 'first-strength-test',
      title: 'Tested',
      description: 'Record a strength test.',
      icon: 'zap',
      unlocked: progress.strengthHistory.length > 0,
      progress: progress.strengthHistory.length > 0 ? 1 : 0,
    },
    {
      id: 'first-photo',
      title: 'Snapshot',
      description: 'Add a progress photo.',
      icon: 'camera',
      unlocked: progress.progressPhotos.length > 0,
      progress: progress.progressPhotos.length > 0 ? 1 : 0,
    },
  ];
}
