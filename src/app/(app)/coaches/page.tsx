'use client';

import { useTranslations } from 'next-intl';
import { Check, Quote, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoachPortrait } from '@/components/coach/coach-portrait';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { useCoach } from '@/hooks/use-coach';
import { COACHES, type Coach } from '@/lib/coaches';
import { cn } from '@/lib/utils';

function CoachCard({ coach, selected }: { coach: Coach; selected: boolean }) {
  const t = useTranslations('coaches');
  const { updateSettings } = useProgress();
  const { toast } = useToast();
  const { say } = useCoach(coach);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all',
        selected ? 'border-transparent shadow-glow-violet' : 'hover:-translate-y-0.5 hover:border-forge/30'
      )}
      style={selected ? { boxShadow: `0 0 0 2px ${coach.colors[0]}, 0 0 36px -6px ${coach.colors[1]}` } : undefined}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 opacity-70"
        style={{ backgroundImage: `linear-gradient(160deg, ${coach.colors[0]}40, ${coach.colors[1]}10 60%, transparent)` }}
      />
      <div aria-hidden className="speed-lines pointer-events-none absolute inset-x-0 top-0 h-48 opacity-50" />

      <div className="relative flex flex-col items-center px-5 pt-6 text-center">
        <CoachPortrait coach={coach} size={168} mood={selected ? 'hype' : 'idle'} />
        {selected ? (
          <span className="absolute end-4 top-4 inline-flex items-center gap-1 rounded-full bg-ok px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-bg">
            <Check size={12} strokeWidth={3} /> {t('yourCoach')}
          </span>
        ) : null}
        <h2 className="mt-5 font-display text-2xl tracking-wide">{coach.name}</h2>
        <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: coach.colors[0] }}>
          {coach.title}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          <span className="rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] text-ink-muted">
            {t('specialty')}: <span className="text-ink">{coach.specialty}</span>
          </span>
          <span className="rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] text-ink-muted">
            {t('element')}: <span className="text-ink">{coach.element}</span>
          </span>
        </div>
      </div>

      <div className="relative px-5 pb-5 pt-4">
        <p className="text-sm leading-relaxed text-ink-muted">{coach.bio}</p>
        <p className="mt-3 flex gap-2 text-sm font-semibold italic text-ink">
          <Quote size={14} className="mt-0.5 shrink-0" style={{ color: coach.colors[0] }} />
          {coach.catchphrase}
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => say('greet', {}, 0, true)}>
            <Volume2 size={14} /> {t('hear', { name: coach.name.split(' ')[0] })}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={selected}
            onClick={() => {
              updateSettings({ coachId: coach.id });
              toast(t('chosen', { name: coach.name }));
              say('greet', {}, 1);
            }}
          >
            {selected ? t('yourCoach') : t('choose', { name: coach.name.split(' ')[0] })}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function CoachesPage() {
  const t = useTranslations('coaches');
  const { settings } = useProgress();

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-1 max-w-2xl text-ink-muted">{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {COACHES.map((coach) => (
          <CoachCard key={coach.id} coach={coach} selected={coach.id === settings.coachId} />
        ))}
      </div>
      <p className="text-center text-xs text-ink-faint">{t('original')}</p>
    </div>
  );
}
