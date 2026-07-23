'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/ui/trend-chart';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import type { Measurements } from '@/lib/types';

const FIELDS: { key: 'weight' | 'chest' | 'arms' | 'waist' | 'thighs'; label: string; unit: string }[] = [
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'arms', label: 'Arms', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'thighs', label: 'Thighs', unit: 'cm' },
];

export function MeasurementsCard() {
  const { progress, saveMeasurements } = useProgress();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({
      weight: progress.measurements.weight?.toString() ?? '',
      chest: progress.measurements.chest?.toString() ?? '',
      arms: progress.measurements.arms?.toString() ?? '',
      waist: progress.measurements.waist?.toString() ?? '',
      thighs: progress.measurements.thighs?.toString() ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const parsed: Measurements = {};
    for (const f of FIELDS) {
      const v = form[f.key];
      parsed[f.key] = v ? Number(v) : undefined;
    }
    saveMeasurements(parsed);
    toast('Measurements saved.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Measurements</CardTitle>
        {progress.measurements.updatedAt ? (
          <span className="font-mono text-xs text-ink-faint">
            Updated {new Date(progress.measurements.updatedAt).toLocaleDateString()}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <TrendChart
          points={progress.measurementHistory
            .filter((e) => e.weight !== undefined)
            .map((e) => ({ date: e.date, value: e.weight as number }))
            .sort((a, b) => a.date.localeCompare(b.date))}
          label="Weight"
          unit="kg"
          colorClassName="text-brass"
        />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELDS.map((f) => (
            <Input
              key={f.key}
              label={`${f.label} (${f.unit})`}
              type="number"
              inputMode="decimal"
              value={form[f.key] ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder="—"
            />
          ))}
        </div>
        <Button onClick={handleSave} className="mt-4">
          Save Measurements
        </Button>
      </CardContent>
    </Card>
  );
}
