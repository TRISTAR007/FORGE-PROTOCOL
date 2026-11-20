'use client';

import Image from 'next/image';
import { CalendarDays, Dumbbell, Heart, Trophy } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/context/progress-context';
import { getExerciseUsage } from '@/lib/program/program';
import { getPersonalBests } from '@/lib/program/training-stats';
import { DIFFICULTY_TONE } from '@/lib/utils';
import type { Exercise } from '@/lib/types';

export function ExerciseModal({ exercise, onClose }: { exercise: Exercise | null; onClose: () => void }) {
  const { progress, toggleFavoriteExercise } = useProgress();
  const usage = exercise ? getExerciseUsage(exercise.key) : [];
  const best = exercise ? getPersonalBests(progress.sessionLogs).get(exercise.key) : undefined;
  const saved = exercise ? progress.favoriteExercises.includes(exercise.key) : false;

  return (
    <Modal open={!!exercise} onClose={onClose} size="md" title={exercise?.name}>
      {exercise ? (
        <div className="-m-5">
          <div className="relative aspect-[16/10] w-full bg-surface">
            {exercise.image ? (
              <Image src={exercise.image} alt={exercise.name} fill className="object-cover" sizes="600px" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-faint">
                <Dumbbell size={48} strokeWidth={1.5} />
                <span className="font-mono text-[11px] uppercase tracking-wider">{exercise.muscles.join(' · ')}</span>
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={DIFFICULTY_TONE[exercise.difficulty]}>{exercise.difficulty}</Badge>
                <Badge tone="neutral">{exercise.category}</Badge>
              </div>
              <Button
                variant={saved ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => toggleFavoriteExercise(exercise.key)}
                aria-pressed={saved}
              >
                <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
            <p className="mt-3 text-sm text-ink-muted">{exercise.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {exercise.muscles.map((m) => (
                <span key={m} className="rounded-xs bg-surface px-2 py-1 font-mono text-[11px] text-ink-muted">
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-sm border border-line bg-bg p-3 text-center">
              <div>
                <p className="font-display text-lg">{exercise.sets}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Sets</p>
              </div>
              <div>
                <p className="font-display text-lg">{exercise.reps}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Reps</p>
              </div>
              <div>
                <p className="font-display text-lg">{exercise.rest}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Rest</p>
              </div>
            </div>

            {best ? (
              <p className="mt-3 flex items-center gap-2 rounded-sm border border-brass/30 bg-brass-dim/50 px-3 py-2 text-sm text-ink-muted">
                <Trophy size={14} className="text-brass" />
                Your best set: <span className="font-semibold text-ink">{best.reps} reps</span>
              </p>
            ) : null}

            <h3 className="mt-5 font-display text-sm uppercase tracking-wide text-ink-muted">How to perform</h3>
            <ol className="mt-2 space-y-2">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forge-dim font-mono text-[10px] font-bold text-forge">
                    {i + 1}
                  </span>
                  <span className="text-ink-muted">{step}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-5 flex items-center gap-1.5 font-display text-sm uppercase tracking-wide text-ink-muted">
              <CalendarDays size={14} /> In your program
            </h3>
            {usage.length === 0 ? (
              <p className="mt-2 text-sm text-ink-faint">Not part of the weekly split — add it as an extra, or use it in your mobility work.</p>
            ) : (
              <div className="mt-2 divide-y divide-line-faint rounded-sm border border-line">
                {usage.map((u, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-ink">
                      {u.dayLabel} <span className="text-ink-faint">· {u.phases}</span>
                    </span>
                    <span className="font-mono text-xs text-ink-muted">{u.prescription}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div />
      )}
    </Modal>
  );
}
