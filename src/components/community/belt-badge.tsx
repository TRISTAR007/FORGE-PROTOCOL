'use client';

import { useTranslations } from 'next-intl';
import { beltForLevel, rankForLevel } from '@/lib/program/levels';
import { cn } from '@/lib/utils';

/** "[B] Lv 12 · Green Belt" pill in the belt's own color, with the hunter rank letter. */
export function BeltBadge({ level, compact, className }: { level: number; compact?: boolean; className?: string }) {
  const t = useTranslations('belts');
  const belt = beltForLevel(level);
  const rank = rankForLevel(level);
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full py-0.5 pe-2 ps-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', className)}
      style={{ backgroundColor: belt.color, color: belt.text }}
      title={`${rank.id} · ${t(belt.key)}`}
    >
      <span className="rounded-full bg-bg px-1.5 leading-4" style={{ color: rank.color }}>
        {rank.id}
      </span>
      Lv {level}
      {compact ? null : <span className="font-semibold normal-case tracking-normal">· {t(belt.key)}</span>}
    </span>
  );
}
