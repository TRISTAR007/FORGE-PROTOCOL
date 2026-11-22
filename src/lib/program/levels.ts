import type { ProgressData } from '@/lib/types';
import { getSettings } from '@/lib/types';

/** XP awards. Everything is derived from logged data — nothing extra is stored. */
export const XP = {
  programDay: 100,
  guidedBonus: 50,
  quickWorkout: 60,
  arcDay: 40,
  dailyTask: 5,
  waterGoal: 15,
  measurement: 20,
  strengthTest: 30,
  photo: 20,
  quest: 20,
  questClear: 40,
  recoveryQuest: 30,
  boss: 150,
};

export function computeXp(progress: ProgressData, trainedDays: Set<number>): number {
  const waterGoal = getSettings(progress).waterGoal;
  const dailyTasks = Object.values(progress.dailyTasks).reduce((sum, ids) => sum + ids.length, 0);
  const waterDays = Object.values(progress.waterIntake).filter((n) => n >= waterGoal).length;
  const arcDays = Object.values(progress.arcs).reduce((sum, a) => sum + a.doneDays.length, 0);
  const bosses = Object.values(progress.bosses ?? {}).filter((b) => b.defeatedOn).length;
  const quests = progress.questTotals ?? { done: 0, clears: 0, recoveries: 0 };

  return (
    trainedDays.size * XP.programDay +
    progress.sessionLogs.length * XP.guidedBonus +
    progress.routineLogs.length * XP.quickWorkout +
    arcDays * XP.arcDay +
    dailyTasks * XP.dailyTask +
    waterDays * XP.waterGoal +
    progress.measurementHistory.length * XP.measurement +
    progress.strengthHistory.length * XP.strengthTest +
    progress.progressPhotos.length * XP.photo +
    quests.done * XP.quest +
    quests.clears * XP.questClear +
    quests.recoveries * XP.recoveryQuest +
    bosses * XP.boss
  );
}

/** Total XP needed to reach a level: 0, 100, 300, 600, 1000, … (grows gently). */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export interface Belt {
  id: string;
  /** Message key under `belts.` for the translated name. */
  key: string;
  minLevel: number;
  color: string;
  /** Text color that stays readable on the belt color. */
  text: string;
}

/** Original dojo ranks (no anime-franchise ranks). */
export const BELTS: Belt[] = [
  { id: 'white', key: 'white', minLevel: 1, color: '#F6F2FF', text: '#0C0A1D' },
  { id: 'yellow', key: 'yellow', minLevel: 3, color: '#FFD84A', text: '#0C0A1D' },
  { id: 'orange', key: 'orange', minLevel: 6, color: '#FF9A3D', text: '#0C0A1D' },
  { id: 'green', key: 'green', minLevel: 9, color: '#4ADE80', text: '#0C0A1D' },
  { id: 'blue', key: 'blue', minLevel: 13, color: '#5B8CFF', text: '#FFFFFF' },
  { id: 'purple', key: 'purple', minLevel: 17, color: '#8B5CF6', text: '#FFFFFF' },
  { id: 'brown', key: 'brown', minLevel: 21, color: '#9C6B3F', text: '#FFFFFF' },
  { id: 'red', key: 'red', minLevel: 26, color: '#FF4D6A', text: '#FFFFFF' },
  { id: 'black', key: 'black', minLevel: 31, color: '#111018', text: '#FFC94A' },
  { id: 'legend', key: 'legend', minLevel: 41, color: '#FFC94A', text: '#0C0A1D' },
];

export function beltForLevel(level: number): Belt {
  let belt = BELTS[0];
  for (const b of BELTS) if (level >= b.minLevel) belt = b;
  return belt;
}

/**
 * Hunter-style rank ladder that runs alongside the belts: E → SSS.
 * Original names/colors — the letter grades are a common gaming convention.
 */
export interface Rank {
  id: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  minLevel: number;
  color: string;
}

export const RANKS: Rank[] = [
  { id: 'E', minLevel: 1, color: '#9CA3AF' },
  { id: 'D', minLevel: 5, color: '#4ADE80' },
  { id: 'C', minLevel: 10, color: '#38BDF8' },
  { id: 'B', minLevel: 15, color: '#818CF8' },
  { id: 'A', minLevel: 20, color: '#C084FC' },
  { id: 'S', minLevel: 28, color: '#FF4D94' },
  { id: 'SS', minLevel: 36, color: '#FF9A3D' },
  { id: 'SSS', minLevel: 45, color: '#FFC94A' },
];

export function rankForLevel(level: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) if (level >= r.minLevel) rank = r;
  return rank;
}

export function nextRank(level: number): Rank | null {
  return RANKS.find((r) => r.minLevel > level) ?? null;
}

export interface LevelInfo {
  xp: number;
  level: number;
  belt: Belt;
  rank: Rank;
  /** XP gathered within the current level, and the size of the current level. */
  intoLevel: number;
  levelSpan: number;
  toNext: number;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    xp,
    level,
    belt: beltForLevel(level),
    rank: rankForLevel(level),
    intoLevel: xp - base,
    levelSpan: next - base,
    toNext: next - xp,
  };
}
