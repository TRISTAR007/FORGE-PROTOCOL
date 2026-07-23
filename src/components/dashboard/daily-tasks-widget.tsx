'use client';

import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn, todayKey } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';
import { DAILY_TASKS } from '@/lib/program/tasks';

export function DailyTasksWidget() {
  const { progress, toggleDailyTask } = useProgress();
  const key = todayKey();
  const done = progress.dailyTasks[key] ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Non-Negotiables</CardTitle>
        <span className="font-mono text-xs text-ink-faint">
          {done.length}/{DAILY_TASKS.length}
        </span>
      </CardHeader>
      <CardContent>
        <ProgressBar value={(done.length / DAILY_TASKS.length) * 100} className="mb-4" />
        <div className="space-y-1">
          {DAILY_TASKS.map((task) => {
            const checked = done.includes(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleDailyTask(key, task.id)}
                className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface-hover"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border transition-colors',
                    checked ? 'border-forge bg-forge text-bg' : 'border-line'
                  )}
                >
                  {checked && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className={cn('block text-sm font-medium', checked ? 'text-ink-muted line-through' : 'text-ink')}>
                    {task.label}
                  </span>
                  <span className="block text-xs text-ink-faint">{task.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
