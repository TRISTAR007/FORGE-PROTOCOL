'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ClipboardList, Dumbbell, Flame, Trophy, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyQuests } from '@/components/quests/daily-quests';
import { PlanBuilderModal } from '@/components/plan/plan-builder-modal';
import { PhaseHero } from '@/components/dashboard/phase-hero';
import { PhaseTimeline } from '@/components/dashboard/phase-timeline';
import { MissedDaysBanner } from '@/components/dashboard/missed-days-banner';
import { QuickPicks } from '@/components/dashboard/quick-picks';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeekStrip } from '@/components/dashboard/week-strip';
import { WaterTracker } from '@/components/dashboard/water-tracker';
import { DailyTasksWidget } from '@/components/dashboard/daily-tasks-widget';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { toDisplayWeight, weightUnit } from '@/lib/units';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { progress, settings } = useProgress();
  const { today, totalDays } = useProgram();
  const { streak, workoutsCompleted } = useTrainingStats();
  const pushups = progress.strengthTests.pushups;
  const weight = progress.measurements.weight;
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      <MissedDaysBanner />
      <PhaseHero workout={today} totalDays={totalDays} streak={streak} />

      {!progress.plan && progress.onboardingCompleted ? (
        <Card className="border-forge/40">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-white shadow-glow">
              <ClipboardList size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg tracking-wide">{t('planPromptTitle')}</h2>
              <p className="text-sm text-ink-muted">{t('planPromptBody')}</p>
            </div>
            <Button onClick={() => setPlanOpen(true)}>{t('planPromptCta')}</Button>
          </CardContent>
        </Card>
      ) : null}

      <DailyQuests />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Dumbbell} label={t('statWorkouts')} value={String(workoutsCompleted)} sub={t('statCompleted')} />
        <StatCard icon={Flame} label={t('statStreak')} value={String(streak)} sub={t('statDays')} />
        <StatCard icon={Trophy} label={t('statPushups')} value={pushups ? String(pushups) : '—'} sub={t('statBestSet')} />
        <StatCard
          icon={Scale}
          label={t('statWeight')}
          value={weight ? String(toDisplayWeight(weight, settings.units)) : '—'}
          sub={weightUnit(settings.units)}
        />
      </div>

      <WeekStrip />
      <QuickPicks seed={today.dayNumber} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyTasksWidget />
        <WaterTracker />
      </div>

      <PhaseTimeline />
      <InstallPrompt />
      {planOpen ? <PlanBuilderModal open onClose={() => setPlanOpen(false)} /> : null}

      <blockquote className="rounded-md border border-line bg-surface px-6 py-5 text-sm italic text-ink-muted">
        &ldquo;{today.motivation}&rdquo;
      </blockquote>
    </div>
  );
}
