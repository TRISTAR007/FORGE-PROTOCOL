'use client';

import { useState } from 'react';
import { ExerciseGrid } from '@/components/exercises/exercise-grid';
import { ExerciseModal } from '@/components/exercises/exercise-modal';
import type { Exercise } from '@/lib/types';

export default function ExercisesPage() {
  const [selected, setSelected] = useState<Exercise | null>(null);

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl tracking-wide">Exercise Library</h1>
      <p className="mt-1 mb-6 text-ink-muted">34 bodyweight exercises with full instructions — no equipment needed.</p>
      <ExerciseGrid onSelect={setSelected} />
      <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
