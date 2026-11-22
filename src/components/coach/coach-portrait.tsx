import Image from 'next/image';
import type { Coach } from '@/lib/coaches';
import { cn } from '@/lib/utils';

export type CoachMood = 'idle' | 'hype' | 'strain' | 'rest' | 'still';

const MOOD_CLASS: Record<CoachMood, string> = {
  idle: 'animate-float',
  hype: 'animate-hype',
  strain: 'animate-shake',
  rest: 'animate-breathe',
  still: '',
};

/**
 * A coach's portrait in a gradient frame with an energy aura behind it.
 * The mood drives the animation: floating while idle, bouncing with hype
 * during work, shaking under strain in the final seconds, breathing on rest.
 */
export function CoachPortrait({
  coach,
  size = 160,
  mood = 'idle',
  aura = true,
  rounded = 'xl',
  priority,
  className,
}: {
  coach: Coach;
  size?: number;
  mood?: CoachMood;
  aura?: boolean;
  rounded?: 'full' | 'xl';
  priority?: boolean;
  className?: string;
}) {
  const radius = rounded === 'full' ? '9999px' : `${Math.round(size * 0.18)}px`;
  const src = size <= 96 ? coach.thumb : coach.image;

  return (
    <div
      className={cn('relative inline-block shrink-0', rounded === 'full' && 'rounded-full', className)}
      style={{ width: size, height: size }}
    >
      {aura ? (
        <div
          aria-hidden
          // No CSS blur filter here: blurring an element that animates forces a costly
          // re-rasterize every frame. The soft radial gradient gives the same glow and
          // the animation only touches opacity/transform, which stay on the GPU.
          className={cn('absolute -inset-[22%] rounded-full', mood === 'still' ? 'opacity-60' : 'animate-auraPulse')}
          style={{
            background: `radial-gradient(circle, ${coach.colors[0]}77 0%, ${coach.colors[1]}2e 38%, transparent 68%)`,
          }}
        />
      ) : null}
      <div className={cn('relative h-full w-full', MOOD_CLASS[mood])}>
        <div
          className="h-full w-full p-[3px] shadow-raised"
          style={{ borderRadius: radius, backgroundImage: `linear-gradient(135deg, ${coach.colors[0]}, ${coach.colors[1]})` }}
        >
          <div className="relative h-full w-full overflow-hidden bg-surface" style={{ borderRadius: `calc(${radius} - 3px)` }}>
            <Image
              src={src}
              alt={coach.name}
              fill
              sizes={`${size}px`}
              className="coach-art"
              priority={priority}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small round avatar (chat, leaderboard, lists). */
export function CoachAvatar({ coach, size = 36, className }: { coach: Coach; size?: number; className?: string }) {
  return <CoachPortrait coach={coach} size={size} mood="still" aura={false} rounded="full" className={className} />;
}

/** A speech bubble pointing at the coach. */
export function SpeechBubble({
  children,
  color,
  side = 'left',
  className,
}: {
  children: React.ReactNode;
  color?: string;
  side?: 'left' | 'top';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative rounded-lg border bg-surface-raised px-4 py-3 text-sm leading-relaxed text-ink shadow-card animate-pop',
        className
      )}
      style={{ borderColor: color ? `${color}66` : undefined }}
    >
      <span
        aria-hidden
        className={cn(
          'absolute h-3 w-3 rotate-45 border bg-surface-raised',
          side === 'left' ? '-start-1.5 top-5 border-e-0 border-t-0' : '-top-1.5 start-8 border-b-0 border-e-0'
        )}
        style={{ borderColor: color ? `${color}66` : undefined }}
      />
      {children}
    </div>
  );
}
