'use client';

import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { calculateStreak } from '@/lib/utils';
import { PHASES } from '@/lib/program/program';

const STREAK_THRESHOLDS = [7, 30, 60, 100, 365];

interface Milestone {
  id: string;
  title: string;
  message: string;
}

export function MilestoneCelebration() {
  const { progress, markMilestoneCelebrated } = useProgress();
  const { todayDayNumber, today } = useProgram();
  const streak = calculateStreak(progress.completedDays, todayDayNumber);

  const pending = useMemo<Milestone | null>(() => {
    const candidates: Milestone[] = [];

    for (const threshold of STREAK_THRESHOLDS) {
      if (streak >= threshold) {
        candidates.push({
          id: `streak-${threshold}`,
          title: `${threshold}-Day Streak`,
          message: `${threshold} days trained in a row. That's not motivation anymore — that's a habit.`,
        });
      }
    }

    for (const phase of PHASES) {
      if (phase.id > 1 && today.phase >= phase.id) {
        candidates.push({
          id: `phase-${phase.id}`,
          title: `Phase ${phase.id}: ${phase.name}`,
          message: phase.description,
        });
      }
    }

    const uncelebrated = candidates.filter((c) => !progress.celebratedMilestones.includes(c.id));
    return uncelebrated.length > 0 ? uncelebrated[uncelebrated.length - 1] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak, today.phase, progress.celebratedMilestones]);

  if (!pending) return null;

  const dismiss = () => markMilestoneCelebrated(pending.id);

  return (
    <Modal open onClose={dismiss}>
      <div className="flex flex-col items-center px-2 py-6 text-center">
        <div className="flex h-16 w-16 animate-ember items-center justify-center rounded-full bg-forge-dim text-forge">
          <Flame size={30} />
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-brass">Milestone reached</p>
        <h2 className="mt-2 font-display text-3xl tracking-wide text-ink">{pending.title}</h2>
        <p className="mt-3 max-w-xs text-sm text-ink-muted">{pending.message}</p>
        <Button size="lg" className="mt-8 w-full" onClick={dismiss}>
          Keep Going
        </Button>
      </div>
    </Modal>
  );
}
