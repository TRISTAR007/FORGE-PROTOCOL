import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-sm border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint',
            'transition-colors focus:border-forge focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
