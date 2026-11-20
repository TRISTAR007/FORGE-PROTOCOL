'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Segmented } from '@/components/ui/segmented';
import { TrendChart } from '@/components/ui/trend-chart';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { daysBetween, parseDateKey } from '@/lib/utils';

type TestKey = 'pushups' | 'squats' | 'plankSeconds';

const TESTS: { key: TestKey; label: string; unit: string; input: string }[] = [
  { key: 'pushups', label: 'Push-ups', unit: '', input: 'Push-ups (max)' },
  { key: 'squats', label: 'Squats', unit: '', input: 'Squats (max)' },
  { key: 'plankSeconds', label: 'Plank', unit: 's', input: 'Plank (sec)' },
];

const RETEST_EVERY_DAYS = 28;

export function StrengthTestCard() {
  const { progress, recordStrengthTest } = useProgress();
  const { toast } = useToast();
  const [metric, setMetric] = useState<TestKey>('pushups');
  const [form, setForm] = useState<Record<TestKey, string>>(() => ({
    pushups: progress.strengthTests.pushups?.toString() ?? '',
    squats: progress.strengthTests.squats?.toString() ?? '',
    plankSeconds: progress.strengthTests.plankSeconds?.toString() ?? '',
  }));

  const history = [...progress.strengthHistory].sort((a, b) => a.date.localeCompare(b.date));
  const lastTest = history[history.length - 1]?.date;
  const daysSinceTest = lastTest ? daysBetween(parseDateKey(lastTest), new Date()) : null;
  const retestDue = daysSinceTest === null || daysSinceTest >= RETEST_EVERY_DAYS;

  const best = (key: TestKey) => {
    const values = history.map((e) => e[key]).filter((v): v is number => v != null);
    return values.length ? Math.max(...values) : null;
  };

  const handleSave = () => {
    const num = (v: string) => {
      const n = Number(v);
      return v && Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
    };
    recordStrengthTest({ pushups: num(form.pushups), squats: num(form.squats), plankSeconds: num(form.plankSeconds) });
    toast('Strength test recorded.');
  };

  const active = TESTS.find((t) => t.key === metric)!;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strength Test</CardTitle>
        {retestDue ? (
          <Badge tone="forge">{lastTest ? 'Retest due' : 'Take your first test'}</Badge>
        ) : (
          <span className="font-mono text-xs text-ink-faint">Next retest in {RETEST_EVERY_DAYS - (daysSinceTest ?? 0)} days</span>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {TESTS.map((t) => {
            const b = best(t.key);
            return (
              <div key={t.key} className="rounded-sm border border-line bg-bg p-2.5 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Best {t.label}</p>
                <p className="mt-0.5 font-display text-xl tracking-wide">{b != null ? `${b}${t.unit}` : '—'}</p>
              </div>
            );
          })}
        </div>

        <Segmented
          label="Strength metric"
          options={TESTS.map((t) => ({ id: t.key, label: t.label }))}
          value={metric}
          onChange={setMetric}
          className="mb-3"
        />
        <TrendChart
          points={history
            .filter((e) => e[metric] != null)
            .map((e) => ({ date: e.date, value: e[metric] as number }))}
          label={active.label}
          unit={active.unit}
          colorClassName="text-forge"
          higherIsBetter
        />
        <p className="mb-4 mt-5 text-sm text-ink-muted">
          Test max push-ups in one set, max bodyweight squats in one set, and a plank hold. Retest every 4 weeks to see
          real progress.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {TESTS.map((t) => (
            <Input
              key={t.key}
              id={`strength-${t.key}`}
              label={t.input}
              type="number"
              inputMode="numeric"
              min={0}
              value={form[t.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [t.key]: e.target.value }))}
              placeholder="—"
            />
          ))}
        </div>
        <Button onClick={handleSave} className="mt-4">
          Record Test
        </Button>
      </CardContent>
    </Card>
  );
}
