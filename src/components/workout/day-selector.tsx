'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clamp } from '@/lib/utils';

export function DaySelector({
  dayNumber,
  totalDays,
  todayDayNumber,
  onChange,
}: {
  dayNumber: number;
  totalDays: number;
  todayDayNumber: number;
  onChange: (day: number) => void;
}) {
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(jumpValue);
    if (Number.isFinite(n) && n >= 1) {
      onChange(clamp(Math.round(n), 1, totalDays));
      setJumpValue('');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous day"
          onClick={() => onChange(clamp(dayNumber - 1, 1, totalDays))}
          disabled={dayNumber <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="px-2 text-center">
          <p className="font-display text-xl tracking-wide leading-none">Day {dayNumber}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">of {totalDays}</p>
        </div>
        <button
          aria-label="Next day"
          onClick={() => onChange(clamp(dayNumber + 1, 1, totalDays))}
          disabled={dayNumber >= totalDays}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {dayNumber !== todayDayNumber ? (
          <Button variant="outline" size="sm" onClick={() => onChange(todayDayNumber)}>
            Jump to Today
          </Button>
        ) : null}
        <form onSubmit={handleJump} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={totalDays}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder="Go to day…"
            className="w-28 rounded-sm border border-line bg-bg px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-forge focus:outline-none"
          />
          <Button type="submit" variant="secondary" size="sm">
            Go
          </Button>
        </form>
      </div>
    </div>
  );
}
