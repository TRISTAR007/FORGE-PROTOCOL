import type { Metadata } from 'next';
import { Flame, WifiOff } from 'lucide-react';

export const metadata: Metadata = { title: 'Offline — FORGE Protocol' };
export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center text-ink">
      <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-forge text-bg">
        <Flame size={24} strokeWidth={2.5} />
      </span>
      <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-ink-muted">
        <WifiOff size={26} />
      </div>
      <h1 className="mt-5 font-display text-3xl tracking-wide">You&apos;re offline</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-muted">
        This page hasn&apos;t been saved for offline use yet. Pages you&apos;ve opened before still work, and anything you
        log is kept on this device and syncs as soon as you&apos;re back online.
      </p>
      <a
        href="/dashboard"
        className="mt-8 rounded-md bg-forge px-6 py-3 font-semibold text-bg transition-colors hover:bg-forge-hover"
      >
        Try again
      </a>
    </main>
  );
}
