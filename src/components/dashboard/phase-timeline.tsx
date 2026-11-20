'use client';

import { useTranslations } from 'next-intl';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProgram } from '@/hooks/use-program';
import { PHASES } from '@/lib/program/program';
import { cn } from '@/lib/utils';

/** Weeks per phase (phase 6 runs weeks 41–52 plus day 365). */
const PHASE_WEEKS = [8, 8, 8, 8, 8, 12];

export function PhaseTimeline() {
  const t = useTranslations('dashboard');
  const { today, totalDays } = useProgram();
  const totalWeeks = PHASE_WEEKS.reduce((a, b) => a + b, 0);
  const position = Math.min(100, ((today.dayNumber - 0.5) / totalDays) * 100);
  const current = PHASES.find((p) => p.id === today.phase) ?? PHASES[0];
  const weekInPhase = today.weekNumber - PHASE_WEEKS.slice(0, current.id - 1).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('yearAhead')}</CardTitle>
        <span className="font-mono text-xs text-ink-faint">
          {t('weekDaysLeft', { week: today.weekNumber, days: Math.max(0, totalDays - today.dayNumber) })}
        </span>
      </CardHeader>
      <CardContent>
        <div className="relative pt-5">
          <span
            className="absolute top-0 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-forge"
            style={{ left: `${position}%` }}
          >
            {t('you')}
          </span>
          <span
            className="absolute top-4 z-10 h-5 w-0.5 -translate-x-1/2 rounded-full bg-forge shadow-glow"
            style={{ left: `${position}%` }}
          />
          <div className="flex h-3 gap-1">
            {PHASES.map((phase, i) => {
              const done = phase.id < today.phase;
              const active = phase.id === today.phase;
              return (
                <div
                  key={phase.id}
                  className={cn(
                    'h-full rounded-full',
                    done ? 'bg-forge' : active ? 'bg-forge/50' : 'bg-surface-raised'
                  )}
                  style={{ width: `${(PHASE_WEEKS[i] / totalWeeks) * 100}%` }}
                  title={`Phase ${phase.id}: ${phase.name} · weeks ${phase.weeks}`}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-3 hidden gap-1 sm:flex">
          {PHASES.map((phase, i) => (
            <div key={phase.id} style={{ width: `${(PHASE_WEEKS[i] / totalWeeks) * 100}%` }} className="min-w-0">
              <p
                className={cn(
                  'truncate font-mono text-[10px] uppercase tracking-wider',
                  phase.id === today.phase ? 'text-forge' : phase.id < today.phase ? 'text-ink-muted' : 'text-ink-faint'
                )}
              >
                {phase.id}. {phase.name}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-sm border border-line bg-bg px-4 py-3">
          <p className="text-sm font-semibold text-ink">
            Phase {current.id}: {current.name}{' '}
            <span className="font-mono text-xs font-normal text-ink-faint">
              · {t('phaseWeek', { week: weekInPhase, total: PHASE_WEEKS[current.id - 1] })}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">{current.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
