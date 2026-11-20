'use client';

import { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { useLocalStorageValue } from '@/hooks/use-local-storage';
import { addDays, toDateKey } from '@/lib/utils';

const MIN_MISSED = 2;

/**
 * After a gap of missed training days, offers to slide the schedule so
 * today becomes the first day that was missed. Logged history is keyed by
 * day number, so nothing already done is lost or re-dated.
 */
export function MissedDaysBanner() {
  const { missed } = useTrainingStats();
  const { setProgramStartDate } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useLocalStorageValue(`forge:missed-dismissed:${missed.firstMissedDay ?? 0}`);

  if (missed.count < MIN_MISSED || missed.firstMissedDay === null || dismissed) return null;
  const resumeDay = missed.firstMissedDay;

  const resume = async () => {
    setSaving(true);
    // Start date such that today = resumeDay.
    const ok = await setProgramStartDate(toDateKey(addDays(new Date(), -(resumeDay - 1))));
    setSaving(false);
    if (ok) toast(`Schedule moved — today is Day ${resumeDay}.`);
    else toast('Could not update your schedule.', 'error');
  };

  return (
    <div className="relative flex flex-col gap-3 rounded-md border border-brass/30 bg-brass-dim/50 p-4 pr-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <CalendarClock size={20} className="mt-0.5 shrink-0 text-brass" />
        <div>
          <p className="text-sm font-semibold text-ink">
            You&apos;ve missed {missed.count} workouts since Day {resumeDay}.
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Pick up where you left off — your schedule shifts so today becomes Day {resumeDay}. Nothing you&apos;ve logged is
            lost.
          </p>
        </div>
      </div>
      <Button size="sm" onClick={() => void resume()} loading={saving} className="shrink-0 self-start sm:self-center">
        Resume from Day {resumeDay}
      </Button>
      <button
        onClick={() => setDismissed('1')}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-xs p-1.5 text-ink-faint hover:bg-surface-hover hover:text-ink"
      >
        <X size={14} />
      </button>
    </div>
  );
}
