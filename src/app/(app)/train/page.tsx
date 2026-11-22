'use client';

import { Suspense, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Check, Clock, Flag, Lock, Play, Skull, Sparkles, Swords, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CoachAvatar, CoachPortrait } from '@/components/coach/coach-portrait';
import { SessionPlayer, type SessionResult } from '@/components/workout/session-player';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { useIsClient } from '@/hooks/use-is-client';
import { useCommunityShare } from '@/hooks/use-community-share';
import { getCoach } from '@/lib/coaches';
import { getExercise } from '@/lib/program/exercises';
import { XP } from '@/lib/program/levels';
import { BossEmblem } from '@/components/boss/boss-emblem';
import { BossFight } from '@/components/boss/boss-fight';
import { useRaidHit } from '@/hooks/use-raid-hit';
import { BOSS_UNLOCK_DAYS, bossForArc, bossHp, isBossUnlocked } from '@/lib/program/bosses';
import { recommendRoutines } from '@/lib/program/plan';
import { isStressful, safeExercises } from '@/lib/program/safety';
import { ARCS, ROUTINES, arcTarget, isArcRestDay, type Arc, type Routine, type RoutineFocus } from '@/lib/program/routines';
import { primeAudio } from '@/lib/session-cues';
import type { Equipment, WorkoutExercise } from '@/lib/types';
import { cn, daysBetween, parseDateKey, todayKey, DIFFICULTY_TONE } from '@/lib/utils';

type EquipmentFilter = 'any' | 'none' | 'dumbbell' | 'kettlebell' | 'band' | 'pullup-bar' | 'jump-rope' | 'gym';
type TimeFilter = 'any' | '10' | '20' | '21';

const GYM_GEAR: Equipment[] = ['barbell', 'machine', 'cable', 'bench'];

function matchesEquipment(r: Routine, f: EquipmentFilter) {
  if (f === 'any') return true;
  if (f === 'none') return r.equipment.length === 0;
  if (f === 'gym') return r.equipment.some((e) => GYM_GEAR.includes(e));
  return r.equipment.includes(f);
}

function matchesTime(r: Routine, f: TimeFilter) {
  if (f === 'any') return true;
  if (f === '10') return r.minutes <= 10;
  if (f === '20') return r.minutes > 10 && r.minutes <= 20;
  return r.minutes > 20;
}

interface ActiveSession {
  key: string;
  title: string;
  coachId: string;
  exercises: WorkoutExercise[];
  xp: number;
  onDone: (result: SessionResult) => void;
}

