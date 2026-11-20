'use client';

/* eslint-disable @next/next/no-img-element -- previewing a locally generated blob URL */

import { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useProgress } from '@/context/progress-context';
import { useProgram } from '@/hooks/use-program';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { getPhase } from '@/lib/program/program';
import { BRAND, FLAME_PATH } from '@/lib/brand';
import { round1, toDisplayWeight, weightUnit } from '@/lib/units';

interface CardData {
  day: number;
  totalDays: number;
  phase: string;
  streak: number;
  workouts: number;
  extraLabel: string;
  extraValue: string;
}

function fontVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Draws the share card entirely in the browser — nothing is uploaded unless the person shares it. */
async function renderCard(d: CardData): Promise<Blob> {
  await document.fonts.ready;
  const display = fontVar('--font-anton', 'Impact, sans-serif');
  const body = fontVar('--font-manrope', 'system-ui, sans-serif');
  const mono = fontVar('--font-jbmono', 'monospace');

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = BRAND.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, 120, 0, W * 0.85, 120, 700);
  glow.addColorStop(0, 'rgba(255,106,43,0.32)');
  glow.addColorStop(1, 'rgba(255,106,43,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Brand mark
  ctx.fillStyle = BRAND.forge;
  ctx.beginPath();
  ctx.roundRect(80, 80, 88, 88, 18);
  ctx.fill();
  ctx.save();
  ctx.translate(96, 96);
  ctx.scale(56 / 24, 56 / 24);
  ctx.strokeStyle = BRAND.bg;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke(new Path2D(FLAME_PATH));
  ctx.restore();
  ctx.fillStyle = BRAND.ink;
  ctx.font = `48px ${display}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('FORGE PROTOCOL', 196, 126);

  // Day counter
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = BRAND.brass;
  ctx.font = `600 34px ${mono}`;
  ctx.fillText(d.phase.toUpperCase(), 80, 340);
  ctx.fillStyle = BRAND.ink;
  ctx.font = `360px ${display}`;
  ctx.fillText(String(d.day), 68, 700);
  ctx.fillStyle = BRAND.faint;
  ctx.font = `600 40px ${mono}`;
  ctx.fillText(`DAY ${d.day} OF ${d.totalDays}`, 80, 780);

  // Year progress bar
  const barY = 830;
  ctx.fillStyle = BRAND.line;
  ctx.beginPath();
  ctx.roundRect(80, barY, W - 160, 18, 9);
  ctx.fill();
  ctx.fillStyle = BRAND.forge;
  ctx.beginPath();
  ctx.roundRect(80, barY, Math.max(18, ((W - 160) * d.day) / d.totalDays), 18, 9);
  ctx.fill();

  // Stats
  const stats = [
    { label: 'DAY STREAK', value: String(d.streak) },
    { label: 'WORKOUTS', value: String(d.workouts) },
    { label: d.extraLabel, value: d.extraValue },
  ];
  const colW = (W - 160) / 3;
  stats.forEach((s, i) => {
    const x = 80 + i * colW;
    ctx.fillStyle = BRAND.surface;
    ctx.beginPath();
    ctx.roundRect(x + (i === 0 ? 0 : 12), 920, colW - 12, 210, 20);
    ctx.fill();
    ctx.fillStyle = BRAND.ink;
    ctx.font = `110px ${display}`;
    ctx.fillText(s.value, x + 40, 1050);
    ctx.fillStyle = BRAND.faint;
    ctx.font = `600 26px ${mono}`;
    ctx.fillText(s.label, x + 40, 1100);
  });

  ctx.fillStyle = BRAND.muted;
  ctx.font = `500 32px ${body}`;
  ctx.fillText('365 days of home training · no gym required', 80, 1250);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render card'))), 'image/png')
  );
}

export function ShareProgressButton() {
  const { progress, settings } = useProgress();
  const { today, totalDays } = useProgram();
  const { streak, workoutsCompleted } = useTrainingStats();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);

  const buildData = (): CardData => {
    const weights = [...progress.measurementHistory]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => e.weight)
      .filter((w): w is number => w != null);
    const pushups = progress.strengthTests.pushups;
    let extraLabel = 'BEST PUSH-UPS';
    let extraValue = pushups ? String(pushups) : '—';
    if (weights.length >= 2) {
      const delta = round1(toDisplayWeight(weights[weights.length - 1], settings.units) - toDisplayWeight(weights[0], settings.units));
      extraLabel = `${weightUnit(settings.units).toUpperCase()} CHANGE`;
      extraValue = `${delta > 0 ? '+' : ''}${delta}`;
    }
    const phase = getPhase(today.weekNumber);
    return {
      day: today.dayNumber,
      totalDays,
      phase: `Phase ${phase.id} · ${phase.name}`,
      streak,
      workouts: workoutsCompleted,
      extraLabel,
      extraValue,
    };
  };

  const open = async () => {
    setBusy(true);
    try {
      const blob = await renderCard(buildData());
      const file = new File([blob], `forge-day-${today.dayNumber}.png`, { type: 'image/png' });
      setPreview({ url: URL.createObjectURL(blob), file });
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const download = () => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview.url;
    a.download = preview.file.name;
    a.click();
  };

  const share = async () => {
    if (!preview) return;
    try {
      await navigator.share({ files: [preview.file], title: 'My FORGE Protocol progress' });
    } catch {
      // Cancelled by the person, or unsupported — download stays available.
    }
  };

  const canShareFiles =
    typeof navigator !== 'undefined' && preview !== null && Boolean(navigator.canShare?.({ files: [preview.file] }));

  return (
    <>
      <Button variant="secondary" onClick={() => void open()} loading={busy}>
        <Share2 size={16} />
        Share Progress
      </Button>
      <Modal open={preview !== null} onClose={close} title="Share your progress" size="sm">
        {preview ? (
          <div>
            <img src={preview.url} alt="Your progress card" className="w-full rounded-sm border border-line" />
            <div className="mt-4 flex gap-2">
              {canShareFiles ? (
                <Button className="flex-1" onClick={() => void share()}>
                  <Share2 size={16} /> Share
                </Button>
              ) : null}
              <Button variant={canShareFiles ? 'secondary' : 'primary'} className="flex-1" onClick={download}>
                <Download size={16} /> Download
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
