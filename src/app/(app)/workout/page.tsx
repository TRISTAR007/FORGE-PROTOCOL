'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Moon, Play } from 'lucide-react';
import { DaySelector } from '@/components/workout/day-selector';
import { WorkoutHero } from '@/components/workout/workout-hero';
import { WarmupCooldownBlock } from '@/components/workout/warmup-cooldown-block';
import { ExerciseList } from '@/components/workout/exercise-list';
import { DailyChecklist } from '@/components/workout/daily-checklist';
import { SessionPlayer } from '@/components/workout/session-player';
import { ExerciseModal } from '@/components/exercises/exercise-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProgram } from '@/hooks/use-program';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { getExercise } from '@/lib/program/exercises';
import { clamp } from '@/lib/utils';

function WorkoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getWorkout, todayDayNumber, totalDays } = useProgram();
  const { completeAllExercises } = useProgress();
  const { toast } = useToast();

  const dayParam = Number(searchParams.get('day'));
  const dayNumber = clamp(Number.isFinite(dayParam) && dayParam > 0 ? dayParam : todayDayNumber, 1, totalDays);
  const workout = getWorkout(dayNumber);

  const [sessionOpen, setSessionOpen] = useState(false);
  const [openExerciseKey, setOpenExerciseKey] = useState<string | null>(null);

  const setDay = (day: number) => router.push(`/workout?day=${day}`);

  return (
    <div className="space-y-5 animate-fadeIn">
      <DaySelector dayNumber={dayNumber} totalDays={totalDays} todayDayNumber={todayDayNumber} onChange={setDay} />
      <WorkoutHero workout={workout} />

      {workout.isRestDay ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Moon size={28} className="text-brass" />
          <p className="max-w-md text-sm text-ink-muted">{workout.restNote}</p>
        </Card>
      ) : (
        <>
          <WarmupCooldownBlock title="Warm-up" items={workout.warmup} />

          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg tracking-wide">Exercises</h2>
            <Button onClick={() => setSessionOpen(true)}>
              <Play size={16} />
              Start Guided Workout
            </Button>
          </div>
          <ExerciseList dayNumber={dayNumber} exercises={workout.exercises} onOpenExercise={setOpenExerciseKey} />

          <WarmupCooldownBlock title="Cooldown" items={workout.cooldown} />
        </>
      )}

      <DailyChecklist dayNumber={dayNumber} items={workout.checklist} />

      {sessionOpen ? (
        <SessionPlayer
          exercises={workout.exercises}
          dayLabel={workout.label}
          onClose={() => setSessionOpen(false)}
          onComplete={() => {
            completeAllExercises(dayNumber, workout.exercises.length);
            toast('Workout logged. Great work.');
          }}
        />
      ) : null}

      <ExerciseModal exercise={openExerciseKey ? getExercise(openExerciseKey) ?? null : null} onClose={() => setOpenExerciseKey(null)} />
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense>
      <WorkoutPageInner />
    </Suspense>
  );
}
