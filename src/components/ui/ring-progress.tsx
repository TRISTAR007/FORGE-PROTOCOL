import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function RingProgress({
  value,
  size = 120,
  stroke = 10,
  colorClassName = 'text-forge',
  trackClassName = 'text-surface-raised',
  children,
  className,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  colorClassName?: string;
  trackClassName?: string;
  children?: ReactNode;
  className?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          className={trackClassName}
          stroke="currentColor"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          className={cn(colorClassName, 'transition-[stroke-dashoffset] duration-500 ease-out')}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
