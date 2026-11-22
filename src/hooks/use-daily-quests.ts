'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { generateQuestDay, needsRecovery } from '@/lib/program/quests';
import { todayKey } from '@/lib/utils';

/**
 * Today's quests. Generates them on first view (then they're stored, so
 * targets never shift mid-day), auto-completes the "finish a workout" and
 * water quests from logged data, and rolls over at local midnight.
 */
export function useDailyQuests() {
  const { progress, settings, ensureQuestDay, addQuestProgress } = useProgress();
  const { todayDayNumber } = useProgram();
  const { level, questStreak } = useTrainingStats();
  const [dateKey, setDateKey] = useState(todayKey);
  const day = progress.quests[dateKey];

  // Roll over at midnight without needing a reload.
  useEffect(() => {
    const id = setInterval(() => {
      const now = todayKey();
      if (now !== dateKey) setDateKey(now);
    }, 60_000);
    return () => clearInterval(id);
  }, [dateKey]);

  useEffect(() => {
    if (day) return;
    ensureQuestDay(
      dateKey,
      generateQuestDay(dateKey, {
        plan: progress.plan,
        level: level.level,
        waterGoal: settings.waterGoal,
        recovery: needsRecovery(progress.quests, dateKey),
      })
    );
  }, [day, dateKey, ensureQuestDay, progress.plan, progress.quests, level.level, settings.waterGoal]);

  const workedOut =
    progress.sessionLogs.some((l) => l.date === dateKey) ||
    progress.routineLogs.some((l) => l.date === dateKey) ||
    progress.completedDays.includes(todayDayNumber);
  const water = progress.waterIntake[dateKey] ?? 0;

  useEffect(() => {
    if (!day) return;
    for (const q of day.quests) {
      if (q.done) continue;
      if (q.kind === 'workout' && workedOut) addQuestProgress(dateKey, q.id, 'complete');
      if (q.kind === 'water' && water >= q.target) addQuestProgress(dateKey, q.id, 'complete');
    }
  }, [day, dateKey, workedOut, water, addQuestProgress]);

  return { dateKey, day, questStreak, water, workedOut };
}
