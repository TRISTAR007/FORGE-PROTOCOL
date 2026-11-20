import type { Profile, ProgressData } from '@/lib/types';
import { resolveWorkout, PROGRAM_LENGTH_DAYS } from '@/lib/program/program';
import { getTrainedDays } from '@/lib/program/training-stats';
import { addDays, parseDateKey, toDateKey } from '@/lib/utils';

export function downloadFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function exportJson(progress: ProgressData, profile: Profile | null): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'Level Up Dojo',
      profile: profile
        ? { full_name: profile.full_name, program_start_date: profile.program_start_date, created_at: profile.created_at }
        : null,
      progress,
    },
    null,
    2
  );
}

export function measurementsCsv(progress: ProgressData): string {
  const rows = [...progress.measurementHistory]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [e.date, e.weight, e.chest, e.arms, e.waist, e.thighs]);
  return toCsv(['date', 'weight_kg', 'chest_cm', 'arms_cm', 'waist_cm', 'thighs_cm'], rows);
}

export function strengthCsv(progress: ProgressData): string {
  const rows = [...progress.strengthHistory]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [e.date, e.pushups, e.squats, e.plankSeconds]);
  return toCsv(['date', 'pushups', 'squats', 'plank_seconds'], rows);
}

/** One row per program day up to today: what was scheduled and whether it got done. */
export function workoutLogCsv(progress: ProgressData, startDateKey: string, todayDayNumber: number): string {
  const start = parseDateKey(startDateKey);
  const trained = getTrainedDays(progress, start);
  const logs = new Map(progress.sessionLogs.map((l) => [l.dayNumber, l]));
  const rows: unknown[][] = [];
  for (let day = 1; day <= Math.min(todayDayNumber, PROGRAM_LENGTH_DAYS); day++) {
    const w = resolveWorkout(day, start);
    const log = logs.get(day);
    rows.push([
      day,
      toDateKey(addDays(start, day - 1)),
      w.label,
      w.isRestDay ? 'yes' : 'no',
      trained.has(day) ? 'yes' : 'no',
      log ? Math.round(log.durationSec / 60) : '',
      log ? log.reps.flat().reduce<number>((s, r) => s + (r ?? 0), 0) : '',
      progress.waterIntake[toDateKey(addDays(start, day - 1))] ?? '',
    ]);
  }
  return toCsv(
    ['day', 'date', 'workout', 'rest_day', 'completed', 'guided_minutes', 'guided_total_reps', 'water_glasses'],
    rows
  );
}

function icsDate(d: Date, utc: boolean): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  if (utc) {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  }
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/**
 * A daily repeating calendar event with an alarm, at the person's chosen
 * local time, for the rest of the program. Works with every calendar app
 * and needs no push-notification server.
 */
export function dailyReminderIcs(time: string, daysRemaining: number, siteUrl: string): string {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0);
  if (first <= now) first.setDate(first.getDate() + 1);
  const link = `${siteUrl.replace(/\/$/, '')}/workout?start=1`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Level Up Dojo//Daily Reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:dojo-daily-${now.getTime()}@level-up-dojo`,
    `DTSTAMP:${icsDate(now, true)}`,
    `DTSTART:${icsDate(first, false)}`,
    'DURATION:PT30M',
    `RRULE:FREQ=DAILY;COUNT=${Math.max(1, daysRemaining)}`,
    'SUMMARY:Level Up Dojo — time to train',
    `DESCRIPTION:Open today's workout: ${link}`,
    `URL:${link}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Time to train',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
