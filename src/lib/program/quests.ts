import type { Difficulty, Limitation, PlanGoal, PlanMinutes, ProgressData, Quest, QuestDay, TrainingPlan } from '@/lib/types';
import { addDays, parseDateKey, toDateKey } from '@/lib/utils';
import { isStressful, safeExerciseKey } from './safety';

/**
 * Daily quests: a small set of goals that resets at local midnight.
 *
 *  - "workout"  finish any workout today (auto-checked)
 *  - "a"        a strength quest (reps)
 *  - "b"        a goal-flavored quest (cardio / core / stretching)
 *  - "water"    hit the water goal (auto-checked)
 *  - "recovery" offered the day after a miss — finishing it keeps the
 *               quest streak alive. Missing a day never takes anything away.
 *
 * A day's quests are generated once (deterministically from the date,
 * plan and level) and then stored, so targets never shift mid-day.
 */

interface Template {
  key: string;
  kind: 'reps' | 'seconds';
  base: number;
}

const STRENGTH: Template[] = [
  { key: 'standardPushup', kind: 'reps', base: 25 },
  { key: 'bodyweightSquat', kind: 'reps', base: 40 },
  { key: 'gluteBridge', kind: 'reps', base: 35 },
  { key: 'walkingLunge', kind: 'reps', base: 24 },
  { key: 'calfRaise', kind: 'reps', base: 45 },
  { key: 'inclinePushup', kind: 'reps', base: 30 },
  { key: 'reverseLunge', kind: 'reps', base: 24 },
];

const CARDIO: Template[] = [
  { key: 'jumpingJack', kind: 'reps', base: 80 },
  { key: 'mountainClimber', kind: 'seconds', base: 60 },
  { key: 'highKnees', kind: 'seconds', base: 60 },
  { key: 'shadowBoxing', kind: 'seconds', base: 120 },
  { key: 'buttKicks', kind: 'seconds', base: 60 },
];

const CORE: Template[] = [
  { key: 'plank', kind: 'seconds', base: 90 },
  { key: 'sidePlank', kind: 'seconds', base: 60 },
  { key: 'deadBug', kind: 'reps', base: 24 },
  { key: 'heelTaps', kind: 'reps', base: 50 },
  { key: 'wallSit', kind: 'seconds', base: 75 },
];

const FLEX: Template[] = [
  { key: 'deepSquatHold', kind: 'seconds', base: 90 },
  { key: 'hipFlexorStretch', kind: 'seconds', base: 90 },
  { key: 'childPose', kind: 'seconds', base: 90 },
  { key: 'worldGreatestStretch', kind: 'reps', base: 10 },
  { key: 'catCow', kind: 'reps', base: 15 },
];

const RECOVERY: Template[] = [
  { key: 'gluteBridge', kind: 'reps', base: 15 },
  { key: 'catCow', kind: 'reps', base: 10 },
  { key: 'shadowBoxing', kind: 'seconds', base: 60 },
  { key: 'deadBug', kind: 'reps', base: 12 },
];

const SECOND_POOL: Record<PlanGoal, Template[]> = {
  strength: CORE,
  fatLoss: CARDIO,
  endurance: CARDIO,
  flexibility: FLEX,
  general: [...CARDIO, ...CORE, ...FLEX],
};

const EXPERIENCE_MULT: Record<Difficulty, number> = { beginner: 0.6, intermediate: 1, advanced: 1.5 };
const MINUTES_MULT: Record<PlanMinutes, number> = { 10: 0.8, 20: 1, 30: 1.15, 45: 1.3 };

/** Beginner-friendly versions of the harder quest moves. */
const BEGINNER_SWAP: Record<string, string> = { standardPushup: 'kneePushup', walkingLunge: 'reverseLunge' };

export const QUEST_REWARD = 20;
export const QUEST_KEEP_DAYS = 45;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

function scaledTarget(t: Template, plan: TrainingPlan | null, level: number, factor = 1): number {
  const exp = EXPERIENCE_MULT[plan?.experience ?? 'beginner'];
  const mins = MINUTES_MULT[plan?.minutes ?? 20];
  const growth = 1 + Math.min(level - 1, 40) * 0.025;
  const raw = t.base * exp * mins * growth * factor;
  const step = t.kind === 'seconds' ? 15 : 5;
  return Math.max(step, Math.round(raw / step) * step);
}

function choose(pool: Template[], seed: number, limitations: Limitation[]): Template {
  const safe = pool.filter((t) => !isStressful(t.key, limitations));
  if (safe.length > 0) return pick(safe, seed);
  const t = pick(pool, seed);
  return { ...t, key: safeExerciseKey(t.key, limitations) };
}

