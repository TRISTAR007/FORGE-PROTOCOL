'use client';

import { cn, parseDateKey } from '@/lib/utils';

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

function formatShort(dateStr: string): string {
  return parseDateKey(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TrendChart({
  points,
  label,
  unit = '',
  colorClassName = 'text-forge',
  higherIsBetter,
}: {
  points: TrendPoint[];
  label: string;
  unit?: string;
  colorClassName?: string;
  /** Omit when direction doesn't have an inherent "better" (e.g. weight, which depends on the person's own goal) — the delta is then shown neutrally rather than colored green/muted. */
  higherIsBetter?: boolean;
}) {
  if (points.length < 2) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line px-4 text-center">
        <p className="text-sm text-ink-muted">Not enough data yet for {label.toLowerCase()}.</p>
        <p className="text-xs text-ink-faint">Log it again later to start seeing the trend.</p>
      </div>
    );
  }

  const width = 600;
  const height = 160;
  const padding = 20;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xStep = (width - padding * 2) / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: padding + i * xStep,
    y: height - padding - ((p.value - min) / range) * (height - padding * 2),
    ...p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padding} L ${coords[0].x.toFixed(1)} ${height - padding} Z`;

  const delta = Math.round((points[points.length - 1].value - points[0].value) * 10) / 10;
  const improved = higherIsBetter === undefined ? null : higherIsBetter ? delta > 0 : delta < 0;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label} trend</p>
        {delta !== 0 ? (
          <span className={cn('font-mono text-xs', improved === null ? 'text-ink-muted' : improved ? 'text-ok' : 'text-ink-muted')}>
            {delta > 0 ? '+' : ''}
            {delta}
            {unit} since first log
          </span>
        ) : null}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" role="img" aria-label={`${label} trend chart`}>
        <path d={areaPath} className={colorClassName} fill="currentColor" opacity={0.08} stroke="none" />
        <path
          d={linePath}
          className={colorClassName}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle
            key={c.date}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 4 : 2.5}
            className={colorClassName}
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>{formatShort(points[0].date)}</span>
        <span>{formatShort(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}
