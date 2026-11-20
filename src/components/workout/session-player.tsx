'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Trophy,
  TrendingUp,
  Dumbbell,
  RotateCcw,
} from 'lucide-react';
import { RingProgress } from '@/components/ui/ring-progress';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/ui/confetti';
import { getExercise } from '@/lib/program/exercises';
import { buildSessionSteps, type SessionStep } from '@/lib/program/session';
import { getPersonalBests, repTargetTop } from '@/lib/program/training-stats';
import { beep, primeAudio, speak, stopSpeech, vibrate } from '@/lib/session-cues';
import { useProgress } from '@/context/progress-context';
import { writeLocalStorage } from '@/hooks/use-local-storage';
import type { SessionLog, WorkoutExercise } from '@/lib/types';
import { cn, todayKey } from '@/lib/utils';

// ---------------------------------------------------------------------
// Resume support — an interrupted session is kept in localStorage so the
// person can pick up from the same set later the same day.
// ---------------------------------------------------------------------

const RESUME_WINDOW_MS = 12 * 60 * 60 * 1000;

export function sessionStorageKey(dayNumber: number) {
  return `forge:session:v1:${dayNumber}`;
}

interface SavedSession {
  stepIndex: number;
  reps: (number | null)[][];
  startedAt: number;
  savedAt: number;
}

