'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProgram } from '@/hooks/use-program';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { PHASES, splitLabel } from '@/lib/program/program';
import { cn } from '@/lib/utils';

const WEEKS = 53; // 365 days = 52 full weeks + day 365
const ROWS = ['Push', 'Pull', 'Legs', 'Core', 'HIIT', 'Recov', 'Rest'];
const PHASE_WEEKS = [8, 8, 8, 8, 8, 13];
const PHASE_TONES = ['bg-forge/70', 'bg-brass/70', 'bg-ok/60', 'bg-forge/40', 'bg-brass/40', 'bg-ok/35'];

/** The whole 365-day program at a glance — one column per week, one row per split day. */
export function YearHeatmap() {
  const { todayDayNumber, totalDays, getWorkout } = useProgram();
  const { trainedDays } = useTrainingStats();

  let pastTrainingDays = 0;
  let pastTrainingDaysDone = 0;
  for (let day = 1; day < todayDayNumber; day++) {
    if (getWorkout(day).isRestDay) continue;
    pastTrainingDays++;
    if (trainedDays.has(day)) pastTrainingDaysDone++;
  }
  const consistency = pastTrainingDays > 0 ? Math.round((pastTrainingDaysDone / pastTrainingDays) * 100) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Year</CardTitle>
        <span className="font-mono text-xs text-ink-faint">
          {trainedDays.size}/{totalDays} days{consistency !== null ? ` · ${consistency}% consistency` : ''}
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto no-scrollbar">
          <div className="inline-flex min-w-full flex-col gap-1.5">
            {/* Phase bands */}
            <div className="ml-11 flex gap-[3px]">
              {PHASES.map((phase, i) => (
                <div
                  key={phase.id}
                  title={`Phase ${phase.id}: ${phase.name} (weeks ${phase.weeks})`}
                  className="flex flex-col gap-1"
                  style={{ width: PHASE_WEEKS[i] * 14 - 3 }}
                >
                  <span className="truncate font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                    P{phase.id} · {phase.name}
                  </span>
                  <span className={cn('h-1 rounded-full', PHASE_TONES[i])} />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex w-9 shrink-0 flex-col gap-[3px]">
                {ROWS.map((r) => (
                  <span key={r} className="flex h-[11px] items-center font-mono text-[9px] uppercase text-ink-faint">
                    {r}
                  </span>
                ))}
              </div>
              <div className="flex gap-[3px]">
                {Array.from({ length: WEEKS }, (_, week) => (
                  <div key={week} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }, (_, slot) => {
                      const day = week * 7 + slot + 1;
                      if (day > totalDays) return <span key={slot} className="h-[11px] w-[11px]" />;
                      const workout = getWorkout(day);
                      const trained = trainedDays.has(day);
                      const isToday = day === todayDayNumber;
                      const isPast = day < todayDayNumber;
                      const status = trained
                        ? 'Completed'
                        : isToday
                          ? 'Today'
                          : isPast
                            ? workout.isRestDay
                              ? 'Rest day'
                              : 'Missed'
                            : 'Upcoming';
                      return (
                        <Link
                          key={slot}
                          href={`/workout?day=${day}`}
                          prefetch={false}
                          title={`Day ${day} · ${splitLabel(workout.split)} · ${workout.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${status}`}
                          aria-label={`Day ${day}, ${status}`}
                          className={cn(
                            'h-[11px] w-[11px] rounded-[3px] transition-transform hover:scale-125',
                            trained
                              ? 'bg-ok'
                              : isToday
                                ? 'bg-forge ring-2 ring-forge/40'
                                : isPast
                                  ? workout.isRestDay
                                    ? 'bg-surface-raised'
                                    : 'bg-danger/35'
                                  : 'bg-surface-raised/50'
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-faint">
          {[
            { cls: 'bg-ok', label: 'Completed' },
            { cls: 'bg-forge', label: 'Today' },
            { cls: 'bg-danger/35', label: 'Missed' },
            { cls: 'bg-surface-raised', label: 'Rest / upcoming' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-[3px]', item.cls)} />
              {item.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