export interface QuestContext {
  plan: TrainingPlan | null;
  level: number;
  waterGoal: number;
  /** Offer a recovery quest (yesterday was missed). */
  recovery: boolean;
}

export function generateQuestDay(dateKey: string, ctx: QuestContext): QuestDay {
  const limitations = ctx.plan?.limitations ?? [];
  const seed = hash(dateKey);
  const goal = ctx.plan?.goal ?? 'general';

  const a = choose(STRENGTH, seed, limitations);
  const b = choose(SECOND_POOL[goal], seed >>> 7, limitations);
  const aKey = ctx.plan?.experience === 'advanced' ? a.key : (BEGINNER_SWAP[a.key] ?? a.key);
  const finalA = isStressful(aKey, limitations) ? a.key : aKey;

  const quests: Quest[] = [
    { id: 'workout', kind: 'workout', target: 1, progress: 0, done: false },
    { id: 'a', kind: a.kind, exerciseKey: finalA, target: scaledTarget(a, ctx.plan, ctx.level), progress: 0, done: false },
    { id: 'b', kind: b.kind, exerciseKey: b.key, target: scaledTarget(b, ctx.plan, ctx.level), progress: 0, done: false },
    { id: 'water', kind: 'water', target: ctx.waterGoal, progress: 0, done: false },
  ];

  if (ctx.recovery) {
    const r = choose(RECOVERY, seed >>> 13, limitations);
    quests.push({
      id: 'recovery',
      kind: r.kind,
      exerciseKey: r.key,
      target: scaledTarget(r, ctx.plan, 1, 0.8),
      progress: 0,
      done: false,
      recovery: true,
    });
  }
  return { quests, cleared: false };
}

/** Should today come with a recovery quest? (Yesterday missed, but the person was active recently.) */
export function needsRecovery(quests: Record<string, QuestDay>, todayKey: string): boolean {
  const today = parseDateKey(todayKey);
  const yesterday = quests[toDateKey(addDays(today, -1))];
  if (yesterday) return !yesterday.cleared;
  for (let back = 2; back <= 4; back++) {
    if (quests[toDateKey(addDays(today, -back))]) return true;
  }
  return false;
}

function rescued(quests: Record<string, QuestDay>, day: Date): boolean {
  const next = quests[toDateKey(addDays(day, 1))];
  return !!next?.quests.some((q) => q.recovery && q.done);
}

/** Consecutive cleared (or rescued) days. Today only counts once it's cleared. */
export function questStreak(quests: Record<string, QuestDay>, todayKey: string): number {
  const today = parseDateKey(todayKey);
  let cursor = quests[todayKey]?.cleared ? today : addDays(today, -1);
  let streak = 0;
  for (let i = 0; i < QUEST_KEEP_DAYS; i++) {
    const day = quests[toDateKey(cursor)];
    if (day?.cleared || rescued(quests, cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    } else break;
  }
  return streak;
}

/** Applies progress to one quest and keeps the lifetime totals in step. Pure. */
export function applyQuestProgress(
  prev: ProgressData,
  dateKey: string,
  questId: string,
  amount: number | 'complete'
): ProgressData {
  const day = prev.quests[dateKey];
  if (!day) return prev;
  const quest = day.quests.find((q) => q.id === questId);
  if (!quest || quest.done) return prev;

  const progress = amount === 'complete' ? quest.target : Math.min(quest.target, quest.progress + Math.max(0, amount));
  const done = progress >= quest.target;
  const quests = day.quests.map((q) => (q.id === questId ? { ...q, progress, done } : q));
  const regularDone = quests.filter((q) => !q.recovery).every((q) => q.done);
  const newlyCleared = regularDone && !day.cleared;

  const totals = { ...prev.questTotals };
  if (done) {
    if (quest.recovery) totals.recoveries += 1;
    else totals.done += 1;
  }
  if (newlyCleared) totals.clears += 1;

  return {
    ...prev,
    quests: { ...prev.quests, [dateKey]: { quests, cleared: day.cleared || regularDone } },
    questTotals: totals,
  };
}

/** Adds a day's quests (if missing) and drops days older than the keep window. */
export function withQuestDay(prev: ProgressData, dateKey: string, day: QuestDay): ProgressData {
  if (prev.quests[dateKey]) return prev;
  const cutoff = toDateKey(addDays(parseDateKey(dateKey), -QUEST_KEEP_DAYS));
  const kept = Object.fromEntries(Object.entries(prev.quests).filter(([k]) => k >= cutoff));
  return { ...prev, quests: { ...kept, [dateKey]: day } };
}

/** Milliseconds until local midnight (when quests reset). */
export function msUntilReset(now = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}
