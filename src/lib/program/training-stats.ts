import type { ProgressData } from '@/lib/types';
import { daysBetween, parseDateKey } from '@/lib/utils';
import { PROGRAM_LENGTH_DAYS, resolveWorkout } from './program';

/**
 * Single source of truth for "did the user train on day N?".
 *
 * A program day counts as complete when EITHER:
 *  - every exercise for that day is checked off (finishing the guided
 *    session checks them all), OR
 *  - every item on that day's checklist is ticked (this is how rest and
 *    recovery days, which have no exercises, get completed).
 */
export function isDayComplete(data: ProgressData, dayNumber: number): boolean {
  // Only the day's structure (exercise + checklist counts) matters here,
  // and that depends on the day number alone — not on the start date.
  const workout = resolveWorkout(dayNumber, new Date());
  const key = String(dayNumber);

  const exercisesDone = new Set(data.exerciseChecks[key] ?? []);
  const allExercisesDone =
    workout.exercises.length > 0 && workout.exercises.every((_, i) => exercisesDone.has(i));

  const checklistDone = new Set(data.checklistCompleted[key] ?? []);
  const allChecklistDone =
    workout.checklist.length > 0 && workout.checklist.every((_, i) => checklistDone.has(i));

  return allExercisesDone || allChecklistDone;
}

/** Recomputes `completedDays` membership for one day after its checks change. */
export function withDayStatus(data: ProgressData, dayNumber: number): ProgressData {
  const days = new Set(data.completedDays);
  if (isDayComplete(data, dayNumber)) days.add(dayNumber);
  else days.delete(dayNumber);
  return { ...data, completedDays: Array.from(days).sort((a, b) => a - b) };
}

/** Program day number (1-based) that a YYYY-MM-DD date falls on. */
export function dayNumberForDate(dateKey: string, startDate: Date): number {
  return daysBetween(startDate, parseDateKey(dateKey)) + 1;
}

/**
 * Program days completed in the app. Re-derived from the raw checks as
 * well as `completedDays`, so days finished via the guided session before
 * that path recorded completion are still credited — no data migration.
 */
export function getCompletedProgramDays(data: ProgressData): Set<number> {
  const done = new Set(data.completedDays);
  const candidates = new Set([...Object.keys(data.exerciseChecks), ...Object.keys(data.checklistCompleted)]);
  for (const key of candidates) {
    const day = Number(key);
    if (Number.isInteger(day) && day >= 1 && day <= PROGRAM_LENGTH_DAYS && isDayComplete(data, day)) done.add(day);
  }
  return done;
}

/**
 * Every program day the user trained: days completed in the app plus
 * days marked by hand on the habit calendar (for training done outside
 * the app). Calendar marks outside the 365-day window are ignored.
 */
export function getTrainedDays(data: ProgressData, startDate: Date): Set<number> {
  const trained = getCompletedProgramDays(data);
  for (const [dateKey, marked] of Object.entries(data.habits)) {
    if (!marked) continue;
    const day = dayNumberForDate(dateKey, startDate);
    if (day >= 1 && day <= PROGRAM_LENGTH_DAYS) trained.add(day);
  }
  return trained;
}

function isScheduledRestDay(dayNumber: number): boolean {
  return resolveWorkout(dayNumber, new Date()).isRestDay;
}

/**
 * Consecutive trained days counting back from today.
 *  - Today not being done yet doesn't break the streak.
 *  - Scheduled rest/recovery days never break it — they only add to it
 *    if the user actually completed them.
 */
export function calculateStreak(trainedDays: Set<number>, todayDayNumber: number): number {
  let streak = 0;
  for (let day = todayDayNumber; day >= 1; day--) {
    if (trainedDays.has(day)) {
      streak++;
    } else if (day === todayDayNumber || isScheduledRestDay(day)) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}
