'use client';

import Image from 'next/image';
import { Check, Dumbbell, Info, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';
import { exerciseName, getExercise } from '@/lib/program/exercises';
import type { WorkoutExercise } from '@/lib/types';

export function ExerciseList({
  dayNumber,
  exercises,
  onOpenExercise,
}: {
  dayNumber: number;
  exercises: WorkoutExercise[];
  onOpenExercise: (key: string) => void;
}) {
  const { progress, toggleExerciseCheck } = useProgress();
  const checked = progress.exerciseChecks[String(dayNumber)] ?? [];

  return (
    <div className="space-y-2">
      {exercises.map((slot, index) => {
        const exercise = getExercise(slot.exerciseKey);
        const isChecked = checked.includes(index);

        return (
          <div
            key={`${slot.exerciseKey}-${index}`}
            className={cn(
              'flex items-center gap-3 rounded-md border p-3 transition-colors',
              isChecked ? 'border-ok/30 bg-ok-dim/40' : 'border-line bg-surface'
            )}
          >
            <button
              aria-label={isChecked ? 'Mark exercise incomplete' : 'Mark exercise complete'}
              onClick={() => toggleExerciseCheck(dayNumber, index)}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                isChecked ? 'border-ok bg-ok text-bg' : 'border-line'
              )}
            >
              {isChecked && <Check size={14} strokeWidth={3} />}
            </button>

            <button
              onClick={() => onOpenExercise(slot.exerciseKey)}
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-surface-raised"
            >
              {exercise?.image ? (
                <Image src={exercise.image} alt={exercise.name} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-faint">
                  <Dumbbell size={18} />
                </div>
              )}
            </button>

            <button onClick={() => onOpenExercise(slot.exerciseKey)} className="min-w-0 flex-1 text-left">
              <p className={cn('truncate font-medium', isChecked ? 'text-ink-muted line-through' : 'text-ink')}>
                {exercise?.name ?? slot.exerciseKey}
              </p>
              <p className="truncate font-mono text-xs text-ink-faint">
                {slot.sets} × {slot.reps} · rest {slot.rest}
              </p>
              {slot.swappedFrom ? <SwapNote from={exerciseName(slot.swappedFrom)} /> : null}
            </button>

            <button
              aria-label="View exercise details"
              onClick={() => onOpenExercise(slot.exerciseKey)}
              className="shrink-0 p-1 text-ink-faint hover:text-ink"
            >
              <Info size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** "Safer swap for Jump Squat" — shown when the plan's injury check replaced a move. */
function SwapNote({ from }: { from: string }) {
  const t = useTranslations('plan');
  return (
    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-aqua">
      <ShieldCheck size={11} className="shrink-0" /> {t('swapNote', { name: from })}
    </p>
  );
}
