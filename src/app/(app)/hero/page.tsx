'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, ClipboardList, Lock, Palette, Plus, RotateCcw, ShieldCheck, Skull, Swords } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { HeroAvatar } from '@/components/hero/hero-avatar';
import { AvatarEditor } from '@/components/hero/avatar-editor';
import { BossEmblem } from '@/components/boss/boss-emblem';
import { DailyQuests } from '@/components/quests/daily-quests';
import { PlanBuilderModal } from '@/components/plan/plan-builder-modal';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { unlockCount } from '@/lib/avatar';
import { ARC_BOSSES } from '@/lib/program/bosses';
import { RANKS, nextRank } from '@/lib/program/levels';
import { STAT_COLORS, STAT_IDS, powerScore } from '@/lib/program/stats';
import { cn } from '@/lib/utils';

export default function HeroPage() {
  const t = useTranslations('hero');
  const tPlan = useTranslations('plan');
  const tSettings = useTranslations('settings');
  const tBelts = useTranslations('belts');
  const tBoss = useTranslations('bosses');
  const { profile } = useAuth();
  const { progress, settings, allocateStat, resetStats } = useProgress();
  const { level, stats, questStreak, bossesDefeated } = useTrainingStats();
  const [editing, setEditing] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const unlock = { level: level.level, bosses: bossesDefeated, quests: progress.questTotals.done, clears: progress.questTotals.clears };
  const parts = unlockCount(unlock);
  const upcoming = nextRank(level.level);
  const plan = progress.plan;
  const maxStat = Math.max(40, ...STAT_IDS.map((id) => stats.total[id]));

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-1 text-ink-muted">{t('subtitle')}</p>
      </div>

      {/* Status window */}
      <Card className="relative overflow-hidden">
        <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-40" />
        <CardContent className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <HeroAvatar avatar={progress.avatar} size={140} ring={level.rank.color} title={t('avatarLabel')} />
            <span
              className="absolute -bottom-1 -end-1 flex h-11 min-w-11 items-center justify-center rounded-md border-2 border-bg px-1.5 font-display text-lg text-bg shadow-raised"
              style={{ background: level.rank.color }}
            >
              {level.rank.id}
            </span>
          </div>
          <div className="w-full min-w-0 flex-1 text-center sm:text-start">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{t('statusWindow')}</p>
            <h2 className="mt-0.5 truncate font-display text-2xl tracking-wide">{profile?.full_name ?? t('defaultName')}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-semibold">{t('levelN', { n: level.level })}</span>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${level.rank.color}26`, color: level.rank.color }}>
                {t('rankN', { rank: level.rank.id })}
              </span>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: level.belt.color, color: level.belt.text }}>
                {tBelts(level.belt.key)}
              </span>
              <span className="rounded-full bg-brass/15 px-2.5 py-1 text-xs font-semibold text-brass">{t('power', { n: powerScore(stats) })}</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={(level.intoLevel / level.levelSpan) * 100} fillClassName="bg-brand-gradient" />
              <p className="mt-1 font-mono text-[11px] text-ink-faint">
                {t('xpLine', { xp: level.xp.toLocaleString(), next: level.toNext })}
                {upcoming ? ` · ${t('nextRank', { rank: upcoming.id, level: upcoming.minLevel })}` : ''}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button size="sm" onClick={() => setEditing(true)}>
                <Palette size={14} /> {t('editAvatar')}
              </Button>
              <span className="self-center font-mono text-[11px] text-ink-faint">{t('partsUnlocked', { n: parts.unlocked, total: parts.total })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stats */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg tracking-wide">{t('statsTitle')}</h2>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', stats.freePoints > 0 ? 'bg-forge text-bg' : 'bg-surface-raised text-ink-muted')}>
                {t('freePoints', { n: stats.freePoints })}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-faint">{t('statsBody')}</p>
            <ul className="mt-4 space-y-3">
              {STAT_IDS.map((id) => (
                <li key={id} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm font-semibold">{t(`stats.${id}`)}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full rounded-full" style={{ width: `${(stats.total[id] / maxStat) * 100}%`, background: STAT_COLORS[id] }} />
                  </div>
                  <span className="w-9 text-end font-mono text-sm">{stats.total[id]}</span>
                  <button
                    type="button"
                    disabled={stats.freePoints === 0}
                    onClick={() => allocateStat(id)}
                    aria-label={t('addPoint', { stat: t(`stats.${id}`) })}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-raised text-ink transition-colors hover:bg-forge hover:text-bg disabled:opacity-30 disabled:hover:bg-surface-raised disabled:hover:text-ink"
                  >
                    <Plus size={14} />
                  </button>
                </li>
              ))}
            </ul>
            {stats.spentPoints > 0 ? (
              <button onClick={resetStats} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-ink">
                <RotateCcw size={12} /> {t('resetPoints')}
              </button>
            ) : null}
          </CardContent>
        </Card>

        {/* Rank ladder */}
        <Card>
          <CardContent>
            <h2 className="font-display text-lg tracking-wide">{t('ranksTitle')}</h2>
            <p className="mt-1 text-xs text-ink-faint">{t('ranksBody')}</p>
            <ol className="mt-4 grid grid-cols-4 gap-2">
              {RANKS.map((r) => {
                const reached = level.level >= r.minLevel;
                const current = level.rank.id === r.id;
                return (
                  <li
                    key={r.id}
                    className={cn(
                      'flex flex-col items-center rounded-md border p-2 text-center',
                      current ? 'border-forge bg-forge-dim/40' : 'border-line',
                      !reached && 'opacity-50'
                    )}
                  >
                    <span className="font-display text-xl" style={{ color: r.color }}>
                      {r.id}
                    </span>
                    <span className="font-mono text-[10px] text-ink-faint">{t('levelShort', { n: r.minLevel })}</span>
                    {reached ? <Check size={12} className="mt-0.5 text-ok" /> : <Lock size={11} className="mt-0.5 text-ink-faint" />}
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-ink-faint">{t('questStreak', { n: questStreak })}</p>
          </CardContent>
        </Card>
      </div>

      <DailyQuests />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Plan */}
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 font-display text-lg tracking-wide">
              <ClipboardList size={18} className="text-forge" /> {t('planTitle')}
            </h2>
            {plan ? (
              <>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {[
                    [tPlan('summaryGoal'), tPlan(`goals.${plan.goal}`)],
                    [tPlan('summaryLevel'), tPlan(`levels.${plan.experience}`)],
                    [tPlan('summaryGear'), tSettings(`modes.${settings.trainingMode}`)],
                    [tPlan('summaryTime'), tPlan('minutesValue', { n: plan.minutes })],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border border-line bg-surface px-3 py-2">
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
                {plan.limitations.length > 0 ? (
                  <p className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-aqua" />
                    {t('planSafe', { list: plan.limitations.map((l) => tPlan(`limitations.${l}`)).join(', ') })}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">{t('noPlan')}</p>
            )}
            <Button size="sm" variant={plan ? 'secondary' : 'primary'} className="mt-4" onClick={() => setPlanOpen(true)}>
              {plan ? t('rebuildPlan') : t('buildPlan')}
            </Button>
          </CardContent>
        </Card>

        {/* Bosses */}
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 font-display text-lg tracking-wide">
              <Skull size={18} className="text-danger" /> {t('bossesTitle')}
            </h2>
            <p className="mt-1 text-xs text-ink-faint">{t('bossesBody')}</p>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {ARC_BOSSES.map((b) => {
                const rec = progress.bosses[b.arcId];
                const beaten = !!rec?.defeatedOn;
                return (
                  <li key={b.arcId} className="flex flex-col items-center gap-1 rounded-md border border-line p-2 text-center">
                    <BossEmblem boss={b} size={44} defeated={beaten} muted={!beaten} />
                    <span className="text-[11px] font-semibold leading-tight">{tBoss(`${b.key}.name`)}</span>
                    <span className={cn('font-mono text-[10px]', beaten ? 'text-ok' : 'text-ink-faint')}>
                      {beaten ? t('defeated') : rec?.best ? t('bestHit', { n: rec.best }) : t('notFought')}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link href="/train?tab=arcs" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forge hover:text-forge-hover">
              <Swords size={14} /> {t('toArcs')}
            </Link>
          </CardContent>
        </Card>
      </div>

      {editing ? <AvatarEditor open onClose={() => setEditing(false)} unlock={unlock} ring={level.rank.color} /> : null}
      {planOpen ? <PlanBuilderModal open onClose={() => setPlanOpen(false)} /> : null}
    </div>
  );
}
