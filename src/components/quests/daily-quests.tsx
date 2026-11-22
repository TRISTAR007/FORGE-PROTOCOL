'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Droplets, Dumbbell, Flame, HeartHandshake, Pause, Play, ScrollText, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useProgress } from '@/context/progress-context';
import { useDailyQuests } from '@/hooks/use-daily-quests';
import { useRaidHit } from '@/hooks/use-raid-hit';
import { exerciseName } from '@/lib/program/exercises';
import { XP } from '@/lib/program/levels';
import { msUntilReset } from '@/lib/program/quests';
import { hapticImpact, hapticSuccess } from '@/lib/native';
import type { Quest } from '@/lib/types';
import { cn } from '@/lib/utils';

/** "Resets in 5h 12m" — ticks every 30s in its own tiny component so the card doesn't re-render. */
function ResetCountdown() {
  const t = useTranslations('quests');
  const [ms, setMs] = useState(() => msUntilReset());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilReset()), 30_000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-faint">
      <Timer size={12} /> {t('resetsIn', { h, m })}
    </span>
  );
}

/** Countdown for a timed quest (plank, wall sit…). Lives in its own component so only it re-renders each tick. */
function HoldTimer({ remaining, onFinish }: { remaining: number; onFinish: (seconds: number) => void }) {
  const t = useTranslations('quests');
  const [endAt, setEndAt] = useState<number | null>(null);
  const [left, setLeft] = useState(remaining);

  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(id);
        setEndAt(null);
        void hapticSuccess();
        onFinish(remaining);
      }
    }, 250);
    return () => clearInterval(id);
  }, [endAt, onFinish, remaining]);

  const running = endAt !== null;
  return (
    <button
      type="button"
      onClick={() => {
        if (running) {
          // Pause: bank the seconds held so far.
          setEndAt(null);
          onFinish(remaining - left);
        } else {
          setLeft(remaining);
          setEndAt(Date.now() + remaining * 1000);
        }
      }}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors',
        running ? 'bg-aqua/20 text-aqua' : 'bg-surface-raised text-ink hover:bg-surface-hover'
      )}
    >
      {running ? <Pause size={13} /> : <Play size={13} />}
      {running ? `${left}s` : t('startTimer')}
    </button>
  );
}

