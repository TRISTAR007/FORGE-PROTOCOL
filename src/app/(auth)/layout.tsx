import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/brand/brand-mark';
import { CoachPortrait } from '@/components/coach/coach-portrait';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { COACHES } from '@/lib/coaches';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth');

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mb-10 flex items-center justify-between gap-3">
          <Link href="/" aria-label="Home">
            <BrandMark size={36} textClassName="text-lg" />
          </Link>
          <LanguageSwitcher compact />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(255,77,148,0.28), transparent 45%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.28), transparent 50%)',
          }}
        />
        <div aria-hidden className="speed-lines absolute left-1/2 top-1/3 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="relative flex h-full flex-col justify-between p-14">
          <div className="grid grid-cols-4 gap-4 self-center">
            {COACHES.map((c, i) => (
              <CoachPortrait key={c.id} coach={c} size={104} mood={i % 3 === 0 ? 'idle' : 'still'} className={i % 2 ? 'mt-8' : ''} />
            ))}
          </div>
          <div>
            <h2 className="max-w-md text-balance font-display text-4xl leading-[1.05] tracking-wide text-ink">{t('sideTitle')}</h2>
            <p className="mt-4 max-w-sm text-sm text-ink-muted">{t('sideBody')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
