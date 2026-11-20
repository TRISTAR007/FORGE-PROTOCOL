'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Mic,
  MicOff,
  Trophy,
  TrendingUp,
  Dumbbell,
  RotateCcw,
  Share2,
  Sparkles,
} from 'lucide-react';
import { RingProgress } from '@/components/ui/ring-progress';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/ui/confetti';
import { CoachPortrait, SpeechBubble, type CoachMood } from '@/components/coach/coach-portrait';
import { getExercise } from '@/lib/program/exercises';
import { buildSessionSteps, type SessionStep } from '@/lib/program/session';
import { getPersonalBests, repTargetTop } from '@/lib/program/training-stats';
import { beep, primeAudio, stopSpeech, vibrate } from '@/lib/session-cues';
import { hapticImpact, hapticSuccess } from '@/lib/native';
import { useProgress } from '@/context/progress-context';
import { useCoach } from '@/hooks/use-coach';
import { writeLocalStorage } from '@/hooks/use-local-storage';
import type { Coach } from '@/lib/coaches';
import type { WorkoutExercise } from '@/lib/types';
import { cn, todayKey } from '@/lib/utils';

// ---------------------------------------------------------------------
// Resume support — an interrupted session is kept in localStorage so the
// person can pick up from the same set later the same day.
// ---------------------------------------------------------------------

const RESUME_WINDOW_MS = 12 * 60 * 60 * 1000;

