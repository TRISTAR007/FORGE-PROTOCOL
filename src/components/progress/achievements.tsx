'use client';

import { useMemo, useState } from 'react';
import { Calendar, Camera, Crown, Droplet, Dumbbell, Flame, Lock, Ruler, Trophy, Zap, type LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { computeAchievements, type Achievement } from '@/lib/program/achievements';
import { cn } from '@/lib/utils';

const ICONS: Record<Achievement['icon'], LucideIcon> = {
  flame: Flame,
  dumbbell: Dumbbell,
  trophy: Trophy,
  droplet: Droplet,
  camera: Camera,
  ruler: Ruler,
  zap: Zap,
  calendar: Calendar,
  crown: Crown,
};

export function Achievements() {
  const { progress } = useProgress();
  const { today } = useProgram();
  const { trainedDays, longestStreak } = useTrainingStats();
  const [showAll, setShowAll] = useState(false);

  const achievements = useMemo(
    () => computeAchievements({ progress, trainedDays, longestStreak, currentPhase: today.phase }),
    [progress, trainedDays, longestStreak, today.phase]
  );
  const unlocked = achievements.filter((a) => a.unlocked);
  // Locked badges closest to unlocking first, so "what's next" is obvious.
  const locked = achievements.filter((a) => !a.unlocked).sort((a, b) => b.progress - a.progress);
  const visible = showAll ? [...unlocked, ...locked] : [...unlocked, ...locked].slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <span className="font-mono text-xs text-ink-faint">
          {unlocked.length}/{achievements.length} unlocked
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {visible.map((a) => {
            const Icon = a.unlocked ? ICONS[a.icon] : Lock;
            return (
              <div
                key={a.id}
                title={a.description}
                className={cn(
                  'flex flex-col items-center rounded-sm border p-3 text-center',
                  a.unlocked ? 'border-brass/30 bg-brass-dim/40' : 'border-line bg-bg'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    a.unlocked ? 'bg-forge-dim text-forge' : 'bg-surface-raised text-ink-faint'
                  )}
                >
                  <Icon size={18} />
                </span>
                <p className={cn('mt-2 text-xs font-semibold', a.unlocked ? 'text-ink' : 'text-ink-muted')}>{a.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{a.description}</p>
                {!a.unlocked && a.progress > 0 ? (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full rounded-full bg-forge/70" style={{ width: `${Math.round(a.progress * 100)}%` }} />
                  </div>
                ) : null}
                {a.hint ? <p className="mt-1 font-mono text-[10px] text-ink-faint">{a.hint}</p> : null}
              </div>
            );
          })}
        </div>
        {achievements.length > 8 ? (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="mt-3 w-full rounded-sm py-2 text-sm font-semibold text-forge hover:bg-surface-hover"
          >
            {showAll ? 'Show fewer' : `Show all ${achievements.length} badges`}
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}
