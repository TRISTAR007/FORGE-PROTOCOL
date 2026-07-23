import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-dim text-danger">
        <AlertTriangle size={24} />
      </div>
      <h1 className="font-display text-2xl tracking-wide">Sign-in link expired</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        That sign-in link is invalid or has expired. Please try signing in again.
      </p>
      <Link href="/login">
        <Button size="lg">Back to Sign In</Button>
      </Link>
    </div>
  );
}
