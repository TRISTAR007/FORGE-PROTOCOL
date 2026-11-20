'use client';

import { MeasurementsCard } from '@/components/progress/measurements-card';
import { StrengthTestCard } from '@/components/progress/strength-test-card';
import { HabitCalendar } from '@/components/progress/habit-calendar';
import { YearHeatmap } from '@/components/progress/year-heatmap';
import { Achievements } from '@/components/progress/achievements';
import { PersonalBests } from '@/components/progress/personal-bests';
import { ProgressPhotos } from '@/components/progress/progress-photos';
import { ShareProgressButton } from '@/components/progress/share-progress';
import { StatCard } from '@/components/dashboard/stat-card';
import { Flame, ListChecks, Zap } from 'lucide-react';
import { useTrainingStats } from '@/hooks/use-training-stats';

export default function ProgressPage() {
  const { streak, longestStreak, workoutsCompleted } = useTrainingStats();

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Progress</h1>
          <p className="mt-1 text-ink-muted">Track the numbers that prove the work is working.</p>
        </div>
        <ShareProgressButton />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={ListChecks} label="Workouts" value={String(workoutsCompleted)} sub="logged" />
        <StatCard icon={Flame} label="Streak" value={String(streak)} sub="days" />
        <StatCard icon={Zap} label="Longest" value={String(longestStreak)} sub="day streak" />
      </div>

      <YearHeatmap />
      <Achievements />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HabitCalendar />
        <PersonalBests />
      </div>

      <MeasurementsCard />
      <StrengthTestCard />
      <ProgressPhotos />
    </div>
  );
}
