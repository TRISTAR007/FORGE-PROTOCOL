'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-dim text-danger">
        <AlertTriangle size={22} />
      </div>
      <h1 className="font-display text-2xl tracking-wide">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        An unexpected error occurred. You can try again, or head back to the dashboard.
      </p>
      <Button size="lg" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
