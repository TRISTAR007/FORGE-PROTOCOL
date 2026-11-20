'use client';

import { Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { Moon, Play, RotateCcw } from 'lucide-react';
import { DaySelector } from '@/components/workout/day-selector';
import { WorkoutHero } from '@/components/workout/workout-hero';
import { WarmupCooldownBlock } from '@/components/workout/warmup-cooldown-block';
import { ExerciseList } from '@/components/workout/exercise-list';
import { DailyChecklist } from '@/components/workout/daily-checklist';
import { SessionPlayer, parseSavedSession, sessionStorageKey } from '@/components/workout/session-player';
import { ExerciseModal } from '@/components/exercises/exercise-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProgram } from '@/hooks/use-program';
import { useIsClient } from '@/hooks/use-is-client';
import { useLocalStorageValue } from '@/hooks/use-local-storage';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { getExercise } from '@/lib/program/exercises';
import { primeAudio } from '@/lib/session-cues';
import { clamp } from '@/lib/utils';

function WorkoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isClient = useIsClient();
  const { getWorkout, todayDayNumber, totalDays } = useProgram();
  const { progress, completeAllExercises, logSession } = useProgress();
  const { toast } = useToast();

  const dayParam = Number(searchParams.get('day'));
  const dayNumber = clamp(Number.isFinite(dayParam) && dayParam > 0 ? dayParam : todayDayNumber, 1, totalDays);
  const workout = getWorkout(dayNumber);

  // `/workout?start=1` (from the dashboard) opens the guided session straight away.
  const [sessionOpen, setSessionOpen] = useState(() => searchParams.get('start') === '1');
  const [openExerciseKey, setOpenExerciseKey] = useState<string | null>(null);
  const [savedRaw] = useLocalStorageValue(sessionStorageKey(dayNumber));
  const saved = parseSavedSession(savedRaw);
  const canResume = saved !== null && saved.stepIndex > 0;

  const setDay = (day: number) => router.push(`/workout?day=${day}`);

  const openSession = () => {
    primeAudio();
    setSessionOpen(true);
  };

  const closeSession = () => {
    setSessionOpen(false);
    if (searchParams.get('start')) router.replace(`/workout?day=${dayNumber}`);
  };

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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg tracking-wide">Exercises</h2>
            <Button onClick={openSession}>
              {canResume ? <RotateCcw size={16} /> : <Play size={16} />}
              {canResume ? 'Resume Guided Workout' : 'Start Guided Workout'}
            </Button>
          </div>
          <ExerciseList dayNumber={dayNumber} exercises={workout.exercises} onOpenExercise={setOpenExerciseKey} />

          <WarmupCooldownBlock title="Cooldown" items={workout.cooldown} />
        </>
      )}

      <DailyChecklist dayNumber={dayNumber} items={workout.checklist} />

      {/* Portaled to <body>: the page wrapper's fade-in animation leaves a CSS transform on it,
          which would otherwise trap this fixed full-screen player inside the content column. */}
      {sessionOpen && isClient && !workout.isRestDay
        ? createPortal(
            <SessionPlayer
              key={dayNumber}
              dayNumber={dayNumber}
              exercises={workout.exercises}
              dayLabel={workout.label}
              kcalEstimate={workout.kcalEstimate}
              previousLogs={progress.sessionLogs}
              onClose={closeSession}
              onComplete={(log) => {
                completeAllExercises(dayNumber, workout.exercises.length);
                logSession(log);
                toast(`Day ${dayNumber} logged. Great work.`);
              }}
            />,
            document.body
          )
        : null}

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
