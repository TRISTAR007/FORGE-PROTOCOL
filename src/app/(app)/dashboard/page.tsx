'use client';

import { Dumbbell, Flame, Trophy, Scale } from 'lucide-react';
import { PhaseHero } from '@/components/dashboard/phase-hero';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeekStrip } from '@/components/dashboard/week-strip';
import { WaterTracker } from '@/components/dashboard/water-tracker';
import { DailyTasksWidget } from '@/components/dashboard/daily-tasks-widget';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { calculateStreak } from '@/lib/utils';

export default function DashboardPage() {
  const { progress } = useProgress();
  const { today, todayDayNumber, totalDays } = useProgram();

  const streak = calculateStreak(progress.completedDays, todayDayNumber);
  const workoutsCompleted = progress.completedDays.length;
  const pushups = progress.strengthTests.pushups;
  const weight = progress.measurements.weight;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PhaseHero workout={today} totalDays={totalDays} streak={streak} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Dumbbell} label="Workouts" value={String(workoutsCompleted)} sub="completed" />
        <StatCard icon={Flame} label="Streak" value={String(streak)} sub="days" />
        <StatCard icon={Trophy} label="Push-ups" value={pushups ? String(pushups) : '—'} sub="best set" />
        <StatCard icon={Scale} label="Weight" value={weight ? `${weight}` : '—'} sub="kg" />
      </div>

      <WeekStrip />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyTasksWidget />
        <WaterTracker />
      </div>

      <blockquote className="rounded-md border border-line bg-surface px-6 py-5 text-sm italic text-ink-muted">
        &ldquo;{today.motivation}&rdquo;
      </blockquote>
    </div>
  );
}
