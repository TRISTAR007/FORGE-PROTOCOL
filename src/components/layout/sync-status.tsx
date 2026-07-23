'use client';

import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useProgress } from '@/context/progress-context';
import { cn } from '@/lib/utils';

export function SyncStatus({ className }: { className?: string }) {
  const { saveStatus } = useProgress();

  if (saveStatus === 'idle') return null;

  const config = {
    saving: { icon: Loader2, label: 'Saving…', tone: 'text-ink-faint', spin: true },
    saved: { icon: Cloud, label: 'Synced', tone: 'text-ink-faint', spin: false },
    error: { icon: CloudOff, label: 'Sync failed — retrying', tone: 'text-danger', spin: false },
  }[saveStatus];

  const Icon = config.icon;

  return (
    <span className={cn('flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider', config.tone, className)}>
      <Icon size={11} className={config.spin ? 'animate-spin' : ''} />
      {config.label}
    </span>
  );
}
