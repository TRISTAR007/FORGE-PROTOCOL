'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/context/progress-context';

export function WelcomeModal() {
  const { progress, completeOnboarding } = useProgress();
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [saving, setSaving] = useState(false);

  const isNewAccount =
    progress.completedDays.length === 0 &&
    progress.measurementHistory.length === 0 &&
    Object.keys(progress.exerciseChecks).length === 0 &&
    Object.keys(progress.measurements).length === 0;
  const shouldShow = !progress.onboardingCompleted && isNewAccount;

  const handleStart = () => {
    setSaving(true);
    const measurements = {
      weight: weight ? Number(weight) : undefined,
      chest: chest ? Number(chest) : undefined,
      waist: waist ? Number(waist) : undefined,
    };
    const hasAny = Object.values(measurements).some((v) => v !== undefined);
    completeOnboarding(hasAny ? measurements : undefined);
  };

  const handleSkip = () => completeOnboarding();

  return (
    <Modal open={shouldShow} onClose={handleSkip} title="Welcome to FORGE Protocol">
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Log your starting numbers now so Day 1 has something to compare against later — totally optional, and you
          can always add these from the Progress page instead.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Weight (kg)"
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="—"
          />
          <Input
            label="Chest (cm)"
            type="number"
            inputMode="decimal"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            placeholder="—"
          />
          <Input
            label="Waist (cm)"
            type="number"
            inputMode="decimal"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="—"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={handleStart} loading={saving} className="flex-1">
            Save &amp; Start
          </Button>
        </div>
      </div>
    </Modal>
  );
}
