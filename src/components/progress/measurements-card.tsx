'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/ui/trend-chart';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import type { Measurements } from '@/lib/types';
import {
  fromDisplayLength,
  fromDisplayWeight,
  lengthUnit,
  round1,
  toDisplayLength,
  toDisplayWeight,
  weightUnit,
} from '@/lib/units';
import { cn } from '@/lib/utils';

type MetricKey = 'weight' | 'chest' | 'arms' | 'waist' | 'thighs';

const FIELDS: { key: MetricKey; label: string }[] = [
  { key: 'weight', label: 'Weight' },
  { key: 'chest', label: 'Chest' },
  { key: 'arms', label: 'Arms' },
  { key: 'waist', label: 'Waist' },
  { key: 'thighs', label: 'Thighs' },
];

export function MeasurementsCard() {
  const { progress, settings, saveMeasurements } = useProgress();
  const { toast } = useToast();
  const units = settings.units;
  const [metric, setMetric] = useState<MetricKey>('weight');

  const unitFor = (key: MetricKey) => (key === 'weight' ? weightUnit(units) : lengthUnit(units));
  const toDisplay = (key: MetricKey, v: number) => (key === 'weight' ? toDisplayWeight(v, units) : toDisplayLength(v, units));
  const fromDisplay = (key: MetricKey, v: number) =>
    key === 'weight' ? fromDisplayWeight(v, units) : fromDisplayLength(v, units);

  const initialForm = () =>
    Object.fromEntries(
      FIELDS.map((f) => {
        const v = progress.measurements[f.key];
        return [f.key, v != null ? String(toDisplay(f.key, v)) : ''];
      })
    ) as Record<MetricKey, string>;
  const [form, setForm] = useState<Record<MetricKey, string>>(initialForm);
  const [formUnits, setFormUnits] = useState(units);
  // Re-express the form when the unit setting changes.
  if (formUnits !== units) {
    setFormUnits(units);
    setForm(initialForm());
  }

  const history = [...progress.measurementHistory].sort((a, b) => a.date.localeCompare(b.date));
  const seriesFor = (key: MetricKey) =>
    history.filter((e) => e[key] != null).map((e) => ({ date: e.date, value: toDisplay(key, e[key] as number) }));

  const handleSave = () => {
    const parsed: Measurements = {};
    for (const f of FIELDS) {
      const raw = form[f.key];
      const n = raw ? Number(raw) : NaN;
      // Stored in kg / cm with 2 decimals, so converting back and forth doesn't drift.
      parsed[f.key] = Number.isFinite(n) && n > 0 ? Math.round(fromDisplay(f.key, n) * 100) / 100 : undefined;
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
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FIELDS.map((f) => {
            const series = seriesFor(f.key);
            const latest = series[series.length - 1]?.value;
            const delta = series.length >= 2 ? round1(series[series.length - 1].value - series[0].value) : null;
            return (
              <button
                key={f.key}
                onClick={() => setMetric(f.key)}
                className={cn(
                  'rounded-sm border p-2.5 text-left transition-colors',
                  metric === f.key ? 'border-forge/50 bg-forge-dim/40' : 'border-line bg-bg hover:bg-surface-hover'
                )}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{f.label}</p>
                <p className="mt-0.5 font-display text-lg tracking-wide">
                  {latest != null ? latest : '—'}
                  <span className="ml-1 font-body text-xs text-ink-faint">{latest != null ? unitFor(f.key) : ''}</span>
                </p>
                <p className="font-mono text-[10px] text-ink-muted">
                  {delta !== null && delta !== 0 ? `${delta > 0 ? '+' : ''}${delta} since start` : ' '}
                </p>
              </button>
            );
          })}
        </div>

        <TrendChart
          points={seriesFor(metric)}
          label={FIELDS.find((f) => f.key === metric)?.label ?? ''}
          unit={` ${unitFor(metric)}`}
          colorClassName="text-brass"
        />

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELDS.map((f) => (
            <Input
              key={f.key}
              id={`measure-${f.key}`}
              label={`${f.label} (${unitFor(f.key)})`}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
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
