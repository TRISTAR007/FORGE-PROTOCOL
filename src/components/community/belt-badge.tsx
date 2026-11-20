'use client';

import { useTranslations } from 'next-intl';
import { beltForLevel } from '@/lib/program/levels';
import { cn } from '@/lib/utils';

/** "Lv 12 · Green Belt" pill in the belt's own color. */
export function BeltBadge({ level, compact, className }: { level: number; compact?: boolean; className?: string }) {
  const t = useTranslations('belts');
  const belt = beltForLevel(level);
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', className)}
      style={{ backgroundColor: belt.color, color: belt.text }}
      title={t(belt.key)}
    >
      Lv {level}
      {compact ? null : <span className="font-semibold normal-case tracking-normal">· {t(belt.key)}</span>}
    </span>
  );
}
