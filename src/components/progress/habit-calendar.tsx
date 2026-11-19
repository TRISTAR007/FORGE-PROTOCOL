'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, toDateKey, todayKey } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { dayNumberForDate, getCompletedProgramDays } from '@/lib/program/training-stats';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Shows every trained day in one place:
 *  - solid green = a program day completed in the app (links to that day)
 *  - outlined green = marked here by hand (training done outside the app)
 * Both count toward the streak and workout totals.
 */
export function HabitCalendar() {
  const { progress, toggleHabitDay } = useProgress();
  const { startDate, totalDays } = useProgram();
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const today = todayKey();
  const completed = getCompletedProgramDays(progress);

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const statusFor = (key: string) => {
    const programDay = dayNumberForDate(key, startDate);
    const inProgram = programDay >= 1 && programDay <= totalDays;
    const loggedInApp = inProgram && completed.has(programDay);
    const markedByHand = Boolean(progress.habits[key]);
    return { programDay, inProgram, loggedInApp, markedByHand, trained: loggedInApp || markedByHand };
  };

  const trainedThisMonth = Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(year, month, i + 1))).filter(
    (key) => statusFor(key).trained
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Calendar</CardTitle>
        <span className="font-mono text-xs text-ink-faint">{trainedThisMonth} days trained</span>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <button
            aria-label="Previous month"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="rounded-xs p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-ink">{monthLabel}</span>
          <button
            aria-label="Next month"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="rounded-xs p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center font-mono text-[10px] uppercase text-ink-faint">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const key = toDateKey(new Date(year, month, day));
            const { programDay, loggedInApp, markedByHand } = statusFor(key);
            const isToday = key === today;
            const isFuture = key > today;
            const base = 'flex aspect-square items-center justify-center rounded-sm border text-xs transition-colors';

            if (loggedInApp) {
              return (
                <Link
                  key={i}
                  href={`/workout?day=${programDay}`}
                  aria-label={`${key}: Day ${programDay} completed — view workout`}
                  className={cn(base, 'border-ok bg-ok text-bg hover:opacity-90')}
                >
                  <Check size={13} strokeWidth={3} />
                </Link>
              );
            }

            return (
              <button
                key={i}
                onClick={() => toggleHabitDay(key)}
                disabled={isFuture}
                aria-pressed={markedByHand}
                aria-label={`${key}: ${markedByHand ? 'marked trained' : 'not trained'}`}
                className={cn(
                  base,
                  markedByHand
                    ? 'border-ok/50 bg-ok-dim text-ok'
                    : isToday
                      ? 'border-forge text-forge'
                      : 'border-line text-ink-muted hover:bg-surface-hover',
                  isFuture && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                )}
              >
                {markedByHand ? <Check size={13} /> : day}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-ok" /> Completed in the app
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs border border-ok/50 bg-ok-dim" /> Marked by hand
          </span>
          <span>Tap a past day to mark training done outside the app.</span>
        </div>
      </CardContent>
    </Card>
  );
}
