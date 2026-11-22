'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Clock, MessagesSquare, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { useProgress } from '@/context/progress-context';
import { getCoach } from '@/lib/coaches';
import { recommendRoutines } from '@/lib/program/plan';

/** Three short no-equipment workouts (rotating daily) + a nudge into the community. */
export function QuickPicks({ seed }: { seed: number }) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { settings, progress } = useProgress();

  // Matched to the plan questionnaire (goal, time, level, gear, injuries) when there is one.
  const picks = recommendRoutines(progress.plan, settings.trainingMode, 3, seed);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr,1fr]">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg tracking-wide">
                <Zap size={18} className="text-brass" /> {t('quickTitle')}
              </h2>
              <p className="text-sm text-ink-muted">{t('quickSubtitle')}</p>
            </div>
            <Link href="/train" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-forge hover:text-forge-hover">
              {tc('seeAll')} <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {picks.map((r) => {
              const coach = getCoach(r.coachId);
              return (
                <Link
                  key={r.id}
                  href="/train"
                  className="group flex items-center gap-3 rounded-md border border-line bg-bg p-3 transition-colors hover:border-forge/40 sm:flex-col sm:items-start"
                >
                  <CoachAvatar coach={coach} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink group-hover:text-forge">{r.name}</p>
                    <p className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                      <Clock size={11} /> {tc('minutes', { count: r.minutes })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-50" />
        <CardContent className="relative flex h-full flex-col justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg tracking-wide">
              <MessagesSquare size={18} className="text-aqua" /> {t('communityTitle')}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t('communityBody')}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {['mika', 'zara', 'leo', 'nova'].map((id) => (
                <CoachAvatar key={id} coach={getCoach(id)} size={34} className="ring-2 ring-surface" />
              ))}
            </div>
            <Link href="/community">
              <Button size="sm" variant="secondary">
                {t('communityButton')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
