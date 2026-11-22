'use client';

import { Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Moon, Play, RotateCcw } from 'lucide-react';
import { DaySelector } from '@/components/workout/day-selector';
import { WorkoutHero } from '@/components/workout/workout-hero';
import { WarmupCooldownBlock } from '@/components/workout/warmup-cooldown-block';
import { ExerciseList } from '@/components/workout/exercise-list';
import { DailyChecklist } from '@/components/workout/daily-checklist';
import { SessionPlayer, parseSavedSession, sessionStorageKey } from '@/components/workout/session-player';
import { ExerciseModal } from '@/components/exercises/exercise-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProgram } from '@/hooks/use-program';
import { useIsClient } from '@/hooks/use-is-client';
import { useLocalStorageValue } from '@/hooks/use-local-storage';
import { useCommunityShare } from '@/hooks/use-community-share';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { useRaidHit } from '@/hooks/use-raid-hit';
import { getExercise } from '@/lib/program/exercises';
import { XP } from '@/lib/program/levels';
import { primeAudio } from '@/lib/session-cues';
import { clamp } from '@/lib/utils';

function WorkoutPageInner() {
  const t = useTranslations('workout');
  const tSettings = useTranslations('settings');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isClient = useIsClient();
  const { getWorkout, todayDayNumber, totalDays, mode } = useProgram();
  const { progress, settings, completeAllExercises, logSession } = useProgress();
  const { toast } = useToast();
  const share = useCommunityShare();
  const hit = useRaidHit();

  const dayParam = Number(searchParams.get('day'));
  const dayNumber = clamp(Number.isFinite(dayParam) && dayParam > 0 ? dayParam : todayDayNumber, 1, totalDays);
  const workout = getWorkout(dayNumber);
  const title = `Day ${dayNumber} · ${workout.label}`;

  // `/workout?start=1` (from the dashboard or a reminder) opens the guided session straight away.
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
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg tracking-wide">{t('exercises')}</h2>
              {mode !== 'home' ? <Badge tone="brass">{tSettings(`modes.${mode}`)}</Badge> : null}
            </div>
            <Button onClick={openSession}>
              {canResume ? <RotateCcw size={16} /> : <Play size={16} />}
              {canResume ? t('resumeGuided') : t('startGuided')}
            </Button>
          </div>
          <ExerciseList dayNumber={dayNumber} exercises={workout.exercises} onOpenExercise={setOpenExerciseKey} />

          <WarmupCooldownBlock title="Cooldown" items={workout.cooldown} />
        </>
      )}

      <DailyChecklist dayNumber={dayNumber} items={workout.checklist} />

      {/* Portaled to <body> so no ancestor transform can trap the fixed full-screen player. */}
      {sessionOpen && isClient && !workout.isRestDay
        ? createPortal(
            <SessionPlayer
              key={`${dayNumber}-${mode}`}
              sessionKey={dayNumber}
              title={title}
              exercises={workout.exercises}
              kcalEstimate={workout.kcalEstimate}
              xpReward={XP.programDay + XP.guidedBonus}
              previousLogs={[...progress.sessionLogs, ...progress.routineLogs]}
              onClose={closeSession}
              onShare={(result) => share(result, title, settings.coachId)}
              onComplete={(result) => {
                completeAllExercises(dayNumber, workout.exercises.length);
                logSession({ dayNumber, date: result.date, durationSec: result.durationSec, reps: result.reps, keys: result.keys });
                toast(t('logged', { day: dayNumber }));
                hit(XP.programDay + XP.guidedBonus);
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
