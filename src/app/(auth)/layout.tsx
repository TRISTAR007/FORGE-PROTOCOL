import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link href="/" className="mb-10 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-forge text-bg">
            <Flame size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl tracking-wide">FORGE PROTOCOL</span>
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(255,106,43,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(201,161,90,0.18), transparent 50%)',
          }}
        />
        <div className="relative flex h-full flex-col items-start justify-end p-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">Day 1 — Day 365</p>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.05] tracking-wide text-ink text-balance">
            No gym. No excuses. One year to forge a new body.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            Bodyweight training, budget-friendly nutrition, and daily habits — all tracked in one place, saved
            to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
