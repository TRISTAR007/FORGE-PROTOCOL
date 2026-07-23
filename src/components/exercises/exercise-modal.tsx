import Image from 'next/image';
import { Dumbbell } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { DIFFICULTY_TONE } from '@/lib/utils';
import type { Exercise } from '@/lib/types';

export function ExerciseModal({ exercise, onClose }: { exercise: Exercise | null; onClose: () => void }) {
  return (
    <Modal open={!!exercise} onClose={onClose} size="md">
      {exercise ? (
        <div>
          <div className="relative aspect-[16/10] w-full bg-surface">
            {exercise.image ? (
              <Image src={exercise.image} alt={exercise.name} fill className="object-cover" sizes="600px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                <Dumbbell size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={DIFFICULTY_TONE[exercise.difficulty]}>{exercise.difficulty}</Badge>
              <Badge tone="neutral">{exercise.category}</Badge>
            </div>
            <h2 className="mt-3 font-display text-2xl tracking-wide">{exercise.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">{exercise.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {exercise.muscles.map((m) => (
                <span key={m} className="rounded-xs bg-surface-raised px-2 py-1 font-mono text-[11px] text-ink-muted">
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
          </div>
        </div>
      ) : (
        <div />
      )}
    </Modal>
  );
}
