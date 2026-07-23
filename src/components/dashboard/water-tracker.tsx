'use client';

import { Droplet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, todayKey } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';

const GOAL = 8;

export function WaterTracker() {
  const { progress, setWater } = useProgress();
  const key = todayKey();
  const current = progress.waterIntake[key] ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hydration</CardTitle>
        <span className="font-mono text-xs text-ink-faint">
          {current}/{GOAL} glasses
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: GOAL }, (_, i) => i + 1).map((glassNumber) => {
            const filled = glassNumber <= current;
            return (
              <button
                key={glassNumber}
                aria-label={`${filled ? 'Unmark' : 'Mark'} glass ${glassNumber}`}
                onClick={() => setWater(key, glassNumber === current ? glassNumber - 1 : glassNumber)}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm border transition-colors',
                  filled ? 'border-forge/40 bg-forge-dim text-forge' : 'border-line bg-bg text-ink-faint hover:border-line'
                )}
              >
                <Droplet size={16} fill={filled ? 'currentColor' : 'none'} />
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">Tap a glass to log it. 2L+ a day supports recovery and skin.</p>
      </CardContent>
    </Card>
  );
}
