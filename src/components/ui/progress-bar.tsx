import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  className,
  trackClassName,
  fillClassName,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-raised', trackClassName, className)}>
      <div
        className={cn('h-full rounded-full bg-forge transition-[width] duration-500 ease-out', fillClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