export function parseSavedSession(raw: string | null): SavedSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SavedSession;
    if (typeof parsed.stepIndex !== 'number' || !Array.isArray(parsed.reps)) return null;
    if (Date.now() - parsed.savedAt > RESUME_WINDOW_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function emptyReps(exercises: WorkoutExercise[]): (number | null)[][] {
  return exercises.map((e) => Array.from({ length: e.sets }, () => null));
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function defaultRepsFor(step: SessionStep | undefined, reps: (number | null)[][]): number {
  if (!step || step.isTimed) return 0;
  return reps[step.exerciseIndex]?.[step.setNumber - 1] ?? repTargetTop(step.reps) ?? 10;
}

export function SessionPlayer({
  dayNumber,
  exercises,
  dayLabel,
  kcalEstimate,
  previousLogs,
  onClose,
  onComplete,
}: {
  dayNumber: number;
  exercises: WorkoutExercise[];
  dayLabel: string;
  kcalEstimate: string;
  previousLogs: SessionLog[];
  onClose: () => void;
  onComplete: (log: SessionLog) => void;
}) {
  const { settings, updateSettings } = useProgress();
  const storageKey = sessionStorageKey(dayNumber);

  // Built once per session; the exercise list can't change mid-workout.
  const [steps] = useState<SessionStep[]>(() => buildSessionSteps(exercises));
  const [initial] = useState<SavedSession | null>(() => {
    const saved = parseSavedSession(localStorage.getItem(sessionStorageKey(dayNumber)));
    const shapeMatches =
      saved &&
      saved.stepIndex < steps.length &&
      saved.reps.length === exercises.length &&
      saved.reps.every((sets, i) => sets.length === exercises[i].sets);
    return shapeMatches ? saved : null;
  });
  const firstStep = steps[initial?.stepIndex ?? 0];

  const [stepIndex, setStepIndex] = useState(initial?.stepIndex ?? 0);
  const [reps, setReps] = useState<(number | null)[][]>(() => initial?.reps ?? emptyReps(exercises));
  const [startedAt, setStartedAt] = useState(() => initial?.startedAt ?? Date.now());
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [showResumed, setShowResumed] = useState(initial !== null && (initial?.stepIndex ?? 0) > 0);
  const [stepTotal, setStepTotal] = useState(firstStep?.seconds ?? 0);
  const [secondsLeft, setSecondsLeft] = useState(firstStep?.seconds ?? 0);
  const [paused, setPaused] = useState(false);
  // Wall-clock time (ms) the current timed step ends; null while paused or
  // on a rep-based step. Derived from the clock rather than chained 1s
  // timeouts, which browsers throttle when the screen locks.
  const [endAt, setEndAt] = useState<number | null>(() =>
    firstStep?.isTimed ? Date.now() + firstStep.seconds * 1000 : null
  );
  const [repInput, setRepInput] = useState(() => defaultRepsFor(firstStep, initial?.reps ?? emptyReps(exercises)));
  const lastCueSecond = useRef<number | null>(null);

  const finished = finishedAt !== null || steps.length === 0;
  const step = steps[stepIndex];

  const announce = useCallback(
    (s: SessionStep, index: number) => {
      if (!settings.voice) return;
      const name = getExercise(s.exerciseKey)?.name ?? 'next exercise';
      if (s.type === 'rest') {
        const next = steps.slice(index + 1).find((x) => x.type === 'work');
        const nextName = next ? getExercise(next.exerciseKey)?.name : null;
        speak(`Rest ${s.seconds} seconds.${nextName ? ` Up next: ${nextName}.` : ''}`);
      } else if (s.isTimed) {
        speak(`${name}. Set ${s.setNumber} of ${s.totalSets}. Hold for ${s.seconds} seconds.`);
      } else {
        speak(`${name}. Set ${s.setNumber} of ${s.totalSets}. ${s.reps} reps.`);
      }
    },
    [settings.voice, steps]
  );

  const startStep = useCallback(
    (index: number, currentReps: (number | null)[][]) => {
      const next = steps[index];
      setStepIndex(index);
      setPaused(false);
      setShowResumed(false);
      setStepTotal(next.seconds);
      setSecondsLeft(next.seconds);
      setEndAt(next.isTimed ? Date.now() + next.seconds * 1000 : null);
      setRepInput(defaultRepsFor(next, currentReps));
      lastCueSecond.current = null;
      announce(next, index);
    },
    [steps, announce]
  );

  const finish = useCallback(() => {
    setEndAt(null);
    setFinishedAt(Date.now());
    stopSpeech();
    if (settings.sound) {
      beep(784, 140);
      setTimeout(() => beep(988, 140), 160);
      setTimeout(() => beep(1319, 260), 320);
    }
    if (settings.vibration) vibrate([120, 80, 120, 80, 240]);
    if (settings.voice) speak('Workout complete. Great work.');
  }, [settings.sound, settings.vibration, settings.voice]);

  /** "Set Done" / "Skip" / timer reaching zero. Records reps for rep-based sets. */
  const advance = useCallback(() => {
    if (!step) return;
    let nextReps = reps;
    if (step.type === 'work' && !step.isTimed) {
      nextReps = reps.map((sets) => [...sets]);
      nextReps[step.exerciseIndex][step.setNumber - 1] = repInput;
      setReps(nextReps);
    }
    if (stepIndex + 1 >= steps.length) finish();
    else startStep(stepIndex + 1, nextReps);
  }, [step, reps, repInput, stepIndex, steps.length, finish, startStep]);

  const goPrev = useCallback(() => {
    if (stepIndex > 0) startStep(stepIndex - 1, reps);
  }, [stepIndex, reps, startStep]);

  const togglePause = useCallback(() => {
    if (paused) {
      setEndAt(Date.now() + secondsLeft * 1000);
      setPaused(false);
      return;
    }
    if (endAt !== null) setSecondsLeft(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    setEndAt(null);
    setPaused(true);
  }, [paused, secondsLeft, endAt]);

  const addTime = (extra: number) => {
    setStepTotal((t) => t + extra);
    setSecondsLeft((s) => s + extra);
    if (endAt !== null) setEndAt(endAt + extra * 1000);
    lastCueSecond.current = null;
  };

  const restart = () => {
    const fresh = emptyReps(exercises);
    setReps(fresh);
    setStartedAt(Date.now());
    startStep(0, fresh);
  };

  // Countdown for timed steps (holds + rest periods), with 3-2-1 beeps.
  useEffect(() => {
    if (finished || paused || endAt === null || !step) return;
    let done = false;
    const tick = () => {
      if (done) return;
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining >= 1 && remaining <= 3 && lastCueSecond.current !== remaining) {
        lastCueSecond.current = remaining;
        if (settings.sound) beep(660, 90);
      }
      if (remaining <= 0) {
        done = true;
        if (settings.sound) beep(990, 260);
        if (settings.vibration) vibrate(step.type === 'rest' ? [120, 60, 120] : 220);
        advance();
      }
    };
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      done = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [endAt, paused, finished, step, advance, settings.sound, settings.vibration]);

  // Persist progress so an interrupted session can be resumed.
  useEffect(() => {
    if (finished) return;
    writeLocalStorage(storageKey, JSON.stringify({ stepIndex, reps, startedAt, savedAt: Date.now() }));
  }, [finished, storageKey, stepIndex, reps, startedAt]);

  // Announce the first step once, and stop any speech on close.
  useEffect(() => {
    if (step && !finished) announce(step, stepIndex);
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Keep the screen awake for the duration of the session.
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await lock.release();
          return;
        }
        sentinel = lock;
        // The browser drops the lock whenever the tab is hidden.
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // Refused (low battery, permissions) — the session still works.
      }
    };

    void acquire();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinel) void acquire();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, []);

  // Keyboard: Space = pause / set done, ← → = navigate, ↑ ↓ = adjust reps, Esc = close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (finished || !step) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select')) return;
      if (e.key === ' ') {
        e.preventDefault();
        if (step.isTimed) togglePause();
        else advance();
      } else if (e.key === 'ArrowRight') {
        advance();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (!step.isTimed && step.type === 'work' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        setRepInput((r) => Math.max(0, r + (e.key === 'ArrowUp' ? 1 : -1)));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, finished, step, togglePause, advance, goPrev]);

  const summary = useMemo(() => {
    if (!finished) return null;
    const durationSec = Math.max(0, Math.round(((finishedAt ?? startedAt) - startedAt) / 1000));
    const sets = steps.filter((s) => s.type === 'work').length;
    const totalReps = reps.flat().reduce<number>((sum, r) => sum + (r ?? 0), 0);
    const previousBests = getPersonalBests(previousLogs);

    const records: { name: string; reps: number; previous: number }[] = [];
    const levelUps: string[] = [];
    exercises.forEach((slot, i) => {
      const logged = reps[i].filter((r): r is number => r != null);
      if (logged.length === 0) return;
      const name = getExercise(slot.exerciseKey)?.name ?? slot.exerciseKey;
      const best = Math.max(...logged);
      const previous = previousBests.get(slot.exerciseKey);
      if (previous && best > previous.reps) records.push({ name, reps: best, previous: previous.reps });
      const top = repTargetTop(slot.reps);
      if (top !== null && logged.length === slot.sets && logged.every((r) => r >= top)) levelUps.push(name);
    });
    return { durationSec, sets, totalReps, records, levelUps };
  }, [finished, finishedAt, startedAt, steps, reps, previousLogs, exercises]);

  if (finished && summary) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center overflow-y-auto bg-bg p-6 text-center animate-fadeIn">
        <Confetti />
        <div className="my-auto w-full max-w-md py-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-dim text-ok">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="mt-5 font-display text-3xl tracking-wide">Workout Complete</h2>
          <p className="mt-2 text-ink-muted">
            Day {dayNumber} · {dayLabel}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Time', value: formatDuration(summary.durationSec) },
              { label: 'Sets', value: String(summary.sets) },
              { label: 'Reps', value: summary.totalReps ? String(summary.totalReps) : '—' },
              { label: 'Est. kcal', value: kcalEstimate },
            ].map((stat) => (
              <div key={stat.label} className="rounded-sm border border-line bg-surface p-3">
                <p className="font-display text-xl tracking-wide">{stat.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{stat.label}</p>
              </div>
            ))}
          </div>

          {summary.records.length > 0 ? (
            <div className="mt-5 rounded-md border border-brass/30 bg-brass-dim/60 p-4 text-left">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-brass">
                <Trophy size={14} /> New personal records
              </p>
              <ul className="mt-2 space-y-1">
                {summary.records.map((r) => (
                  <li key={r.name} className="flex justify-between text-sm">
                    <span className="text-ink">{r.name}</span>
                    <span className="font-mono text-ink-muted">
                      {r.reps} reps <span className="text-ink-faint">(was {r.previous})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {summary.levelUps.length > 0 ? (
            <div className="mt-3 rounded-md border border-ok/30 bg-ok-dim/50 p-4 text-left">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ok">
                <TrendingUp size={14} /> Ready to progress
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                You hit the top of the rep range on every set of{' '}
                <span className="text-ink">{summary.levelUps.join(', ')}</span>. Next time, add 1–2 reps or slow the
                lowering phase to keep it challenging.
              </p>
            </div>
          ) : null}

          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={() => {
              onComplete({
                dayNumber,
                date: todayKey(),
                durationSec: summary.durationSec,
                reps,
              });
              writeLocalStorage(storageKey, null);
              onClose();
            }}
          >
            Save &amp; Finish
          </Button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  const exercise = getExercise(step.exerciseKey);
  const nextWorkStep = steps.slice(stepIndex + 1).find((s) => s.type === 'work');
  const nextExercise = nextWorkStep ? getExercise(nextWorkStep.exerciseKey) : undefined;
  const progressPct = step.isTimed ? ((stepTotal - secondsLeft) / Math.max(stepTotal, 1)) * 100 : 100;
  const isRepWork = step.type === 'work' && !step.isTimed;
  const shownExercise = step.type === 'rest' && nextExercise ? nextExercise : exercise;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-bg animate-fadeIn">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            Day {dayNumber} · {dayLabel}
          </p>
          <p className="text-sm font-semibold text-ink">
            Exercise {step.exerciseIndex + 1} of {exercises.length} · Set {step.setNumber} of {step.totalSets}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              primeAudio();
              updateSettings({ sound: !settings.sound });
            }}
            aria-label={settings.sound ? 'Mute sounds' : 'Unmute sounds'}
            aria-pressed={settings.sound}
            className="rounded-xs p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={onClose}
            aria-label="Pause and close session"
            className="rounded-xs p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {showResumed ? (
        <div className="mx-5 flex items-center justify-between gap-3 rounded-sm border border-brass/30 bg-brass-dim/60 px-4 py-2.5 text-sm">
          <span className="text-ink-muted">Picked up where you left off.</span>
          <button onClick={restart} className="flex items-center gap-1.5 font-semibold text-brass hover:text-brass-hover">
            <RotateCcw size={14} /> Start over
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
        <span
          className={cn(
            'mb-2 font-mono text-xs uppercase tracking-[0.2em]',
            step.type === 'rest' ? 'text-brass' : 'text-forge'
          )}
        >
          {step.type === 'rest' ? 'Rest' : paused ? 'Paused' : 'Work'}
        </span>

        {step.isTimed ? (
          <RingProgress
            value={progressPct}
            size={210}
            stroke={12}
            colorClassName={step.type === 'rest' ? 'text-brass' : 'text-forge'}
            className={cn(!paused && secondsLeft <= 3 && secondsLeft > 0 && 'animate-pulseRing')}
          >
            <div className="text-center">
              <div className="font-display text-6xl tracking-wide">{secondsLeft}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">seconds</div>
            </div>
          </RingProgress>
        ) : (
          <div className="flex h-[210px] w-[210px] flex-col items-center justify-center rounded-full border-[12px] border-forge-dim text-center">
            <div className="font-display text-3xl tracking-wide">{step.reps}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">target reps</div>
          </div>
        )}

        <div className="mt-6 flex max-w-sm items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-surface-raised">
            {shownExercise?.image ? (
              <Image src={shownExercise.image} alt="" fill className="object-cover" sizes="56px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                <Dumbbell size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0 text-left">
            {step.type === 'rest' ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Up next</p>
            ) : null}
            <h2 className="font-display text-2xl leading-tight tracking-wide">
              {shownExercise?.name ?? step.exerciseKey}
            </h2>
          </div>
        </div>
        {step.type === 'work' ? (
          <p className="mt-2 max-w-xs text-center text-sm text-ink-muted">{exercise?.instructions?.[0]}</p>
        ) : null}

        {isRepWork ? (
          <div className="mt-5 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRepInput((r) => Math.max(0, r - 1))}
                aria-label="One fewer rep"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-forge/60 hover:text-ink"
              >
                <Minus size={18} />
              </button>
              <span className="w-16 text-center font-display text-4xl tracking-wide" aria-live="polite">
                {repInput}
              </span>
              <button
                onClick={() => setRepInput((r) => r + 1)}
                aria-label="One more rep"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-forge/60 hover:text-ink"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Reps done</p>
          </div>
        ) : null}
      </div>

      <div className="px-6 pb-3">
        <div className="flex gap-[3px]">
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

      <div className="flex items-center justify-center gap-2 px-4 pb-3 pt-2 sm:gap-3">
        <Button variant="ghost" size="lg" onClick={goPrev} disabled={stepIndex === 0} aria-label="Previous step" className="px-4">
          <SkipBack size={18} />
        </Button>
        {step.isTimed ? (
          <Button variant="secondary" size="lg" onClick={togglePause} className="w-[120px]">
            {paused ? <Play size={18} /> : <Pause size={18} />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
        ) : null}
        {step.type === 'rest' ? (
          <Button variant="secondary" size="lg" onClick={() => addTime(15)} className="px-4">
            +15s
          </Button>
        ) : null}
        <Button size="lg" onClick={advance} className={isRepWork ? 'w-44' : 'w-[120px]'}>
          {isRepWork ? <CheckCircle2 size={18} /> : <SkipForward size={18} />}
          {isRepWork ? 'Set Done' : 'Skip'}
        </Button>
      </div>
      <p className="hidden pb-6 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint sm:block">
        Space {step.isTimed ? 'pause' : 'set done'} · ← → navigate{isRepWork ? ' · ↑ ↓ reps' : ''}
      </p>
      <div className="pb-6 sm:hidden" />
    </div>
  );
}
