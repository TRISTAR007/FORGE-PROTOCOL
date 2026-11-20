import Link from 'next/link';
import { Flame, Play } from 'lucide-react';
import { RingProgress } from '@/components/ui/ring-progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pct } from '@/lib/utils';
import type { ResolvedWorkout } from '@/lib/types';
import { getPhase } from '@/lib/program/program';

export function PhaseHero({
  workout,
  totalDays,
  streak,
}: {
  workout: ResolvedWorkout;
  totalDays: number;
  streak: number;
}) {
  const phase = getPhase(workout.weekNumber);

  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(255,106,43,0.25), transparent 70%)' }}
      />
      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <RingProgress value={pct(workout.dayNumber, totalDays)} size={104} stroke={9}>
            <div className="text-center">
              <div className="font-display text-2xl leading-none tracking-wide">{workout.dayNumber}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">of {totalDays}</div>
            </div>
          </RingProgress>
          <div>
            <Badge tone="brass">
              Phase {phase.id} · {phase.name}
            </Badge>
            <h1 className="mt-2 font-display text-2xl tracking-wide sm:text-3xl">{workout.label}</h1>
            <p className="mt-1 text-sm text-ink-muted">{workout.focus}</p>
            {streak > 0 ? (
              <p className="mt-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-forge">
                <Flame size={14} />
                {streak}-day streak
              </p>
            ) : null}
          </div>
        </div>
        {workout.isRestDay ? (
          <Link href="/workout" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              View Rest Day
            </Button>
          </Link>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Link href="/workout?start=1" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <Play size={18} />
                Start Today&apos;s Workout
              </Button>
            </Link>
            <Link
              href="/workout"
              className="text-center text-sm font-semibold text-ink-muted transition-colors hover:text-forge"
            >
              View the plan · {workout.duration}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
