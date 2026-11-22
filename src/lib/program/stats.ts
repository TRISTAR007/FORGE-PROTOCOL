import type { ExerciseCategory, ProgressData, StatId } from '@/lib/types';
import { EXERCISES } from './exercises';
import { getArc } from './routines';

export const STAT_IDS: StatId[] = ['power', 'stamina', 'agility', 'flexibility', 'focus'];

export const STAT_COLORS: Record<StatId, string> = {
  power: '#FF4D6A',
  stamina: '#FF9A3D',
  agility: '#38BDF8',
  flexibility: '#4ADE80',
  focus: '#A78BFA',
};

/** How one completed set of each exercise family feeds the five stats. */
const CATEGORY_WEIGHTS: Record<ExerciseCategory, Partial<Record<StatId, number>>> = {
  push: { power: 1 },
  pull: { power: 1 },
  legs: { power: 0.6, agility: 0.4 },
  core: { focus: 0.6, power: 0.4 },
  cardio: { stamina: 0.7, agility: 0.3 },
  mobility: { flexibility: 1 },
  full: { stamina: 0.5, power: 0.3, agility: 0.2 },
};

/** Stat points the person gets to spend by hand per level gained. */
export const POINTS_PER_LEVEL = 3;

export interface StatSheet {
  /** Earned from training (before hand-spent points). */
  base: Record<StatId, number>;
  /** Final values shown in the UI. */
  total: Record<StatId, number>;
  earnedPoints: number;
  spentPoints: number;
  freePoints: number;
}

function addSets(raw: Record<StatId, number>, key: string | undefined, sets: number) {
  const category = key ? EXERCISES[key]?.category : undefined;
  const weights = CATEGORY_WEIGHTS[category ?? 'full'];
  for (const [stat, w] of Object.entries(weights) as [StatId, number][]) raw[stat] += w * sets;
}

/** Counts finished sets in a reps grid (timed holds are logged as null, so they count half). */
function setCount(row: (number | null)[] | undefined): number {
  if (!row) return 0;
  return row.reduce<number>((n, r) => n + (r === null ? 0.5 : r > 0 ? 1 : 0), 0);
}

/**
 * Stats are derived from what the person has actually trained — push-ups
 * grow Power, cardio grows Stamina, stretching grows Flexibility, and
 * showing up every day grows Focus. Values start at 10 and grow with the
 * square root of the work, so early progress feels fast and later
 * progress still moves.
 */
export function computeStats(progress: ProgressData, trainedDayCount: number, level: number): StatSheet {
  const raw: Record<StatId, number> = { power: 0, stamina: 0, agility: 0, flexibility: 0, focus: 0 };

  for (const log of [...progress.sessionLogs, ...progress.routineLogs]) {
    log.reps.forEach((row, i) => addSets(raw, log.keys?.[i], setCount(row)));
  }
  for (const [arcId, arc] of Object.entries(progress.arcs)) {
    addSets(raw, getArc(arcId)?.exerciseKey, arc.doneDays.length * 3);
  }
  for (const day of Object.values(progress.quests ?? {})) {
    for (const q of day.quests) {
      if (!q.done) continue;
      if (q.kind === 'workout') raw.stamina += 2;
      else if (q.kind === 'water') raw.focus += 1;
      else addSets(raw, q.exerciseKey, 2);
    }
  }
  raw.focus += trainedDayCount * 2 + Object.values(progress.dailyTasks).reduce((n, ids) => n + ids.length, 0) * 0.3;
  raw.flexibility += trainedDayCount * 0.5;
  raw.stamina += trainedDayCount;

  const base = {} as Record<StatId, number>;
  const total = {} as Record<StatId, number>;
  let spentPoints = 0;
  for (const id of STAT_IDS) {
    base[id] = 10 + Math.floor(Math.sqrt(raw[id]) * 4);
    const spent = Math.max(0, progress.statAlloc?.[id] ?? 0);
    spentPoints += spent;
    total[id] = base[id] + spent;
  }
  const earnedPoints = Math.max(0, level - 1) * POINTS_PER_LEVEL;
  return { base, total, earnedPoints, spentPoints, freePoints: Math.max(0, earnedPoints - spentPoints) };
}

/** A single "power level" number for headers and the leaderboard card. */
export function powerScore(sheet: StatSheet): number {
  return STAT_IDS.reduce((n, id) => n + sheet.total[id], 0);
}
