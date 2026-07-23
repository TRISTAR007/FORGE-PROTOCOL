'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WarmupCooldownItem } from '@/lib/types';

export function WarmupCooldownBlock({ title, items }: { title: string; items: WarmupCooldownItem[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="rounded-md border border-line bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-display text-sm uppercase tracking-wide text-ink-muted">
          {title} <span className="font-mono text-ink-faint">({items.length})</span>
        </span>
        <ChevronDown size={16} className={cn('text-ink-faint transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <ul className="space-y-1.5 px-4 pb-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm text-ink-muted">
              <span>{item.exercise}</span>
              <span className="font-mono text-xs text-ink-faint">{item.reps ?? item.duration}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
