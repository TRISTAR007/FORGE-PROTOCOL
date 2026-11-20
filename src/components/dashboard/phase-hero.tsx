'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Flame, Play, Volume2 } from 'lucide-react';
import { RingProgress } from '@/components/ui/ring-progress';
import { Button } from '@/components/ui/button';
import { CoachPortrait, SpeechBubble } from '@/components/coach/coach-portrait';
import { BeltBadge } from '@/components/community/belt-badge';
import { useCoach } from '@/hooks/use-coach';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { pct } from '@/lib/utils';
import type { ResolvedWorkout } from '@/lib/types';
import { getPhase } from '@/lib/program/program';

/** Dashboard hero: your coach's greeting, today's workout, and your level. */
export function PhaseHero({
  workout,
  totalDays,
  streak,
}: {
  workout: ResolvedWorkout;
  totalDays: number;
  streak: number;
}) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const phase = getPhase(workout.weekNumber);
  const { coach, line, say } = useCoach();
  const { level } = useTrainingStats();
  const greeting = line('greet', {}, workout.dayNumber);

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage: `radial-gradient(600px 300px at 0% 0%, ${coach.colors[0]}30, transparent 60%), radial-gradient(500px 300px at 100% 100%, ${coach.colors[1]}25, transparent 60%)`,
        }}
      />
      <div aria-hidden className="speed-lines pointer-events-none absolute -start-40 -top-40 h-[480px] w-[480px] opacity-40" />

      <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[auto,1fr]">
        {/* Coach + greeting */}
        <div className="flex items-start gap-4 md:flex-col md:items-center md:gap-3">
          <CoachPortrait coach={coach} size={120} mood="idle" priority className="md:hidden" />
          <CoachPortrait coach={coach} size={168} mood="idle" priority className="hidden md:inline-block" />
          <div className="min-w-0 flex-1 md:max-w-[220px]">
            <div className="mb-1 flex items-center gap-1.5">
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: coach.colors[0] }}>
                {t('coachSays', { name: coach.name })}
              </p>
              <button
                onClick={() => say('greet', {}, workout.dayNumber, true)}
                aria-label={`${coach.name}`}
                className="rounded-full p-1 text-ink-faint hover:bg-surface-hover hover:text-ink"
              >
                <Volume2 size={13} />
              </button>
            </div>
            <SpeechBubble color={coach.colors[0]} side="left" className="md:hidden">
              {greeting}
            </SpeechBubble>
            <SpeechBubble color={coach.colors[0]} side="top" className="hidden md:block">
              {greeting}
            </SpeechBubble>
          </div>
        </div>

        {/* Today */}
        <div className="flex flex-col justify-between gap-5">
          <div className="flex items-center gap-5">
            <RingProgress value={pct(workout.dayNumber, totalDays)} size={96} stroke={9}>
              <div className="text-center">
                <div className="font-display text-2xl leading-none tracking-wide">{workout.dayNumber}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">/ {totalDays}</div>
              </div>
            </RingProgress>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-brass/30 bg-brass-dim px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brass">
                {t('phase', { id: phase.id, name: phase.name })}
              </span>
              <h1 className="mt-2 font-display text-2xl leading-tight tracking-wide sm:text-3xl">{workout.label}</h1>
              <p className="mt-1 text-sm text-ink-muted">{workout.focus}</p>
              {streak > 0 ? (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-forge">
                  <Flame size={14} /> {t('streak', { count: streak })}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {workout.isRestDay ? (
              <Link href="/workout" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('viewRestDay')}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/workout?start=1" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-brand-gradient text-white shadow-glow hover:opacity-95 sm:w-auto">
                    <Play size={18} /> {t('startToday')}
                  </Button>
                </Link>
                <Link href="/workout" className="text-center text-sm font-semibold text-ink-muted transition-colors hover:text-forge">
                  {t('viewPlan', { duration: workout.duration })}
                </Link>
              </>
            )}
          </div>

          {/* XP bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <BeltBadge level={level.level} />
              </span>
              <span className="font-mono text-[11px] text-ink-faint">
                {tc('xp', { xp: level.xp.toLocaleString() })} · {t('xpToNext', { xp: level.toNext.toLocaleString(), level: level.level + 1 })}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-gold-gradient transition-[width] duration-700"
                style={{ width: `${Math.max(3, (level.intoLevel / level.levelSpan) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
