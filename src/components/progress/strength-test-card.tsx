'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/ui/trend-chart';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';

export function StrengthTestCard() {
  const { progress, recordStrengthTest } = useProgress();
  const { toast } = useToast();
  const [pushups, setPushups] = useState('');
  const [squats, setSquats] = useState('');
  const [plank, setPlank] = useState('');

  useEffect(() => {
    setPushups(progress.strengthTests.pushups?.toString() ?? '');
    setSquats(progress.strengthTests.squats?.toString() ?? '');
    setPlank(progress.strengthTests.plankSeconds?.toString() ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    recordStrengthTest({
      pushups: pushups ? Number(pushups) : undefined,
      squats: squats ? Number(squats) : undefined,
      plankSeconds: plank ? Number(plank) : undefined,
    });
    toast('Strength test recorded.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strength Test</CardTitle>
        {progress.strengthTests.updatedAt ? (
          <span className="font-mono text-xs text-ink-faint">
            Updated {new Date(progress.strengthTests.updatedAt).toLocaleDateString()}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <TrendChart
          points={progress.strengthHistory
            .filter((e) => e.pushups !== undefined)
            .map((e) => ({ date: e.date, value: e.pushups as number }))
            .sort((a, b) => a.date.localeCompare(b.date))}
          label="Push-ups"
          colorClassName="text-forge"
          higherIsBetter
        />
        <p className="mb-4 mt-5 text-sm text-ink-muted">
          Test max push-ups in one set, max bodyweight squats in one set, and a plank hold — retest every few weeks to see
          real progress.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Push-ups (max)" type="number" inputMode="numeric" value={pushups} onChange={(e) => setPushups(e.target.value)} placeholder="—" />
          <Input label="Squats (max)" type="number" inputMode="numeric" value={squats} onChange={(e) => setSquats(e.target.value)} placeholder="—" />
          <Input label="Plank (sec)" type="number" inputMode="numeric" value={plank} onChange={(e) => setPlank(e.target.value)} placeholder="—" />
        </div>
        <Button onClick={handleSave} className="mt-4">
          Record Test
        </Button>
      </CardContent>
    </Card>
  );
}
