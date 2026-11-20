'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Dumbbell, Home } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { CoachAvatar, CoachPortrait, SpeechBubble } from '@/components/coach/coach-portrait';
import { useProgress } from '@/context/progress-context';
import { useCoach } from '@/hooks/use-coach';
import { COACHES } from '@/lib/coaches';
import { fromDisplayLength, fromDisplayWeight, lengthUnit, weightUnit } from '@/lib/units';
import type { TrainingMode, UnitSystem } from '@/lib/types';
import { cn } from '@/lib/utils';

const MODES: { id: TrainingMode; icon: typeof Home }[] = [
  { id: 'home', icon: Home },
  { id: 'dumbbells', icon: Dumbbell },
  { id: 'gym', icon: Building2 },
];

/** First-run setup: pick a coach, pick a training mode, optionally log starting measurements. */
export function WelcomeModal() {
  const t = useTranslations('onboarding');
  const tSettings = useTranslations('settings');
  const { progress, settings, updateSettings, completeOnboarding } = useProgress();
  const { coach, line, say } = useCoach();
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const units = settings.units;

  const isNewAccount =
    progress.completedDays.length === 0 &&
    progress.measurementHistory.length === 0 &&
    Object.keys(progress.exerciseChecks).length === 0 &&
    Object.keys(progress.measurements).length === 0;
  const shouldShow = !progress.onboardingCompleted && isNewAccount;

  const parse = (v: string, convert: (n: number) => number) => {
    const n = Number(v);
    return v && Number.isFinite(n) && n > 0 ? Math.round(convert(n) * 100) / 100 : undefined;
  };

  const finish = () => {
    const measurements = {
      weight: parse(weight, (n) => fromDisplayWeight(n, units)),
      chest: parse(chest, (n) => fromDisplayLength(n, units)),
      waist: parse(waist, (n) => fromDisplayLength(n, units)),
    };
    const hasAny = Object.values(measurements).some((v) => v !== undefined);
    completeOnboarding(hasAny ? measurements : undefined);
  };

  return (
    <Modal open={shouldShow} onClose={() => completeOnboarding()} title={t('title')}>
      <div className="mb-5 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-brand-gradient' : 'bg-surface')} />
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg tracking-wide">{t('step1Title')}</h3>
            <p className="text-sm text-ink-muted">{t('step1Body')}</p>
          </div>
          <div className="flex items-start gap-4">
            <CoachPortrait coach={coach} size={104} mood="hype" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg tracking-wide">{coach.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: coach.colors[0] }}>
                {coach.title} · {coach.specialty}
              </p>
              <SpeechBubble key={coach.id} color={coach.colors[0]} className="mt-2">
                {line('greet', {}, 0)}
              </SpeechBubble>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COACHES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => updateSettings({ coachId: c.id })}
                aria-pressed={settings.coachId === c.id}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md p-1.5 transition-colors',
                  settings.coachId === c.id ? 'bg-forge-dim ring-2 ring-forge' : 'hover:bg-surface'
                )}
              >
                <CoachAvatar coach={c} size={44} />
                <span className="text-[11px] font-semibold">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : step === 1 ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg tracking-wide">{t('step2Title')}</h3>
            <p className="text-sm text-ink-muted">{t('step2Body')}</p>
          </div>
          <div className="space-y-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateSettings({ trainingMode: m.id })}
                aria-pressed={settings.trainingMode === m.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border p-4 text-start transition-colors',
                  settings.trainingMode === m.id ? 'border-forge bg-forge-dim/50' : 'border-line hover:bg-surface'
                )}
              >
                <m.icon size={22} className={settings.trainingMode === m.id ? 'text-forge' : 'text-ink-muted'} />
                <span>
                  <span className="block font-semibold">{tSettings(`modes.${m.id}`)}</span>
                  <span className="block text-xs text-ink-faint">{t(`mode_${m.id}`)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg tracking-wide">{t('step3Title')}</h3>
            <p className="text-sm text-ink-muted">{t('step3Body')}</p>
          </div>
          <Segmented<UnitSystem>
            label={tSettings('units')}
            options={[
              { id: 'metric', label: 'kg / cm' },
              { id: 'imperial', label: 'lb / in' },
            ]}
            value={units}
            onChange={(u) => updateSettings({ units: u })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input id="welcome-weight" label={`${t('weight')} (${weightUnit(units)})`} type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="—" />
            <Input id="welcome-chest" label={`${t('chest')} (${lengthUnit(units)})`} type="number" inputMode="decimal" value={chest} onChange={(e) => setChest(e.target.value)} placeholder="—" />
            <Input id="welcome-waist" label={`${t('waist')} (${lengthUnit(units)})`} type="number" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="—" />
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="flex-1">
            {t('back')}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => completeOnboarding()} className="flex-1">
            {t('skip')}
          </Button>
        )}
        {step < 2 ? (
          <Button
            onClick={() => {
              if (step === 0) say('start', {}, 0);
              setStep((s) => s + 1);
            }}
            className="flex-1"
          >
            {t('next')}
          </Button>
        ) : (
          <Button onClick={finish} className="flex-1 bg-brand-gradient text-white">
            {t('finish')}
          </Button>
        )}
      </div>
    </Modal>
  );
}
