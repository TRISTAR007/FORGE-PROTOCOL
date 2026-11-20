'use client';

import { useState } from 'react';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseModal } from '@/components/exercises/exercise-modal';
import { EXERCISES } from '@/lib/program/exercises';
import type { Exercise } from '@/lib/types';

const EXERCISE_COUNT = Object.keys(EXERCISES).length;

export default function ExercisesPage() {
  const [selected, setSelected] = useState<Exercise | null>(null);

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl tracking-wide">Exercise Library</h1>
      <p className="mt-1 mb-6 text-ink-muted">{EXERCISE_COUNT} bodyweight exercises with full instructions — no equipment needed.</p>
      <ExerciseGrid onSelect={setSelected} />
      <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