/** `key` is the program day number (as before) or e.g. "routine-hero-wakeup". */
export function sessionStorageKey(key: number | string) {
  return `forge:session:v1:${key}`;
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

export interface SessionResult {
  date: string;
  durationSec: number;
  reps: (number | null)[][];
  keys: string[];
  sets: number;
}

export function SessionPlayer({
  sessionKey,
  title,
  exercises,
  kcalEstimate,
  xpReward,
  previousLogs,
  coachOverride,
  onClose,
  onComplete,
  onShare,
}: {
  sessionKey: number | string;
  /** e.g. "Day 46 · Core & Posture" or a quick-workout name. */
  title: string;
  exercises: WorkoutExercise[];
  kcalEstimate?: string;
  xpReward: number;
  previousLogs: Parameters<typeof getPersonalBests>[0];
  coachOverride?: Coach;
  onClose: () => void;
  onComplete: (result: SessionResult) => void;
  onShare?: (result: SessionResult) => Promise<boolean>;
}) {
  const t = useTranslations('player');
  const { settings, updateSettings } = useProgress();
  const { coach, say, line } = useCoach(coachOverride);
  const storageKey = sessionStorageKey(sessionKey);
  const keys = useMemo(() => exercises.map((e) => e.exerciseKey), [exercises]);

  // Built once per session; the exercise list can't change mid-workout.
  const [steps] = useState<SessionStep[]>(() => buildSessionSteps(exercises));
  const [initial] = useState<SavedSession | null>(() => {
    let saved: SavedSession | null = null;
    try {
      saved = parseSavedSession(localStorage.getItem(storageKey));
    } catch {
      saved = null;
    }
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
  // on a rep-based step — derived from the clock so locked screens can't stall it.
  const [endAt, setEndAt] = useState<number | null>(() =>
    firstStep?.isTimed ? Date.now() + firstStep.seconds * 1000 : null
  );
  const [repInput, setRepInput] = useState(() => defaultRepsFor(firstStep, initial?.reps ?? emptyReps(exercises)));
  const [bubble, setBubble] = useState(() => line('start', {}, 0));
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'shared' | 'error'>('idle');
  const lastCueSecond = useRef<number | null>(null);

  const finished = finishedAt !== null || steps.length === 0;
  const step = steps[stepIndex];

  const announce = useCallback(
    (s: SessionStep, index: number) => {
      const name = getExercise(s.exerciseKey)?.name ?? s.exerciseKey;
      let text: string;
      if (s.type === 'rest') {
        const next = steps.slice(index + 1).find((x) => x.type === 'work');
        text = say('rest', { seconds: s.seconds, next: next ? getExercise(next.exerciseKey)?.name ?? '' : '' }, index);
      } else if (s.isTimed) {
        text = say('hold', { exercise: name, set: s.setNumber, sets: s.totalSets, seconds: s.seconds }, index);
      } else {
        text = say('work', { exercise: name, set: s.setNumber, sets: s.totalSets, reps: s.reps }, index);
      }
      setBubble(text);
    },
    [steps, say]
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
    if (settings.vibration) void hapticSuccess().then((native) => !native && vibrate([120, 80, 120, 80, 240]));
    setBubble(say('done', {}, Date.now() % 7));
  }, [settings.sound, settings.vibration, say]);

  /** "Set Done" / "Skip" / timer reaching zero. Records reps for rep-based sets. */
  const advance = useCallback(() => {
    if (!step) return;
    let nextReps = reps;
    if (step.type === 'work' && !step.isTimed) {
      nextReps = reps.map((sets) => [...sets]);
      nextReps[step.exerciseIndex][step.setNumber - 1] = repInput;
      setReps(nextReps);
      if (settings.vibration) void hapticImpact('light');
    }
    if (stepIndex + 1 >= steps.length) finish();
    else startStep(stepIndex + 1, nextReps);
  }, [step, reps, repInput, stepIndex, steps.length, finish, startStep, settings.vibration]);

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
    setStepTotal((total) => total + extra);
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
        if (settings.vibration) {
          void hapticImpact('heavy').then((native) => !native && vibrate(step.type === 'rest' ? [120, 60, 120] : 220));
        }
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

  // Coach greets + announces the first step once; stop speech on close.
  useEffect(() => {
    if (step && !finished) {
      say('start', {}, 0); // same seed as the initial bubble text
      const id = setTimeout(() => announce(step, stepIndex), 1800);
      return () => {
        clearTimeout(id);
        stopSpeech();
      };
    }
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

  const result = (): SessionResult => ({
    date: todayKey(),
    durationSec: summary?.durationSec ?? 0,
    reps,
    keys,
    sets: summary?.sets ?? 0,
  });

  // Celebrate a new record out loud once the summary appears.
  const prAnnounced = useRef(false);
  useEffect(() => {
    if (summary && summary.records.length > 0 && !prAnnounced.current) {
      prAnnounced.current = true;
      const id = setTimeout(() => setBubble(say('pr')), 2200);
      return () => clearTimeout(id);
    }
  }, [summary, say]);

  if (finished && summary) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center overflow-y-auto bg-bg p-6 text-center animate-fadeIn">
        <div aria-hidden className="speed-lines pointer-events-none absolute inset-0 opacity-60" />
        <Confetti />
        <div className="relative my-auto w-full max-w-md py-6">
          <div className="flex flex-col items-center gap-4">
            <CoachPortrait coach={coach} size={150} mood="hype" priority />
            {bubble ? <SpeechBubble side="top" color={coach.colors[0]}>{bubble}</SpeechBubble> : null}
          </div>
          <h2 className="mt-6 flex items-center justify-center gap-2 font-display text-3xl tracking-wide">
            <CheckCircle2 className="text-ok" size={26} />
            {t('complete')}
          </h2>
          <p className="mt-2 text-ink-muted">{title}</p>
          <p className="mx-auto mt-3 inline-flex animate-pop items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-1.5 font-display text-lg text-bg">
            <Sparkles size={16} /> {t('xpEarned', { xp: xpReward })}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: t('time'), value: formatDuration(summary.durationSec) },
              { label: t('sets'), value: String(summary.sets) },
              { label: t('reps'), value: summary.totalReps ? String(summary.totalReps) : '—' },
              { label: t('kcal'), value: kcalEstimate ?? '—' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-sm border border-line bg-surface p-3">
                <p className="font-display text-xl tracking-wide">{stat.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{stat.label}</p>
              </div>
            ))}
          </div>

          {summary.records.length > 0 ? (
            <div className="mt-5 rounded-md border border-brass/30 bg-brass-dim/60 p-4 text-start">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-brass">
                <Trophy size={14} /> {t('records')}
              </p>
              <ul className="mt-2 space-y-1">
                {summary.records.map((r) => (
                  <li key={r.name} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink">{r.name}</span>
                    <span className="font-mono text-ink-muted">
                      {r.reps} <span className="text-ink-faint">({t('was', { count: r.previous })})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {summary.levelUps.length > 0 ? (
            <div className="mt-3 rounded-md border border-ok/30 bg-ok-dim/50 p-4 text-start">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ok">
                <TrendingUp size={14} /> {t('readyTitle')}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{t('readyBody', { names: summary.levelUps.join(', ') })}</p>
            </div>
          ) : null}

          {onShare ? (
            <Button
              variant="secondary"
              size="lg"
              className="mt-6 w-full"
              loading={shareState === 'sharing'}
              disabled={shareState === 'shared'}
              onClick={async () => {
                setShareState('sharing');
                const ok = await onShare(result());
                setShareState(ok ? 'shared' : 'error');
              }}
            >
              <Share2 size={18} />
              {shareState === 'shared' ? t('shared') : t('shareCommunity')}
            </Button>
          ) : null}
          {shareState === 'error' ? <p className="mt-2 text-xs text-danger">{t('shareError')}</p> : null}

          <Button
            size="lg"
            className="mt-3 w-full"
            onClick={() => {
              onComplete(result());
              writeLocalStorage(storageKey, null);
              onClose();
            }}
          >
            {t('saveFinish')}
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
  const mood: CoachMood = paused
    ? 'still'
    : step.type === 'rest'
      ? 'rest'
      : step.isTimed && secondsLeft <= 3
        ? 'strain'
        : 'hype';
  const bubbleText = bubble || line('start');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-bg animate-fadeIn">
      <div
        aria-hidden
        className={cn(
          'speed-lines pointer-events-none fixed inset-0 transition-opacity duration-700',
          step.type === 'work' && !paused ? 'opacity-70' : 'opacity-0'
        )}
      />
      <div className="relative flex items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-ink-faint">{title}</p>
          <p className="text-sm font-semibold text-ink">
            {t('progressLabel', {
              exercise: step.exerciseIndex + 1,
              total: exercises.length,
              set: step.setNumber,
              sets: step.totalSets,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateSettings({ voice: !settings.voice })}
            aria-label={settings.voice ? t('voiceOff') : t('voiceOn')}
            aria-pressed={settings.voice}
            className="rounded-xs p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            {settings.voice ? <Mic size={19} /> : <MicOff size={19} />}
          </button>
          <button
            onClick={() => {
              primeAudio();
              updateSettings({ sound: !settings.sound });
            }}
            aria-label={settings.sound ? t('mute') : t('unmute')}
            aria-pressed={settings.sound}
            className="rounded-xs p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            {settings.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-xs p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {showResumed ? (
        <div className="relative mx-5 flex items-center justify-between gap-3 rounded-sm border border-brass/30 bg-brass-dim/60 px-4 py-2.5 text-sm">
          <span className="text-ink-muted">{t('resumed')}</span>
          <button onClick={restart} className="flex items-center gap-1.5 font-semibold text-brass hover:text-brass-hover">
            <RotateCcw size={14} /> {t('startOver')}
          </button>
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-5 py-3 sm:flex-row sm:gap-14">
        {/* Coach */}
        <div className="flex w-full max-w-sm items-start gap-3 sm:w-auto sm:max-w-[260px] sm:flex-col sm:items-center">
          <CoachPortrait coach={coach} size={74} mood={mood} className="sm:hidden" />
          <CoachPortrait coach={coach} size={220} mood={mood} className="hidden sm:inline-block" priority />
          <div className="min-w-0 flex-1 sm:w-full">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: coach.colors[0] }}>
              {coach.name}
            </p>
            <SpeechBubble key={bubbleText} color={coach.colors[0]} side="left" className="sm:hidden">
              {bubbleText}
            </SpeechBubble>
            <SpeechBubble key={`${bubbleText}-d`} color={coach.colors[0]} side="top" className="hidden sm:block">
              {bubbleText}
            </SpeechBubble>
          </div>
        </div>

        {/* Timer + exercise */}
        <div className="flex flex-col items-center">
          <span
            className={cn(
              'mb-2 font-mono text-xs uppercase tracking-[0.2em]',
              step.type === 'rest' ? 'text-brass' : 'text-forge'
            )}
          >
            {step.type === 'rest' ? t('rest') : paused ? t('paused') : t('work')}
          </span>

          {step.isTimed ? (
            <RingProgress
              value={progressPct}
              size={196}
              stroke={12}
              colorClassName={step.type === 'rest' ? 'text-brass' : 'text-forge'}
              className={cn(!paused && secondsLeft <= 3 && secondsLeft > 0 && 'animate-pulseRing')}
            >
              <div className="text-center">
                <div className="font-display text-6xl tracking-wide">{secondsLeft}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('seconds')}</div>
              </div>
            </RingProgress>
          ) : (
            <div className="flex h-[196px] w-[196px] flex-col items-center justify-center rounded-full border-[12px] border-forge-dim text-center shadow-glow">
              <div className="font-display text-3xl tracking-wide">{step.reps}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('targetReps')}</div>
            </div>
          )}

          <div className="mt-5 flex max-w-sm items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-surface-raised">
              {shownExercise?.image ? (
                <Image src={shownExercise.image} alt="" fill className="object-cover" sizes="56px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-faint">
                  <Dumbbell size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0 text-start">
              {step.type === 'rest' ? (
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('upNext')}</p>
              ) : null}
              <h2 className="font-display text-2xl leading-tight tracking-wide">{shownExercise?.name ?? step.exerciseKey}</h2>
            </div>
          </div>
          {step.type === 'work' ? (
            <p className="mt-2 max-w-xs text-center text-sm text-ink-muted">{exercise?.instructions?.[0]}</p>
          ) : null}

          {isRepWork ? (
            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRepInput((r) => Math.max(0, r - 1))}
                  aria-label={t('oneFewer')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-forge/60 hover:text-ink"
                >
                  <Minus size={18} />
                </button>
                <span key={repInput} className="w-16 animate-pop text-center font-display text-4xl tracking-wide" aria-live="polite">
                  {repInput}
                </span>
                <button
                  onClick={() => setRepInput((r) => r + 1)}
                  aria-label={t('oneMore')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-forge/60 hover:text-ink"
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('repsDone')}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative px-6 pb-3">
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

      <div className="relative flex items-center justify-center gap-2 px-4 pb-3 pt-2 sm:gap-3">
        <Button variant="ghost" size="lg" onClick={goPrev} disabled={stepIndex === 0} aria-label={t('previous')} className="px-4">
          <SkipBack size={18} className="rtl:rotate-180" />
        </Button>
        {step.isTimed ? (
          <Button variant="secondary" size="lg" onClick={togglePause} className="w-[124px]">
            {paused ? <Play size={18} /> : <Pause size={18} />}
            {paused ? t('resume') : t('pause')}
          </Button>
        ) : null}
        {step.type === 'rest' ? (
          <Button variant="secondary" size="lg" onClick={() => addTime(15)} className="px-4">
            +15s
          </Button>
        ) : null}
        <Button size="lg" onClick={advance} className={isRepWork ? 'w-44' : 'w-[124px]'}>
          {isRepWork ? <CheckCircle2 size={18} /> : <SkipForward size={18} className="rtl:rotate-180" />}
          {isRepWork ? t('setDone') : t('skip')}
        </Button>
      </div>
      <p className="relative hidden pb-6 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint sm:block">
        {step.isTimed ? t('keysTimed') : t('keysReps')}
      </p>
      <div className="pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:hidden" />
    </div>
  );
}
