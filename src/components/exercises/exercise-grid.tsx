'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Dumbbell, Search } from 'lucide-react';
import { EXERCISES } from '@/lib/program/exercises';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { cn, DIFFICULTY_TONE } from '@/lib/utils';
import type { Exercise, ExerciseCategory } from '@/lib/types';

const CATEGORIES: { id: ExerciseCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
  { id: 'mobility', label: 'Mobility' },
];

export function ExerciseGrid({ onSelect }: { onSelect: (exercise: Exercise) => void }) {
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const all = useMemo(() => Object.values(EXERCISES), []);

  const filtered = all.filter((ex) => {
    const matchesCategory = category === 'all' || ex.category === category;
    const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                category === c.id
                  ? 'border-forge bg-forge-dim text-forge'
                  : 'border-line bg-surface text-ink-muted hover:text-ink'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full rounded-sm border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-forge focus:outline-none sm:w-56"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Search} title="No exercises found" description="Try a different search or category." />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((exercise) => (
            <button
              key={exercise.key}
              onClick={() => onSelect(exercise)}
              className="group overflow-hidden rounded-md border border-line bg-surface text-left transition-colors hover:border-forge/40"
            >
              <div className="relative aspect-square w-full bg-surface-raised">
                {exercise.image ? (
                  <Image
                    src={exercise.image}
                    alt={exercise.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="200px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-faint">
                    <Dumbbell size={28} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-ink">{exercise.name}</p>
                <div className="mt-1.5">
                  <Badge tone={DIFFICULTY_TONE[exercise.difficulty]}>{exercise.difficulty}</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
