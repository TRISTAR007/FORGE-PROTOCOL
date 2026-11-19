'use client';

import { MeasurementsCard } from '@/components/progress/measurements-card';
import { StrengthTestCard } from '@/components/progress/strength-test-card';
import { HabitCalendar } from '@/components/progress/habit-calendar';
import { StatCard } from '@/components/dashboard/stat-card';
import { Dumbbell, Flame, ListChecks } from 'lucide-react';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';

export default function ProgressPage() {
  const { progress } = useProgress();
  const { streak, workoutsCompleted } = useTrainingStats();

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Progress</h1>
        <p className="mt-1 text-ink-muted">Track the numbers that prove the work is working.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={ListChecks} label="Workouts" value={String(workoutsCompleted)} sub="logged" />
        <StatCard icon={Flame} label="Streak" value={String(streak)} sub="days" />
        <StatCard
          icon={Dumbbell}
          label="Push-ups"
          value={progress.strengthTests.pushups ? String(progress.strengthTests.pushups) : '—'}
          sub="best set"
        />
      </div>

      <HabitCalendar />
      <MeasurementsCard />
      <StrengthTestCard />
    </div>
  );
}
