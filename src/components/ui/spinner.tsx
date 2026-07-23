import { cn } from '@/lib/utils';

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-sm bg-gradient-to-r from-surface-raised via-surface-hover to-surface-raised bg-[length:400px_100%]',
        className
      )}
    />
  );
}
