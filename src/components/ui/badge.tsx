import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'forge' | 'brass' | 'ok' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  forge: 'bg-forge-dim text-forge border-forge/30',
  brass: 'bg-brass-dim text-brass border-brass/30',
  ok: 'bg-ok-dim text-ok border-ok/30',
  danger: 'bg-danger-dim text-danger border-danger/30',
  neutral: 'bg-surface-raised text-ink-muted border-line',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
