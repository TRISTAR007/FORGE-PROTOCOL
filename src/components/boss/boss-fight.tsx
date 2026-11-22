'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Hand, Pause, Play, RotateCcw, Swords, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BossEmblem } from './boss-emblem';
import { CoachPortrait, SpeechBubble } from '@/components/coach/coach-portrait';
import { useCoach } from '@/hooks/use-coach';
import { useProgress } from '@/context/progress-context';
import { useRaidHit } from '@/hooks/use-raid-hit';
import { useToast } from '@/components/ui/toast';
import { bossHp, type ArcBoss } from '@/lib/program/bosses';
import { getCoach } from '@/lib/coaches';
import { exerciseName } from '@/lib/program/exercises';
import { XP } from '@/lib/program/levels';
import type { Arc } from '@/lib/program/routines';
import { hapticImpact, hapticSuccess } from '@/lib/native';
import { beep, primeAudio } from '@/lib/session-cues';
import { cn } from '@/lib/utils';

type Phase = 'intro' | 'fight' | 'won' | 'lost';

/**
 * Arc boss fight. Reps bosses: tap once per rep (each tap = 1 damage).
 * Hold bosses: press "Hold" while you hold the position — 1 damage per second,
 * pause whenever you need. Beat the HP bar before the clock runs out.
 */
