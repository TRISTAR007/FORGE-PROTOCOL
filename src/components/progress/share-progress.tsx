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
import { APP_NAME, APP_NAME_UPPER, BRAND, LOGO_PATHS, LOGO_SPARK } from '@/lib/brand';
import { getCoach } from '@/lib/coaches';
import { round1, toDisplayWeight, weightUnit } from '@/lib/units';

interface CardData {
  day: number;
  totalDays: number;
  phase: string;
  streak: number;
  workouts: number;
  extraLabel: string;
  extraValue: string;
  coachImage: string;
  coachName: string;
  coachColors: [string, string];
}

function fontVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Draws the share card entirely in the browser — nothing is uploaded unless the person shares it. */
async function renderCard(d: CardData): Promise<Blob> {
  await document.fonts.ready;
  const display = fontVar('--font-display', 'Impact, sans-serif');
  const body = fontVar('--font-body', 'system-ui, sans-serif');
  const mono = fontVar('--font-mono', 'monospace');
  const coach = await loadImage(d.coachImage);

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = BRAND.bg;
  ctx.fillRect(0, 0, W, H);
  const glowA = ctx.createRadialGradient(W * 0.85, 160, 0, W * 0.85, 160, 760);
  glowA.addColorStop(0, 'rgba(139,92,246,0.42)');
  glowA.addColorStop(1, 'rgba(139,92,246,0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, W, H);
  const glowB = ctx.createRadialGradient(0, H, 0, 0, H, 700);
  glowB.addColorStop(0, 'rgba(255,77,148,0.3)');
  glowB.addColorStop(1, 'rgba(255,77,148,0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, W, H);

  // Brand mark
  const tile = ctx.createLinearGradient(80, 80, 168, 168);
  tile.addColorStop(0, BRAND.primary);
  tile.addColorStop(1, BRAND.violet);
  ctx.fillStyle = tile;
  ctx.beginPath();
  ctx.roundRect(80, 80, 88, 88, 24);
  ctx.fill();
  ctx.save();
  ctx.translate(97, 97);
  ctx.scale(54 / 24, 54 / 24);
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const p of LOGO_PATHS) ctx.stroke(new Path2D(p));
  ctx.fill(new Path2D(LOGO_SPARK));
  ctx.restore();
  ctx.fillStyle = BRAND.ink;
  ctx.font = `46px ${display}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(APP_NAME_UPPER, 196, 126);

  // Coach portrait (top right)
  if (coach) {
    const x = 590;
    const y = 230;
    const s = 410;
    const frame = ctx.createLinearGradient(x, y, x + s, y + s);
    frame.addColorStop(0, d.coachColors[0]);
    frame.addColorStop(1, d.coachColors[1]);
    ctx.fillStyle = frame;
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 8, s + 16, s + 16, 44);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 38);
    ctx.clip();
    ctx.drawImage(coach, x, y, s, s);
    ctx.restore();
    ctx.fillStyle = BRAND.ink;
    ctx.font = `600 26px ${mono}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`COACH ${d.coachName.toUpperCase()}`, x, y + s + 52);
  }

  // Day counter
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = BRAND.gold;
  ctx.font = `600 30px ${mono}`;
  ctx.fillText(d.phase.toUpperCase(), 80, 300);
  ctx.fillStyle = BRAND.ink;
  ctx.font = `300px ${display}`;
  ctx.fillText(String(d.day), 68, 620);
  ctx.fillStyle = BRAND.faint;
  ctx.font = `600 36px ${mono}`;
  ctx.fillText(`DAY ${d.day} OF ${d.totalDays}`, 80, 700);

  // Year progress bar
  const barY = 760;
  ctx.fillStyle = BRAND.line;
  ctx.beginPath();
  ctx.roundRect(80, barY, W - 160, 18, 9);
  ctx.fill();
  const bar = ctx.createLinearGradient(80, 0, W - 80, 0);
  bar.addColorStop(0, BRAND.primary);
  bar.addColorStop(1, BRAND.violet);
  ctx.fillStyle = bar;
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
  stats.forEach((st, i) => {
    const x = 80 + i * colW;
    ctx.fillStyle = BRAND.surface;
    ctx.beginPath();
    ctx.roundRect(x + (i === 0 ? 0 : 12), 860, colW - 12, 210, 24);
    ctx.fill();
    ctx.fillStyle = BRAND.ink;
    ctx.font = `100px ${display}`;
    ctx.fillText(st.value, x + 40, 990);
    ctx.fillStyle = BRAND.faint;
    ctx.font = `600 24px ${mono}`;
    ctx.fillText(st.label, x + 40, 1040);
  });

  ctx.fillStyle = BRAND.muted;
  ctx.font = `500 32px ${body}`;
  ctx.fillText('My real-life training arc · free anime workouts', 80, 1200);
  ctx.fillStyle = BRAND.primary;
  ctx.font = `600 28px ${mono}`;
  ctx.fillText('#LevelUpDojo', 80, 1260);

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
    const coach = getCoach(settings.coachId);
    return {
      day: today.dayNumber,
      totalDays,
      phase: `Phase ${phase.id} · ${phase.name}`,
      streak,
      workouts: workoutsCompleted,
      extraLabel,
      extraValue,
      coachImage: coach.image,
      coachName: coach.name,
      coachColors: coach.colors,
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
      await navigator.share({ files: [preview.file], title: `My ${APP_NAME} progress` });
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
