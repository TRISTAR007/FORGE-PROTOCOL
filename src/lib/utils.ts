import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Difficulty } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Badge tone for a difficulty/intensity tier — shared by exercise cards, the exercise modal, and the workout hero. */
export const DIFFICULTY_TONE: Record<Difficulty, 'ok' | 'brass' | 'forge'> = {
  beginner: 'ok',
  intermediate: 'brass',
  advanced: 'forge',
};

/** YYYY-MM-DD in the browser's local timezone (not UTC — avoids "today" drifting a day). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Parses a YYYY-MM-DD string (as produced by toDateKey) back into a local Date — not UTC, for the same reason toDateKey avoids UTC. */
export function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / msPerDay);
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return clamp((numerator / denominator) * 100, 0, 100);
}

/**
 * Current streak of consecutive trained days, counting backward from
 * today (or yesterday, so a streak isn't broken just because today's
 * workout hasn't happened yet).
 */
export function calculateStreak(completedDays: number[], currentDayNumber: number): number {
  const set = new Set(completedDays);
  let streak = 0;
  let day = set.has(currentDayNumber) ? currentDayNumber : currentDayNumber - 1;
  while (day >= 1 && set.has(day)) {
    streak++;
    day--;
  }
  return streak;
}

export function initials(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || email || '?';
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
