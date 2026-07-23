import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-ink-muted">
        <Compass size={22} />
      </div>
      <h1 className="font-display text-3xl tracking-wide">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/">
        <Button size="lg">Back to Home</Button>
      </Link>
    </div>
  );
}