const QuestRow = memo(function QuestRow({
  quest,
  dateKey,
  water,
  onAdd,
  onWater,
}: {
  quest: Quest;
  dateKey: string;
  water: number;
  onAdd: (quest: Quest, amount: number | 'complete') => void;
  onWater: () => void;
}) {
  const t = useTranslations('quests');
  const name = quest.exerciseKey ? exerciseName(quest.exerciseKey) : '';
  const progress = quest.kind === 'water' ? Math.min(water, quest.target) : quest.progress;
  const remaining = Math.max(0, quest.target - progress);

  const label =
    quest.kind === 'workout'
      ? t('workout')
      : quest.kind === 'water'
        ? t('water', { n: quest.target })
        : quest.kind === 'seconds'
          ? t('seconds', { n: quest.target, name })
          : t('reps', { n: quest.target, name });

  const Icon = quest.recovery ? HeartHandshake : quest.kind === 'water' ? Droplets : quest.kind === 'workout' ? Flame : Dumbbell;
  const step = quest.target <= 20 ? 5 : 10;

  return (
    <li
      key={`${dateKey}-${quest.id}`}
      className={cn(
        'rounded-md border p-3 transition-colors',
        quest.done ? 'border-ok/30 bg-ok/5' : quest.recovery ? 'border-aqua/40 bg-aqua/5' : 'border-line bg-surface'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            quest.done ? 'bg-ok text-bg' : quest.recovery ? 'bg-aqua/20 text-aqua' : 'bg-forge-dim text-forge'
          )}
        >
          {quest.done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={cn('text-sm font-semibold', quest.done && 'text-ink-muted line-through')}>{label}</p>
            <span className="shrink-0 font-mono text-[11px] text-brass">+{quest.recovery ? XP.recoveryQuest : XP.quest} XP</span>
          </div>
          {quest.recovery ? <p className="mt-0.5 text-xs text-ink-faint">{t('recoveryNote')}</p> : null}
          {quest.kind === 'reps' || quest.kind === 'seconds' || quest.kind === 'water' ? (
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar value={(progress / quest.target) * 100} className="h-1.5" fillClassName={quest.done ? 'bg-ok' : undefined} />
              <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                {progress}/{quest.target}
                {quest.kind === 'seconds' ? 's' : ''}
              </span>
            </div>
          ) : null}
          {!quest.done ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {quest.kind === 'reps' ? (
                <>
                  {step < remaining ? <QuestButton onClick={() => onAdd(quest, step)}>+{step}</QuestButton> : null}
                  {step * 2 < remaining ? <QuestButton onClick={() => onAdd(quest, step * 2)}>+{step * 2}</QuestButton> : null}
                  <QuestButton primary onClick={() => onAdd(quest, 'complete')}>
                    {t('markDone')}
                  </QuestButton>
                </>
              ) : quest.kind === 'seconds' ? (
                <>
                  <HoldTimer remaining={remaining} onFinish={(s) => onAdd(quest, s)} />
                  <QuestButton primary onClick={() => onAdd(quest, 'complete')}>
                    {t('markDone')}
                  </QuestButton>
                </>
              ) : quest.kind === 'water' ? (
                <QuestButton onClick={onWater}>{t('addGlass')}</QuestButton>
              ) : (
                <Link
                  href="/train"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-gradient px-3 text-xs font-semibold text-white"
                >
                  <Play size={13} /> {t('goTrain')}
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
});

function QuestButton({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-[3rem] items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors',
        primary ? 'bg-forge text-bg hover:bg-forge-hover' : 'bg-surface-raised text-ink hover:bg-surface-hover'
      )}
    >
      {children}
    </button>
  );
}

/** The daily quest board: resets at midnight, gives XP, and never punishes a missed day. */
export function DailyQuests({ className }: { className?: string }) {
  const t = useTranslations('quests');
  const { setWater, addQuestProgress } = useProgress();
  const { dateKey, day, questStreak, water } = useDailyQuests();
  const hit = useRaidHit();

  if (!day) return null;
  const regular = day.quests.filter((q) => !q.recovery);
  const doneCount = regular.filter((q) => q.done).length;

  const onAdd = (quest: Quest, amount: number | 'complete') => {
    const willFinish = amount === 'complete' || quest.progress + amount >= quest.target;
    void hapticImpact('light');
    addQuestProgress(dateKey, quest.id, amount);
    if (willFinish) {
      void hapticSuccess();
      hit(quest.recovery ? XP.recoveryQuest : XP.quest);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-raised/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-gradient text-white shadow-glow">
            <ScrollText size={18} />
          </span>
          <div>
            <h2 className="font-display text-base tracking-wide">{t('title')}</h2>
            <ResetCountdown />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-xs text-ink-muted">
            {doneCount}/{regular.length}
          </span>
          {questStreak > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brass/15 px-2 py-0.5 text-[11px] font-semibold text-brass">
              <Flame size={11} /> {t('streak', { n: questStreak })}
            </span>
          ) : null}
        </div>
      </div>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {day.quests.map((q) => (
            <QuestRow
              key={q.id}
              quest={q}
              dateKey={dateKey}
              water={water}
              onAdd={onAdd}
              onWater={() => setWater(dateKey, water + 1)}
            />
          ))}
        </ul>
        <p
          className={cn(
            'mt-3 rounded-md px-3 py-2 text-center text-xs',
            day.cleared ? 'bg-ok/10 font-semibold text-ok' : 'text-ink-faint'
          )}
        >
          {day.cleared ? t('cleared', { xp: XP.questClear }) : t('clearHint', { xp: XP.questClear })}
        </p>
      </CardContent>
    </Card>
  );
}
