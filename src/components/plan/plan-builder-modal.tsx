'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { PLAN_STEPS, PlanQuestion, PlanSummary, draftFromPlan, planFromDraft, type PlanDraft } from './plan-questions';
import { cn } from '@/lib/utils';

/** Build (or rebuild) the training plan: goal, level, gear, time and injuries. */
export function PlanBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('plan');
  const tOnb = useTranslations('onboarding');
  const { progress, settings, setPlan, updateSettings } = useProgress();
  const { toast } = useToast();
  const { level } = useTrainingStats();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PlanDraft>(() => draftFromPlan(progress.plan, settings.trainingMode));
  const last = PLAN_STEPS; // summary

  const close = () => {
    setStep(0);
    onClose();
  };

  const finish = () => {
    setPlan(planFromDraft(draft));
    if (draft.mode !== settings.trainingMode) updateSettings({ trainingMode: draft.mode });
    toast(t('saved'));
    close();
  };

  return (
    <Modal open={open} onClose={close} title={t('title')}>
      <div className="mb-5 flex gap-1.5">
        {Array.from({ length: last + 1 }, (_, i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-brand-gradient' : 'bg-surface')} />
        ))}
      </div>
      {step < last ? <PlanQuestion step={step} draft={draft} onChange={setDraft} /> : <PlanSummary draft={draft} rank={level.rank} />}
      <div className="mt-6 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={() => (step === 0 ? close() : setStep((s) => s - 1))}>
          {step === 0 ? tOnb('skip') : tOnb('back')}
        </Button>
        {step < last ? (
          <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
            {tOnb('next')}
          </Button>
        ) : (
          <Button className="flex-1 bg-brand-gradient text-white" onClick={finish}>
            {t('save')}
          </Button>
        )}
      </div>
    </Modal>
  );
}
