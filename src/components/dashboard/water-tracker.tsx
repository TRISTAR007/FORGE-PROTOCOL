'use client';

import { Droplet, Minus, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, todayKey } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';

const MIN_GOAL = 4;
const MAX_GOAL = 16;

export function WaterTracker() {
  const { progress, settings, setWater, updateSettings } = useProgress();
  const key = todayKey();
  const goal = settings.waterGoal;
  const current = progress.waterIntake[key] ?? 0;
  const glasses = Math.max(goal, current);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hydration</CardTitle>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateSettings({ waterGoal: Math.max(MIN_GOAL, goal - 1) })}
            disabled={goal <= MIN_GOAL}
            aria-label="Lower daily water goal"
            className="rounded-xs p-1 text-ink-faint hover:bg-surface-hover hover:text-ink disabled:opacity-30"
          >
            <Minus size={12} />
          </button>
          <span className={cn('font-mono text-xs', current >= goal ? 'text-ok' : 'text-ink-faint')}>
            {current}/{goal} glasses
          </span>
          <button
            onClick={() => updateSettings({ waterGoal: Math.min(MAX_GOAL, goal + 1) })}
            disabled={goal >= MAX_GOAL}
            aria-label="Raise daily water goal"
            className="rounded-xs p-1 text-ink-faint hover:bg-surface-hover hover:text-ink disabled:opacity-30"
          >
            <Plus size={12} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: glasses }, (_, i) => i + 1).map((glassNumber) => {
            const filled = glassNumber <= current;
            return (
              <button
                key={glassNumber}
                aria-label={`${filled ? 'Unmark' : 'Mark'} glass ${glassNumber}`}
                onClick={() => setWater(key, glassNumber === current ? glassNumber - 1 : glassNumber)}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm border transition-colors',
                  filled ? 'border-forge/40 bg-forge-dim text-forge' : 'border-line bg-bg text-ink-faint hover:border-forge/30'
                )}
              >
                <Droplet size={16} fill={filled ? 'currentColor' : 'none'} />
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          {current >= goal
            ? 'Goal hit for today — nice.'
            : 'Tap a glass to log it. 2L+ a day supports recovery and skin. Use − / + to change your goal.'}
        </p>
      </CardContent>
    </Card>
  );
}
