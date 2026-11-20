'use client';

import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProgress } from '@/context/progress-context';
import { getExercise } from '@/lib/program/exercises';
import { getPersonalBests } from '@/lib/program/training-stats';
import { parseDateKey } from '@/lib/utils';

export function PersonalBests() {
  const { progress } = useProgress();
  const bests = useMemo(
    () =>
      [...getPersonalBests(progress.sessionLogs).entries()]
        .map(([key, b]) => ({ key, name: getExercise(key)?.name ?? key, ...b }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [progress.sessionLogs]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Bests</CardTitle>
        <span className="font-mono text-xs text-ink-faint">{progress.sessionLogs.length} guided sessions</span>
      </CardHeader>
      <CardContent>
        {bests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line px-6 py-8 text-center">
            <Trophy size={22} className="text-ink-faint" />
            <p className="text-sm text-ink-muted">
              Log your reps during a guided workout and your best set for every exercise shows up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-faint">
            {bests.map((b) => (
              <div key={b.key} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium text-ink">{b.name}</span>
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-lg tracking-wide">{b.reps}</span>
                  <span className="font-mono text-[10px] uppercase text-ink-faint">
                    reps · {parseDateKey(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
