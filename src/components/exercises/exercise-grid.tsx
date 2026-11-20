'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Dumbbell, Heart, Search, X } from 'lucide-react';
import { EQUIPMENT_LABELS, EXERCISES, exerciseEquipment } from '@/lib/program/exercises';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useProgress } from '@/context/progress-context';
import { cn, DIFFICULTY_TONE } from '@/lib/utils';
import type { Difficulty, Equipment, Exercise, ExerciseCategory } from '@/lib/types';

const CATEGORIES: { id: ExerciseCategory | 'all' | 'favorites'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: '♥ Saved' },
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'full', label: 'Full body' },
  { id: 'mobility', label: 'Mobility' },
];

const DIFFICULTIES: { id: Difficulty | 'all'; label: string }[] = [
  { id: 'all', label: 'Any level' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const ALL_EXERCISES = Object.values(EXERCISES);
const ALL_MUSCLES = Array.from(new Set(ALL_EXERCISES.flatMap((e) => e.muscles))).sort();
const ALL_EQUIPMENT = Object.keys(EQUIPMENT_LABELS) as Equipment[];

export function ExerciseGrid({ onSelect }: { onSelect: (exercise: Exercise) => void }) {
  const { progress, toggleFavoriteExercise } = useProgress();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [muscle, setMuscle] = useState<string>('all');
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all');
  const [query, setQuery] = useState('');

  const favorites = useMemo(() => new Set(progress.favoriteExercises), [progress.favoriteExercises]);

  const filtered = ALL_EXERCISES.filter((ex) => {
    const q = query.trim().toLowerCase();
    const matchesCategory =
      category === 'all' || (category === 'favorites' ? favorites.has(ex.key) : ex.category === category);
    const matchesDifficulty = difficulty === 'all' || ex.difficulty === difficulty;
    const matchesMuscle = muscle === 'all' || ex.muscles.includes(muscle);
    const matchesEquipment = equipment === 'all' || exerciseEquipment(ex).includes(equipment);
    const matchesQuery =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.description.toLowerCase().includes(q) ||
      ex.muscles.some((m) => m.toLowerCase().includes(q));
    return matchesCategory && matchesDifficulty && matchesMuscle && matchesEquipment && matchesQuery;
  });

  const filtersActive = category !== 'all' || difficulty !== 'all' || muscle !== 'all' || equipment !== 'all' || query !== '';
  const clearFilters = () => {
    setCategory('all');
    setDifficulty('all');
    setMuscle('all');
    setEquipment('all');
    setQuery('');
  };

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
              {c.id === 'favorites' && favorites.size > 0 ? (
                <span className="ml-1 font-mono text-[11px] opacity-70">{favorites.size}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or muscle…"
            aria-label="Search exercises"
            className="w-full rounded-sm border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-forge focus:outline-none sm:w-60"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}
          aria-label="Filter by difficulty"
          className="rounded-sm border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-forge focus:outline-none"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          aria-label="Filter by muscle"
          className="rounded-sm border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-forge focus:outline-none"
        >
          <option value="all">Any muscle</option>
          {ALL_MUSCLES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value as Equipment | 'all')}
          aria-label="Filter by equipment"
          className="rounded-sm border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-forge focus:outline-none"
        >
          <option value="all">Any equipment</option>
          {ALL_EQUIPMENT.map((eq) => (
            <option key={eq} value={eq}>
              {EQUIPMENT_LABELS[eq]}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-ink-faint">
          {filtered.length} of {ALL_EXERCISES.length}
        </span>
        {filtersActive ? (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-semibold text-forge hover:text-forge-hover">
            <X size={12} /> Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={category === 'favorites' ? Heart : Search}
            title={category === 'favorites' && favorites.size === 0 ? 'No saved exercises yet' : 'No exercises found'}
            description={
              category === 'favorites' && favorites.size === 0
                ? 'Tap the heart on any exercise to save it here.'
                : 'Try a different search or filter.'
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((exercise) => {
            const saved = favorites.has(exercise.key);
            return (
              <div
                key={exercise.key}
                className="group relative overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-forge/40"
              >
                <button onClick={() => onSelect(exercise)} className="block w-full text-left">
                  <div className="relative aspect-square w-full bg-surface-raised">
                    {exercise.image ? (
                      <Image
                        src={exercise.image}
                        alt={exercise.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-faint">
                        <Dumbbell size={28} strokeWidth={1.5} />
                        <span className="px-3 text-center font-mono text-[10px] uppercase tracking-wider">
                          {exercise.muscles.slice(0, 2).join(' · ')}
                        </span>
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
                <button
                  onClick={() => toggleFavoriteExercise(exercise.key)}
                  aria-label={saved ? `Remove ${exercise.name} from saved` : `Save ${exercise.name}`}
                  aria-pressed={saved}
                  className={cn(
                    'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors',
                    saved ? 'bg-forge text-bg' : 'bg-bg/70 text-ink-muted hover:text-forge'
                  )}
                >
                  <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
