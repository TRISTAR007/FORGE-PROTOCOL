import { memo } from 'react';
import { Anchor, Check, Flame, Flower2, Moon, Mountain, Shield, Skull, Snowflake, Swords, Zap, type LucideIcon } from 'lucide-react';
import type { BossIcon } from '@/lib/program/bosses';
import { cn } from '@/lib/utils';

const ICONS: Record<BossIcon, LucideIcon> = {
  shield: Shield,
  mountain: Mountain,
  snowflake: Snowflake,
  zap: Zap,
  anchor: Anchor,
  flower: Flower2,
  flame: Flame,
  skull: Skull,
  moon: Moon,
  swords: Swords,
};

/** A boss crest: original emblem in the boss's colors (no character art needed). */
export const BossEmblem = memo(function BossEmblem({
  boss,
  size = 64,
  defeated,
  muted,
  className,
}: {
  boss: { icon: BossIcon; colors: [string, string] };
  size?: number;
  defeated?: boolean;
  muted?: boolean;
  className?: string;
}) {
  const Icon = ICONS[boss.icon];
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full', muted && 'grayscale', className)}
      style={{
        width: size,
        height: size,
        backgroundImage: `radial-gradient(circle at 35% 30%, ${boss.colors[0]}, ${boss.colors[1]} 75%)`,
        boxShadow: `0 0 0 3px #0C0A1D, 0 0 0 5px ${boss.colors[0]}66`,
      }}
    >
      <Icon size={Math.round(size * 0.48)} className="text-white drop-shadow" strokeWidth={2.2} />
      {defeated ? (
        <span className="absolute -bottom-0.5 -end-0.5 flex h-[38%] w-[38%] items-center justify-center rounded-full border-2 border-bg bg-ok text-bg">
          <Check size={Math.round(size * 0.22)} strokeWidth={3.5} />
        </span>
      ) : null}
    </span>
  );
});
