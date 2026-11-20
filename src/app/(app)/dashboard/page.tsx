'use client';

import { useTranslations } from 'next-intl';
import { Dumbbell, Flame, Trophy, Scale } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <MissedDaysBanner />
      <PhaseHero workout={today} totalDays={totalDays} streak={streak} />

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

      <blockquote className="rounded-md border border-line bg-surface px-6 py-5 text-sm italic text-ink-muted">
        &ldquo;{today.motivation}&rdquo;
      </blockquote>
    </div>
  );
}
