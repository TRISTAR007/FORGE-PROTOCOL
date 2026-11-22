'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RingProgress } from '@/components/ui/ring-progress';
import { CoachPortrait, SpeechBubble } from '@/components/coach/coach-portrait';
import { BrandIcon } from '@/components/brand/brand-mark';
import { getCoach } from '@/lib/coaches';
import { cn } from '@/lib/utils';

const DEMO = [
  { type: 'work', coach: 'kaito', name: 'Diamond Push-up', line: "Diamond push-ups! Every single one counts — go!", seconds: 12, set: 'Set 2 of 4' },
  { type: 'rest', coach: 'kaito', name: 'Plank', line: 'Great set! Rest up. Plank is waiting for you!', seconds: 8, set: 'Set 2 of 4' },
  { type: 'work', coach: 'aiko', name: 'Plank', line: "Hold. Don't let the cold reach your core.", seconds: 12, set: 'Set 1 of 3' },
  { type: 'rest', coach: 'mika', name: 'Jumping Jack', line: "Water break! Then jumping jacks — you've got this!", seconds: 8, set: 'Set 1 of 3' },
  { type: 'work', coach: 'mika', name: 'Jumping Jack', line: 'Keep the rhythm, superstar!', seconds: 12, set: 'Set 1 of 3' },
] as const;

/** A looping, self-running demo of the guided session player for the landing page. */
export function LiveSessionPreview() {
  const t = useTranslations('player');
  const [{ index, left }, setTimer] = useState<{ index: number; left: number }>({ index: 0, left: DEMO[0].seconds });
  const step = DEMO[index];
  const coach = getCoach(step.coach);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((s) => {
        if (s.left > 1) return { ...s, left: s.left - 1 };
        const next = (s.index + 1) % DEMO.length;
        return { index: next, left: DEMO[next].seconds };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isRest = step.type === 'rest';
  const pct = ((step.seconds - left) / step.seconds) * 100;

  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface text-start shadow-raised"
      aria-label="Preview of the guided workout player"
    >
      <div aria-hidden className={cn('speed-lines pointer-events-none absolute inset-0 transition-opacity', isRest ? 'opacity-0' : 'opacity-60')} />
      <div className="relative flex items-center justify-between border-b border-line px-5 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">Push Day · Phase 3</p>
          <p className="text-xs font-semibold text-ink">{step.set}</p>
        </div>
        <BrandIcon size={26} />
      </div>

      <div className="relative flex items-start gap-3 px-5 pt-5">
        <CoachPortrait key={coach.id} coach={coach} size={68} mood={isRest ? 'rest' : left <= 3 ? 'strain' : 'hype'} />
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: coach.colors[0] }}>
            {coach.name}
          </p>
          <SpeechBubble key={index} color={coach.colors[0]}>
            {step.line}
          </SpeechBubble>
        </div>
      </div>

      <div className="relative flex flex-col items-center px-6 pb-6 pt-5">
        <span className={cn('mb-3 font-mono text-[10px] uppercase tracking-[0.2em]', isRest ? 'text-brass' : 'text-forge')}>
          {isRest ? t('rest') : t('work')}
        </span>
        <RingProgress value={pct} size={150} stroke={9} colorClassName={isRest ? 'text-brass' : 'text-forge'}>
          <div className="text-center">
            <div className="font-display text-4xl tracking-wide text-ink" aria-hidden>
              {left}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">{t('seconds')}</div>
          </div>
        </RingProgress>
        {isRest ? <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('upNext')}</p> : null}
        <h3 className={cn('font-display text-2xl tracking-wide text-ink', isRest ? 'mt-1' : 'mt-4')}>{step.name}</h3>
      </div>

      <div className="relative flex gap-1 px-6 pb-6">
        {DEMO.map((_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i < index ? 'bg-forge' : i === index ? 'bg-forge/60' : 'bg-surface-raised')}
          />
        ))}
      </div>
    </div>
  );
}