function TrainInner() {
  const t = useTranslations('train');
  const tEq = useTranslations('equipment');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isClient = useIsClient();
  const { progress, settings, logRoutine } = useProgress();
  const { toast } = useToast();
  const share = useCommunityShare();
  const hit = useRaidHit();
  const limitations = progress.plan?.limitations;
  const recommended = useMemo(
    () => new Set(progress.plan ? recommendRoutines(progress.plan, settings.trainingMode, 6).map((r) => r.id) : []),
    [progress.plan, settings.trainingMode]
  );

  const tab = searchParams.get('tab') === 'arcs' ? 'arcs' : 'quick';
  const [equipment, setEquipment] = useState<EquipmentFilter>('any');
  const [time, setTime] = useState<TimeFilter>('any');
  const [focus, setFocus] = useState<RoutineFocus | 'any'>('any');
  const [active, setActive] = useState<ActiveSession | null>(null);

  const routines = ROUTINES.filter(
    (r) => matchesEquipment(r, equipment) && matchesTime(r, time) && (focus === 'any' || r.focus === focus)
  ).sort((a, b) => Number(recommended.has(b.id)) - Number(recommended.has(a.id)));
  const doneCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of progress.routineLogs) counts.set(log.routineId, (counts.get(log.routineId) ?? 0) + 1);
    return counts;
  }, [progress.routineLogs]);

  const startRoutine = (r: Routine) => {
    primeAudio();
    setActive({
      key: `routine-${r.id}`,
      title: r.name,
      coachId: r.coachId,
      // Injury-friendly swaps from the plan questionnaire.
      exercises: safeExercises(r.exercises, limitations, settings.trainingMode),
      xp: XP.quickWorkout,
      onDone: (result) => {
        logRoutine({ routineId: r.id, date: result.date, durationSec: result.durationSec, reps: result.reps, keys: result.keys });
        hit(XP.quickWorkout);
        toast(t('routineLogged', { name: r.name, xp: XP.quickWorkout }));
      },
    });
  };

  const selectClass =
    'rounded-sm border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-forge focus:outline-none';

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-1 text-ink-muted">{t('subtitle')}</p>
      </div>

      <div role="tablist" className="inline-flex rounded-full border border-line bg-surface p-1">
        {(['quick', 'arcs'] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => router.replace(id === 'arcs' ? '/train?tab=arcs' : '/train')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === id ? 'bg-brand-gradient text-white shadow-glow' : 'text-ink-muted hover:text-ink'
            )}
          >
            {id === 'quick' ? <Zap size={14} /> : <Swords size={14} />}
            {id === 'quick' ? t('tabQuick') : t('tabArcs')}
          </button>
        ))}
      </div>

      {tab === 'quick' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <select value={equipment} onChange={(e) => setEquipment(e.target.value as EquipmentFilter)} aria-label={t('anyEquipment')} className={selectClass}>
              <option value="any">{t('anyEquipment')}</option>
              <option value="none">{t('noEquipment')}</option>
              {(['dumbbell', 'kettlebell', 'band', 'pullup-bar', 'jump-rope'] as const).map((eq) => (
                <option key={eq} value={eq}>
                  {tEq(eq)}
                </option>
              ))}
              <option value="gym">{tEq('gym')}</option>
            </select>
            <select value={time} onChange={(e) => setTime(e.target.value as TimeFilter)} aria-label={t('anyTime')} className={selectClass}>
              <option value="any">{t('anyTime')}</option>
              <option value="10">{t('upTo', { count: 10 })}</option>
              <option value="20">{t('upTo', { count: 20 })}</option>
              <option value="21">{t('over', { count: 21 })}</option>
            </select>
            <select value={focus} onChange={(e) => setFocus(e.target.value as RoutineFocus | 'any')} aria-label={t('anyFocus')} className={selectClass}>
              <option value="any">{t('anyFocus')}</option>
              {(['full', 'upper', 'lower', 'core', 'cardio', 'mobility', 'strength'] as const).map((f) => (
                <option key={f} value={f}>
                  {t(`focus.${f}`)}
                </option>
              ))}
            </select>
            <span className="font-mono text-xs text-ink-faint">{t('count', { shown: routines.length, total: ROUTINES.length })}</span>
          </div>

          {routines.length === 0 ? (
            <EmptyState icon={Zap} title={t('empty')} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {routines.map((r) => {
                const coach = getCoach(r.coachId);
                const done = doneCount.get(r.id) ?? 0;
                return (
                  <Card key={r.id} className="group flex flex-col overflow-hidden transition-colors hover:border-forge/40">
                    <div
                      className="h-1.5"
                      style={{ backgroundImage: `linear-gradient(90deg, ${coach.colors[0]}, ${coach.colors[1]})` }}
                    />
                    <CardContent className="flex flex-1 flex-col">
                      <div className="flex items-start gap-3">
                        <CoachAvatar coach={coach} size={48} />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg leading-tight tracking-wide">{r.name}</h3>
                          {recommended.has(r.id) ? (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brass/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass">
                              <Sparkles size={10} /> {t('forYou')}
                            </span>
                          ) : null}
                          <p className="mt-0.5 text-xs text-ink-faint">{coach.name}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-ink-muted">{r.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">
                          <Clock size={11} /> {r.minutes} min
                        </Badge>
                        <Badge tone={DIFFICULTY_TONE[r.difficulty]}>{t(`difficulty.${r.difficulty}`)}</Badge>
                        <Badge tone="neutral">{t(`focus.${r.focus}`)}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-ink-faint">
                        {r.equipment.length === 0
                          ? t('noEquipment')
                          : t('needs', { list: r.equipment.map((eq) => tEq(eq)).join(', ') })}
                        {' · '}
                        {r.exercises.length} × {r.exercises.map((x) => getExercise(x.exerciseKey)?.name).slice(0, 2).join(', ')}…
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="font-mono text-[11px] text-ok">{done > 0 ? t('doneTimes', { count: done }) : ''}</span>
                        <Button size="sm" onClick={() => startRoutine(r)}>
                          <Play size={14} /> {tCommon('start')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <ArcsTab onStartSession={(s) => setActive(s)} />
      )}

      {active && isClient
        ? createPortal(
            <SessionPlayer
              key={active.key}
              sessionKey={active.key}
              title={active.title}
              exercises={active.exercises}
              xpReward={active.xp}
              coachOverride={getCoach(active.coachId)}
              previousLogs={[...progress.sessionLogs, ...progress.routineLogs]}
              onClose={() => setActive(null)}
              onShare={(result) => share(result, active.title, active.coachId)}
              onComplete={active.onDone}
            />,
            document.body
          )
        : null}
    </div>
  );
}

function ArcsTab({ onStartSession }: { onStartSession: (s: ActiveSession) => void }) {
  const t = useTranslations('train.arcs');
  const tBoss = useTranslations('bosses');
  const { progress, startArc, toggleArcDay, leaveArc } = useProgress();
  const { toast } = useToast();
  const hit = useRaidHit();
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);
  const [fighting, setFighting] = useState<Arc | null>(null);
  const limitations = progress.plan?.limitations ?? [];
  const today = todayKey();

  const sorted = [...ARCS].sort((a, b) => Number(Boolean(progress.arcs[b.id])) - Number(Boolean(progress.arcs[a.id])));

  const doWithCoach = (arc: Arc, arcDay: number) => {
    const target = arcTarget(arc, arcDay);
    const exercise: WorkoutExercise =
      arc.unit === 'seconds'
        ? { exerciseKey: arc.exerciseKey, sets: 1, timeSeconds: target, rest: '0s' }
        : { exerciseKey: arc.exerciseKey, sets: 1, reps: String(target), rest: '0s' };
    primeAudio();
    onStartSession({
      key: `arc-${arc.id}-${arcDay}`,
      title: `${arc.name} · ${t('day', { day: arcDay, total: arc.days })}`,
      coachId: arc.coachId,
      exercises: [exercise],
      xp: XP.arcDay,
      onDone: () => {
        if (!progress.arcs[arc.id]?.doneDays.includes(arcDay)) {
          toggleArcDay(arc.id, arcDay);
          hit(XP.arcDay);
        }
        toast(t('loggedToast', { day: arcDay, xp: XP.arcDay }));
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{t('intro')}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sorted.map((arc) => {
          const coach = getCoach(arc.coachId);
          const state = progress.arcs[arc.id];
          const exerciseName = getExercise(arc.exerciseKey)?.name ?? arc.exerciseKey;
          const arcDay = state ? daysBetween(parseDateKey(state.startedOn), parseDateKey(today)) + 1 : 0;
          const finished = state ? arcDay > arc.days || state.doneDays.length >= arc.days - Math.floor(arc.days / 7) : false;
          const day = Math.min(Math.max(arcDay, 1), arc.days);
          const rest = state && !finished && isArcRestDay(day);
          const target = arcTarget(arc, day);
          const doneToday = state?.doneDays.includes(day);
          const boss = bossForArc(arc.id);
          const bossRecord = progress.bosses[arc.id];
          const bossOpen = isBossUnlocked(state) || !!bossRecord?.defeatedOn;
          const risky = isStressful(arc.exerciseKey, limitations);

          return (
            <Card key={arc.id} className="overflow-hidden">
              <div className="relative flex items-center gap-4 p-5">
                <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-40" />
                <CoachPortrait coach={coach} size={84} mood={state ? 'hype' : 'idle'} />
                <div className="relative min-w-0 flex-1">
                  <h3 className="font-display text-xl tracking-wide">{arc.name}</h3>
                  <p className="text-xs text-ink-faint">
                    {coach.name} · {exerciseName}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">{arc.description}</p>
                  {risky ? (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-brass">
                      <AlertTriangle size={12} /> {t('risky')}
                    </p>
                  ) : null}
                </div>
              </div>

              {boss ? (
                <div className="mx-5 mb-4 flex items-center gap-3 rounded-md border border-danger/25 bg-danger-dim/30 p-3">
                  <BossEmblem boss={boss} size={44} defeated={!!bossRecord?.defeatedOn} muted={!bossOpen} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-danger">
                      <Skull size={11} /> {t('bossLabel')}
                    </p>
                    <p className="truncate text-sm font-semibold">{tBoss(`${boss.key}.name`)}</p>
                    <p className="text-[11px] text-ink-faint">
                      {bossRecord?.defeatedOn
                        ? t('bossBeaten')
                        : bossOpen
                          ? t('bossReady', { hp: bossHp(boss, arc) })
                          : t('bossLocked', { done: state?.doneDays.length ?? 0, need: BOSS_UNLOCK_DAYS })}
                    </p>
                  </div>
                  <Button size="sm" variant={bossOpen ? 'danger' : 'ghost'} disabled={!bossOpen} onClick={() => setFighting(arc)}>
                    {bossOpen ? <Swords size={14} /> : <Lock size={14} />}
                    {bossRecord?.defeatedOn ? t('rematch') : t('fight')}
                  </Button>
                </div>
              ) : null}

              <CardContent className="pt-0">
                {!state ? (
                  <Button onClick={() => startArc(arc.id)} className="w-full">
                    <Flag size={16} /> {t('start')}
                  </Button>
                ) : finished ? (
                  <div className="rounded-md border border-ok/30 bg-ok-dim/50 p-4 text-center">
                    <p className="font-display text-lg text-ok">{t('finished')}</p>
                    <p className="mt-1 text-sm text-ink-muted">{t('finishedBody', { name: arc.name })}</p>
                    <Button variant="secondary" size="sm" className="mt-3" onClick={() => startArc(arc.id)}>
                      {t('restart')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-widest text-brass">
                        {t('day', { day, total: arc.days })}
                      </span>
                      <span className="font-mono text-xs text-ink-faint">
                        {t('progress', { done: state.doneDays.length, total: arc.days })}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-10 gap-1">
                      {Array.from({ length: arc.days }, (_, i) => i + 1).map((d) => {
                        const isDone = state.doneDays.includes(d);
                        const isRest = isArcRestDay(d);
                        return (
                          <span
                            key={d}
                            title={`${d}`}
                            className={cn(
                              'flex aspect-square items-center justify-center rounded-[4px] text-[9px] font-mono',
                              isDone
                                ? 'bg-ok text-bg'
                                : d === day
                                  ? 'bg-forge text-bg'
                                  : isRest
                                    ? 'bg-surface-raised/50 text-ink-faint'
                                    : d < day
                                      ? 'bg-danger/30 text-ink-faint'
                                      : 'bg-surface-raised text-ink-faint'
                            )}
                          >
                            {isDone ? <Check size={10} strokeWidth={3} /> : d}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-md border border-line bg-bg p-4">
                      {rest ? (
                        <p className="text-sm text-ink-muted">{t('restToday')}</p>
                      ) : (
                        <>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('target')}</p>
                          <p className="mt-1 font-display text-3xl tracking-wide text-gradient">
                            {arc.unit === 'reps' ? t('targetReps', { count: target }) : t('targetSeconds', { count: target })}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => doWithCoach(arc, day)} disabled={doneToday}>
                              <Play size={14} /> {t('doIt')}
                            </Button>
                            <Button size="sm" variant={doneToday ? 'outline' : 'secondary'} onClick={() => toggleArcDay(arc.id, day)}>
                              <Check size={14} /> {doneToday ? t('undo') : t('markDone')}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirmLeave === arc.id) {
                          leaveArc(arc.id);
                          setConfirmLeave(null);
                        } else setConfirmLeave(arc.id);
                      }}
                      className="mt-3 text-xs font-semibold text-ink-faint hover:text-danger"
                    >
                      {confirmLeave === arc.id ? t('leaveConfirm') : t('leave')}
                    </button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {fighting && bossForArc(fighting.id) ? (
        <BossFight arc={fighting} boss={bossForArc(fighting.id)!} onClose={() => setFighting(null)} />
      ) : null}
    </div>
  );
}

export default function TrainPage() {
  return (
    <Suspense>
      <TrainInner />
    </Suspense>
  );
}
