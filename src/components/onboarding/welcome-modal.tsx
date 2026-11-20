'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { useProgress } from '@/context/progress-context';
import { fromDisplayLength, fromDisplayWeight, lengthUnit, weightUnit } from '@/lib/units';
import type { UnitSystem } from '@/lib/types';

export function WelcomeModal() {
  const { progress, settings, updateSettings, completeOnboarding } = useProgress();
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [saving, setSaving] = useState(false);
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

  const handleStart = () => {
    setSaving(true);
    const measurements = {
      weight: parse(weight, (n) => fromDisplayWeight(n, units)),
      chest: parse(chest, (n) => fromDisplayLength(n, units)),
      waist: parse(waist, (n) => fromDisplayLength(n, units)),
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
        <Segmented<UnitSystem>
          label="Units"
          options={[
            { id: 'metric', label: 'kg / cm' },
            { id: 'imperial', label: 'lb / in' },
          ]}
          value={units}
          onChange={(u) => updateSettings({ units: u })}
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            id="welcome-weight"
            label={`Weight (${weightUnit(units)})`}
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="—"
          />
          <Input
            id="welcome-chest"
            label={`Chest (${lengthUnit(units)})`}
            type="number"
            inputMode="decimal"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            placeholder="—"
          />
          <Input
            id="welcome-waist"
            label={`Waist (${lengthUnit(units)})`}
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
