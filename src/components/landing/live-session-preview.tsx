'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { RingProgress } from '@/components/ui/ring-progress';
import { cn } from '@/lib/utils';

const DEMO = [
  { type: 'work', name: 'Diamond Push-up', cue: 'Elbows tucked, hands under chest — control the descent.', seconds: 12, set: 'Set 2 of 4' },
  { type: 'rest', name: 'Pike Push-up', cue: 'Up next', seconds: 8, set: 'Set 2 of 4' },
  { type: 'work', name: 'Pike Push-up', cue: 'Hips high, lower the crown of your head toward the floor.', seconds: 12, set: 'Set 1 of 4' },
  { type: 'rest', name: 'Plank', cue: 'Up next', seconds: 8, set: 'Set 1 of 4' },
  { type: 'work', name: 'Plank', cue: 'Squeeze glutes, brace like someone is about to poke your stomach.', seconds: 12, set: 'Set 1 of 3' },
] as const;

/** A looping, self-running demo of the guided session player for the landing page. */
export function LiveSessionPreview() {
  const [{ index, left }, setTimer] = useState<{ index: number; left: number }>({ index: 0, left: DEMO[0].seconds });
  const step = DEMO[index];

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((t) => {
        if (t.left > 1) return { ...t, left: t.left - 1 };
        const next = (t.index + 1) % DEMO.length;
        return { index: next, left: DEMO[next].seconds };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isRest = step.type === 'rest';
  const pct = ((step.seconds - left) / step.seconds) * 100;

  return (
    <div
      className="mx-auto mt-14 max-w-sm overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-raised"
      aria-label="Preview of the guided workout player"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">Push Day · Phase 3</p>
          <p className="text-xs font-semibold text-ink">{step.set}</p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-forge text-bg">
          <Flame size={13} strokeWidth={2.5} />
        </span>
      </div>

      <div className="flex flex-col items-center px-6 py-8">
        <span className={cn('mb-3 font-mono text-[10px] uppercase tracking-[0.2em]', isRest ? 'text-brass' : 'text-forge')}>
          {isRest ? 'Rest' : 'Work'}
        </span>
        <RingProgress value={pct} size={160} stroke={9} colorClassName={isRest ? 'text-brass' : 'text-forge'}>
          <div className="text-center">
            <div className="font-display text-4xl tracking-wide text-ink" aria-hidden>
              {left}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">seconds</div>
          </div>
        </RingProgress>
        {isRest ? <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Up next</p> : null}
        <h3 className={cn('font-display text-2xl tracking-wide text-ink', isRest ? 'mt-1' : 'mt-6')}>{step.name}</h3>
        {!isRest ? <p className="mt-1 max-w-[260px] text-center text-xs text-ink-muted">{step.cue}</p> : null}
      </div>

      <div className="flex gap-1 px-6 pb-6">
        {DEMO.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < index ? 'bg-forge' : i === index ? 'bg-forge/60' : 'bg-surface-raised'
            )}
          />
        ))}
      </div>
    </div>
  );
}
