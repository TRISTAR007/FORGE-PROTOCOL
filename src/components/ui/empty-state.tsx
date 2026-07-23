import type { LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-ink-muted">
        <Icon size={22} />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-ink">{title}</p>
        {description ? <p className="max-w-xs text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
