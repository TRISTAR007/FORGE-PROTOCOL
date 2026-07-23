'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Pause, Play, SkipForward, CheckCircle2 } from 'lucide-react';
import { RingProgress } from '@/components/ui/ring-progress';
import { Button } from '@/components/ui/button';
import { getExercise } from '@/lib/program/exercises';
import { buildSessionSteps, type SessionStep } from '@/lib/program/session';
import type { WorkoutExercise } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionPlayer({
  exercises,
  dayLabel,
  onClose,
  onComplete,
}: {
  exercises: WorkoutExercise[];
  dayLabel: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const stepsRef = useRef<SessionStep[]>(buildSessionSteps(exercises));
  const steps = stepsRef.current;

  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0]?.seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(steps.length === 0);

  const step = steps[stepIndex];

  useEffect(() => {
    if (step) setSecondsLeft(step.seconds);
    setPaused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const goNext = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= steps.length) {
        setFinished(true);
        return i;
      }
      return i + 1;
    });
  }, [steps.length]);

  // Countdown for timed steps (holds + rest periods).
  useEffect(() => {
    if (finished || paused || !step?.isTimed) return;
    if (secondsLeft <= 0) {
      goNext();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, paused, finished, step, goNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Keep the screen awake for the duration of the session — without this,
  // the phone can lock mid-rest-timer and the countdown becomes invisible.
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          // Session ended while the request was in flight.
          await lock.release();
          return;
        }
        sentinel = lock;
      } catch {
        // Wake lock can be refused (e.g. low battery, permissions) —
        // the session still works, it just won't stay awake by itself.
      }
    };

    acquire();

    // The lock is auto-released whenever the tab is hidden; re-acquire it
    // when the person comes back if the session is still open.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinel) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (finished) {
    const totalSets = steps.filter((s) => s.type === 'work').length;
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg p-6 text-center animate-fadeIn">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ok-dim text-ok">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-5 font-display text-3xl tracking-wide">Workout Complete</h2>
        <p className="mt-2 text-ink-muted">
          {dayLabel} · {totalSets} sets done
        </p>
        <Button
          size="lg"
          className="mt-8"
          onClick={() => {
            onComplete();
            onClose();
          }}
        >
          Finish
        </Button>
      </div>
    );
  }

  if (!step) return null;

  const exercise = getExercise(step.exerciseKey);
  const nextWorkStep = steps.slice(stepIndex + 1).find((s) => s.type === 'work');
  const progressPct = step.isTimed ? ((step.seconds - secondsLeft) / Math.max(step.seconds, 1)) * 100 : 100;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg animate-fadeIn">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{dayLabel}</p>
          <p className="text-sm font-semibold text-ink">
            Set {step.setNumber} of {step.totalSets}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="End session"
          className="rounded-xs p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <span
          className={cn(
            'mb-2 font-mono text-xs uppercase tracking-[0.2em]',
            step.type === 'rest' ? 'text-brass' : 'text-forge'
          )}
        >
          {step.type === 'rest' ? 'Rest' : 'Work'}
        </span>

        {step.isTimed ? (
          <RingProgress
            value={progressPct}
            size={220}
            stroke={12}
            colorClassName={step.type === 'rest' ? 'text-brass' : 'text-forge'}
          >
            <div className="text-center">
              <div className="font-display text-6xl tracking-wide">{secondsLeft}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">seconds</div>
            </div>
          </RingProgress>
        ) : (
          <div className="flex h-[220px] w-[220px] flex-col items-center justify-center rounded-full border-[12px] border-forge-dim text-center">
            <div className="font-display text-3xl tracking-wide">{step.reps}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">reps</div>
          </div>
        )}

        <h2 className="mt-8 text-center font-display text-3xl tracking-wide">{exercise?.name ?? step.exerciseKey}</h2>
        {step.type === 'work' ? (
          <p className="mt-2 max-w-xs text-center text-sm text-ink-muted">{exercise?.instructions?.[0]}</p>
        ) : nextWorkStep ? (
          <p className="mt-2 text-center text-sm text-ink-muted">
            Up next: <span className="text-ink">{getExercise(nextWorkStep.exerciseKey)?.name}</span>
          </p>
        ) : null}
      </div>

      <div className="px-6 pb-4">
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < stepIndex ? 'bg-forge' : i === stepIndex ? 'bg-forge/60' : 'bg-surface-raised'
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-6 pb-8 pt-2 sm:pb-10">
        {step.isTimed ? (
          <Button variant="secondary" size="lg" onClick={() => setPaused((p) => !p)} className="w-32">
            {paused ? <Play size={18} /> : <Pause size={18} />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
        ) : null}
        <Button size="lg" onClick={goNext} className="w-40">
          {step.isTimed ? <SkipForward size={18} /> : null}
          {step.isTimed ? 'Skip' : 'Set Done'}
        </Button>
      </div>
    </div>
  );
}
