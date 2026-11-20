import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-mark';
import { APP_NAME } from '@/lib/brand';
import en from '@/messages/en.json';

export const metadata: Metadata = { title: `Offline — ${APP_NAME}` };
// Pre-rendered at build time so the service worker can cache it; shown in English.
export const dynamic = 'force-static';

export default function OfflinePage() {
  const t = en.offline;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-ink">
      <BrandIcon size={48} />
      <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-ink-muted">
        <WifiOff size={26} />
      </div>
      <h1 className="mt-5 font-display text-3xl tracking-wide">{t.title}</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-muted">{t.body}</p>
      <a
        href="/dashboard"
        className="mt-8 rounded-md bg-brand-gradient px-6 py-3 font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
      >
        {t.retry}
      </a>
    </main>
  );
}
