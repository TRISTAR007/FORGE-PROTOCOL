'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-forge text-bg font-semibold hover:bg-forge-hover active:scale-[0.98] shadow-[0_0_0_1px_rgba(255,106,43,0.15)]',
  secondary: 'bg-surface-raised text-ink border border-line hover:bg-surface-hover active:scale-[0.98]',
  outline: 'bg-transparent text-ink border border-line hover:border-forge/60 hover:text-forge active:scale-[0.98]',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface active:scale-[0.98]',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-sm gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-sm gap-2',
  lg: 'text-base px-6 py-3.5 rounded-md gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-body font-semibold transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? <Spinner size={16} /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
