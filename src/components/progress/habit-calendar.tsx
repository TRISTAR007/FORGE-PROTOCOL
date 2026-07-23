'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, toDateKey, todayKey } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitCalendar() {
  const { progress, toggleHabitDay } = useProgress();
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const today = todayKey();

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const trainedThisMonth = Array.from({ length: daysInMonth }, (_, i) =>
    toDateKey(new Date(year, month, i + 1))
  ).filter((key) => progress.habits[key]).length;

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
            const trained = progress.habits[key];
            const isToday = key === today;
            return (
              <button
                key={i}
                onClick={() => toggleHabitDay(key)}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm border text-xs transition-colors',
                  trained
                    ? 'border-ok/40 bg-ok-dim text-ok'
                    : isToday
                      ? 'border-forge text-forge'
                      : 'border-line text-ink-muted hover:bg-surface-hover'
                )}
              >
                {trained ? <Check size={13} /> : day}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">Tap a day to mark it trained.</p>
      </CardContent>
    </Card>
  );
}
