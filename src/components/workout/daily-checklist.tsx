'use client';

import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import { useProgress } from '@/context/progress-context';

export function DailyChecklist({ dayNumber, items }: { dayNumber: number; items: string[] }) {
  const { progress, toggleChecklistItem } = useProgress();
  const checked = progress.checklistCompleted[String(dayNumber)] ?? [];
  const complete = checked.length === items.length && items.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day Checklist</CardTitle>
        <span className="font-mono text-xs text-ink-faint">
          {checked.length}/{items.length}
        </span>
      </CardHeader>
      <CardContent>
        <ProgressBar value={(checked.length / items.length) * 100} className="mb-4" />
        <div className="space-y-1">
          {items.map((item, index) => {
            const isChecked = checked.includes(index);
            return (
              <button
                key={index}
                onClick={() => toggleChecklistItem(dayNumber, index)}
                className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface-hover"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border transition-colors',
                    isChecked ? 'border-ok bg-ok text-bg' : 'border-line'
                  )}
                >
                  {isChecked && <Check size={13} strokeWidth={3} />}
                </span>
                <span className={cn('text-sm', isChecked ? 'text-ink-muted line-through' : 'text-ink')}>{item}</span>
              </button>
            );
          })}
        </div>
        {complete ? (
          <p className="mt-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ok">
            <Check size={13} /> Day complete
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
