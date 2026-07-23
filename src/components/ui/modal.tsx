'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'max-h-[90vh] w-full overflow-y-auto rounded-t-lg border border-line bg-surface-raised shadow-raised animate-scaleIn sm:rounded-lg',
          widths[size]
        )}
      >
        {title ? (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface-raised px-5 py-4">
            <h2 className="font-display text-xl tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-xs p-1.5 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-xs bg-surface/80 p-1.5 text-ink-muted backdrop-blur transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
        <div className={title ? 'p-5' : ''}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
