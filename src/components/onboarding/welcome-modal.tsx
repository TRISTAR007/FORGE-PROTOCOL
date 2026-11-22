'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { CoachAvatar, CoachPortrait, SpeechBubble } from '@/components/coach/coach-portrait';
import { useProgress } from '@/context/progress-context';
import { useCoach } from '@/hooks/use-coach';
import { COACHES } from '@/lib/coaches';
import { fromDisplayLength, fromDisplayWeight, lengthUnit, weightUnit } from '@/lib/units';
import type { UnitSystem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PLAN_STEPS, PlanQuestion, PlanSummary, draftFromPlan, planFromDraft, type PlanDraft } from '@/components/plan/plan-questions';

/** Steps: 0 coach · 1–5 plan questions · 6 plan summary · 7 starting measurements. */
const SUMMARY_STEP = 1 + PLAN_STEPS;
const LAST_STEP = SUMMARY_STEP + 1;

/** First-run setup: pick a coach, answer the plan questions (incl. injuries), optionally log measurements. */
export function WelcomeModal() {
  const t = useTranslations('onboarding');
  const tSettings = useTranslations('settings');
  const { progress, settings, updateSettings, completeOnboarding, setPlan } = useProgress();
  const { coach, line, say } = useCoach();
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [draft, setDraft] = useState<PlanDraft>(() => draftFromPlan(progress.plan, settings.trainingMode));
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
    setPlan(planFromDraft(draft));
    if (draft.mode !== settings.trainingMode) updateSettings({ trainingMode: draft.mode });
    completeOnboarding(hasAny ? measurements : undefined);
  };

  return (
    <Modal open={shouldShow} onClose={() => completeOnboarding()} title={t('title')}>
      <div className="mb-5 flex gap-1.5">
        {Array.from({ length: LAST_STEP + 1 }, (_, i) => i).map((i) => (
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
      ) : step < SUMMARY_STEP ? (
        <PlanQuestion step={step - 1} draft={draft} onChange={setDraft} />
      ) : step === SUMMARY_STEP ? (
        <PlanSummary draft={draft} />
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
        {step < LAST_STEP ? (
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
