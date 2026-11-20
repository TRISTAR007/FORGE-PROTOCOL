import { APP_NAME_UPPER, LOGO_PATHS, LOGO_SPARK } from '@/lib/brand';
import { cn } from '@/lib/utils';

/** The logo tile on its own. */
export function BrandIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center bg-brand-gradient text-white shadow-glow', className)}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        {LOGO_PATHS.map((d) => (
          <path key={d} d={d} stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <path d={LOGO_SPARK} fill="currentColor" />
      </svg>
    </span>
  );
}

/** Logo tile + wordmark. */
export function BrandMark({
  size = 36,
  compact = false,
  className,
  textClassName,
}: {
  size?: number;
  /** Shows "DOJO" only — for tight spots like the mobile top bar. */
  compact?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <BrandIcon size={size} />
      <span className={cn('whitespace-nowrap font-display leading-none tracking-wide', textClassName)}>
        {compact ? (
          'DOJO'
        ) : (
          <>
            {APP_NAME_UPPER.replace(' DOJO', ' ')}
            <span className="text-gradient">DOJO</span>
          </>
        )}
      </span>
    </span>
  );
}
