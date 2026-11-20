'use client';

import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgram } from '@/hooks/use-program';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { splitLabel } from '@/lib/program/program';

export function WeekStrip() {
  const t = useTranslations('dashboard');
  const { trainedDays } = useTrainingStats();
  const { todayDayNumber, getWorkout } = useProgram();

  const weekStart = todayDayNumber - ((todayDayNumber - 1) % 7);
  const days = Array.from({ length: 7 }, (_, i) => weekStart + i);

  return (
    <div>
      <h2 className="mb-3 font-display text-lg tracking-wide">{t('thisWeek')}</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((dayNumber) => {
          const workout = getWorkout(dayNumber);
          const isToday = dayNumber === todayDayNumber;
          const isDone = trainedDays.has(dayNumber);
          const isFuture = dayNumber > todayDayNumber;

          return (
            <Link
              key={dayNumber}
              href={`/workout?day=${dayNumber}`}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-sm border px-1.5 py-3 text-center transition-colors',
                isToday
                  ? 'border-forge bg-forge-dim'
                  : isDone
                    ? 'border-ok/30 bg-ok-dim'
                    : 'border-line bg-surface hover:border-line hover:bg-surface-hover',
                isFuture && !isToday && 'opacity-60'
              )}
            >
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                {splitLabel(workout.split).slice(0, 4)}
              </span>
              {isDone ? (
                <Check size={16} className="text-ok" />
              ) : (
                <span className={cn('font-display text-sm', isToday ? 'text-forge' : 'text-ink-muted')}>
                  {dayNumber}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
