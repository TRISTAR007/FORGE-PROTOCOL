import { Clock, Flame as FlameIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatWorkoutDate } from '@/lib/program/program';
import { DIFFICULTY_TONE } from '@/lib/utils';
import type { ResolvedWorkout } from '@/lib/types';

export function WorkoutHero({ workout }: { workout: ResolvedWorkout }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={DIFFICULTY_TONE[workout.intensity]}>{workout.intensity}</Badge>
        <Badge tone="neutral">Week {workout.weekNumber}</Badge>
        <span className="font-mono text-xs text-ink-faint">{formatWorkoutDate(workout)}</span>
      </div>
      <h1 className="mt-3 font-display text-3xl tracking-wide">{workout.label}</h1>
      <p className="mt-1 text-ink-muted">{workout.focus}</p>
      {!workout.isRestDay ? (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Clock size={15} /> {workout.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <FlameIcon size={15} /> ~{workout.kcalEstimate} kcal
          </span>
        </div>
      ) : null}
    </div>
  );
}