export function BossFight({ arc, boss, onClose }: { arc: Arc; boss: ArcBoss; onClose: () => void }) {
  const t = useTranslations('boss');
  const tBoss = useTranslations('bosses');
  const { progress, recordBossAttempt } = useProgress();
  const { say } = useCoach(getCoach(arc.coachId));
  const { toast } = useToast();
  const hit = useRaidHit();
  const maxHp = bossHp(boss, arc);
  const isHold = arc.unit === 'seconds';
  const wasBeaten = !!progress.bosses[arc.id]?.defeatedOn;

  const [phase, setPhase] = useState<Phase>('intro');
  const [damage, setDamage] = useState(0);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(boss.timeLimitSec);
  const [holdStart, setHoldStart] = useState<number | null>(null);
  const [bubble, setBubble] = useState(() => t('intro', { n: maxHp, unit: isHold ? t('unitSeconds') : t('unitReps') }));
  const [popKey, setPopKey] = useState(0);
  const [lastHit, setLastHit] = useState(1);
  const banked = useRef(0);
  const finished = useRef(false);

  const finish = useCallback(
    (won: boolean, score: number) => {
      if (finished.current) return;
      finished.current = true;
      setEndAt(null);
      setHoldStart(null);
      setPhase(won ? 'won' : 'lost');
      recordBossAttempt(arc.id, score, won);
      if (won) {
        void hapticSuccess();
        beep(990, 320);
        setBubble(say('pr'));
        if (!wasBeaten) {
          hit(XP.boss);
          toast(t('wonToast', { xp: XP.boss }));
        }
      } else {
        setBubble(t('lostBubble'));
      }
    },
    [arc.id, recordBossAttempt, say, hit, toast, t, wasBeaten]
  );

  // Fight clock (+ hold damage), one tick every 250ms only while fighting.
  useEffect(() => {
    if (phase !== 'fight' || endAt === null) return;
    const id = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((endAt - now) / 1000));
      setTimeLeft(left);
      let total = banked.current;
      if (holdStart !== null) total += Math.floor((now - holdStart) / 1000);
      if (isHold) setDamage(total);
      if (total >= maxHp) finish(true, total);
      else if (left === 0) finish(false, total);
    }, 250);
    return () => clearInterval(id);
  }, [phase, endAt, holdStart, isHold, maxHp, finish]);

  const start = () => {
    primeAudio();
    finished.current = false;
    banked.current = 0;
    setDamage(0);
    setTimeLeft(boss.timeLimitSec);
    setEndAt(Date.now() + boss.timeLimitSec * 1000);
    setPhase('fight');
    setBubble(say('start', {}, 1));
  };

  const tap = (n: number) => {
    if (phase !== 'fight') return;
    void hapticImpact('light');
    setPopKey((k) => k + 1);
    setLastHit(n);
    const next = Math.min(maxHp, damage + n);
    banked.current = next;
    setDamage(next);
    if (next >= maxHp) finish(true, next);
  };

  const toggleHold = () => {
    if (phase !== 'fight') return;
    if (holdStart === null) {
      setHoldStart(Date.now());
      setBubble(say('hold', { exercise: exerciseName(arc.exerciseKey), seconds: Math.max(0, maxHp - banked.current) }, popKey));
    } else {
      banked.current += Math.floor((Date.now() - holdStart) / 1000);
      setHoldStart(null);
    }
  };

  const hpLeft = Math.max(0, maxHp - damage);
  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, '0');
  const coach = getCoach(arc.coachId);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg">
      <div aria-hidden className="speed-lines pointer-events-none fixed inset-0 opacity-50" />
      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-danger">{t('label')}</span>
          <button onClick={onClose} aria-label={t('close')} className="rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <BossEmblem boss={boss} size={112} defeated={phase === 'won'} className={phase === 'fight' && damage > 0 ? 'animate-shake' : ''} />
          <h2 className="mt-4 font-display text-3xl tracking-wide">{tBoss(`${boss.key}.name`)}</h2>
          <p className="text-sm text-ink-muted">{tBoss(`${boss.key}.title`)}</p>
        </div>

        {/* HP bar */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between font-mono text-xs">
            <span className="text-danger">{t('hp')}</span>
            <span className="text-ink-muted">
              {hpLeft}/{maxHp}
            </span>
          </div>
          <div className="mt-1 h-4 overflow-hidden rounded-full border border-danger/40 bg-danger-dim">
            <div
              className="h-full rounded-full bg-gradient-to-r from-danger to-forge transition-[width] duration-200"
              style={{ width: `${(hpLeft / maxHp) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <CoachPortrait coach={coach} size={64} mood={phase === 'fight' ? 'hype' : phase === 'won' ? 'hype' : 'idle'} />
          <SpeechBubble key={bubble} color={coach.colors[0]} className="flex-1">
            {bubble}
          </SpeechBubble>
        </div>

        <div className="mt-auto pt-6">
          {phase === 'intro' ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-ink-muted">
                {isHold
                  ? t('rulesHold', { name: exerciseName(arc.exerciseKey), n: maxHp, s: boss.timeLimitSec / 60 })
                  : t('rulesReps', { name: exerciseName(arc.exerciseKey), n: maxHp, s: boss.timeLimitSec / 60 })}
              </p>
              <Button size="lg" className="w-full bg-brand-gradient text-white" onClick={start}>
                <Swords size={18} /> {t('fight')}
              </Button>
            </div>
          ) : phase === 'fight' ? (
            <div className="flex flex-col items-center gap-4">
              <span className={cn('font-display text-5xl tabular-nums', timeLeft <= 10 ? 'text-danger' : 'text-ink')}>
                {mm}:{ss}
              </span>
              {isHold ? (
                <button
                  type="button"
                  onClick={toggleHold}
                  className={cn(
                    'flex h-40 w-40 flex-col items-center justify-center gap-1 rounded-full text-lg font-bold shadow-raised transition-transform active:scale-95',
                    holdStart !== null ? 'bg-aqua text-bg' : 'bg-brand-gradient text-white'
                  )}
                >
                  {holdStart !== null ? <Pause size={34} /> : <Hand size={34} />}
                  {holdStart !== null ? t('holding') : t('hold')}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => tap(1)}
                    className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full bg-brand-gradient text-white shadow-raised transition-transform active:scale-95"
                  >
                    <span className="font-display text-5xl">+1</span>
                    <span className="text-xs font-semibold opacity-80">{t('tapPerRep')}</span>
                    <span key={popKey} aria-hidden className={cn('absolute -top-2 font-display text-xl text-brass', popKey ? 'animate-pop' : 'opacity-0')}>
                      -{lastHit}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => tap(5)}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised font-display text-xl text-ink active:scale-95"
                  >
                    +5
                  </button>
                </div>
              )}
              <p className="font-mono text-xs text-ink-faint">{t('dealt', { n: damage })}</p>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className={cn('flex items-center justify-center gap-2 font-display text-3xl', phase === 'won' ? 'text-brass' : 'text-ink-muted')}>
                {phase === 'won' ? <Trophy size={28} /> : null}
                {phase === 'won' ? t('victory') : t('retreat')}
              </div>
              <p className="text-sm text-ink-muted">
                {phase === 'won' ? t('wonBody', { n: damage }) : t('lostBody', { n: damage, hp: maxHp })}
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  {t('close')}
                </Button>
                {phase === 'lost' ? (
                  <Button className="flex-1" onClick={start}>
                    <RotateCcw size={16} /> {t('again')}
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={start}>
                    <Play size={16} /> {t('rematch')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
