import type { ArcProgress } from '@/lib/types';

import { ARC_REST_EVERY, arcTarget, getArc, type Arc } from './routines';

export type BossIcon = 'shield' | 'mountain' | 'snowflake' | 'zap' | 'anchor' | 'flower' | 'flame' | 'skull' | 'moon' | 'swords';

/**
 * Original bosses. Each 30-day Arc ends in a boss fight: a timed test of
 * the arc's move. Reps-based bosses take one HP per rep (tap to count);
 * hold-based bosses lose one HP per second you hold.
 */
export interface ArcBoss {
  arcId: string;
  /** Message key under `bosses.` for the translated name/title. */
  key: string;
  icon: BossIcon;
  colors: [string, string];
  timeLimitSec: number;
  /** Multiplier on the arc's final-day target. */
  hpFactor: number;
}

export const ARC_BOSSES: ArcBoss[] = [
  { arcId: 'pushup-arc', key: 'ironGolem', icon: 'shield', colors: ['#FF4D6A', '#FF9A3D'], timeLimitSec: 180, hpFactor: 1 },
  { arcId: 'squat-arc', key: 'stoneTitan', icon: 'mountain', colors: ['#9C6B3F', '#FFC94A'], timeLimitSec: 240, hpFactor: 1 },
  { arcId: 'plank-arc', key: 'frostWraith', icon: 'snowflake', colors: ['#38BDF8', '#A78BFA'], timeLimitSec: 240, hpFactor: 1 },
  { arcId: 'jack-arc', key: 'thunderImp', icon: 'zap', colors: ['#FFD84A', '#FF4D94'], timeLimitSec: 180, hpFactor: 1 },
  { arcId: 'hang-arc', key: 'cliffSerpent', icon: 'anchor', colors: ['#4ADE80', '#0EA5E9'], timeLimitSec: 180, hpFactor: 1 },
  { arcId: 'flex-arc', key: 'lotusSpirit', icon: 'flower', colors: ['#F472B6', '#C084FC'], timeLimitSec: 240, hpFactor: 1 },
];

/** Training days (non-rest) needed before the boss gate opens. */
export const BOSS_UNLOCK_DAYS = 20;

export function bossForArc(arcId: string): ArcBoss | undefined {
  return ARC_BOSSES.find((b) => b.arcId === arcId);
}

export function bossHp(boss: ArcBoss, arc: Arc = getArc(boss.arcId)!): number {
  return Math.round(arcTarget(arc, arc.days) * boss.hpFactor);
}

export function trainingDaysInArc(arc: Arc): number {
  return arc.days - Math.floor(arc.days / ARC_REST_EVERY);
}

export function isBossUnlocked(progress: ArcProgress | undefined): boolean {
  return !!progress && progress.doneDays.length >= BOSS_UNLOCK_DAYS;
}

/** Weekly community raid bosses, rotating by ISO week. */
export interface RaidBoss {
  key: string;
  icon: BossIcon;
  colors: [string, string];
}

export const RAID_BOSSES: RaidBoss[] = [
  { key: 'emberDrake', icon: 'flame', colors: ['#FF4D6A', '#FF9A3D'] },
  { key: 'tidalLeviathan', icon: 'anchor', colors: ['#0EA5E9', '#22D3EE'] },
  { key: 'nightRonin', icon: 'swords', colors: ['#8B5CF6', '#1E1B4B'] },
  { key: 'boneKing', icon: 'skull', colors: ['#E5E7EB', '#6B7280'] },
  { key: 'moonFox', icon: 'moon', colors: ['#FDE68A', '#A78BFA'] },
  { key: 'stormRoc', icon: 'zap', colors: ['#FFD84A', '#38BDF8'] },
  { key: 'jadeColossus', icon: 'mountain', colors: ['#4ADE80', '#065F46'] },
  { key: 'frostQueen', icon: 'snowflake', colors: ['#BAE6FD', '#818CF8'] },
];

/** Monday (UTC) of the week containing `date`, as YYYY-MM-DD — matches the database. */
export function raidWeekStart(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

export function raidBossForWeek(weekStart: string): RaidBoss {
  const weeks = Math.floor(Date.parse(weekStart + 'T00:00:00Z') / (7 * 86400000));
  return RAID_BOSSES[((weeks % RAID_BOSSES.length) + RAID_BOSSES.length) % RAID_BOSSES.length];
}

/** Milliseconds until the raid resets (next Monday 00:00 UTC). */
export function msUntilRaidReset(now = new Date()): number {
  const start = Date.parse(raidWeekStart(now) + 'T00:00:00Z');
  return start + 7 * 86400000 - now.getTime();
}

export const GUILDS = ['crimson', 'azure', 'golden', 'jade'] as const;
export type GuildId = (typeof GUILDS)[number];

export const GUILD_COLORS: Record<GuildId, string> = {
  crimson: '#FF4D6A',
  azure: '#38BDF8',
  golden: '#FFC94A',
  jade: '#4ADE80',
};

export function isGuild(value: unknown): value is GuildId {
  return typeof value === 'string' && (GUILDS as readonly string[]).includes(value);
}
