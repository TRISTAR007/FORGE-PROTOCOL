'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/** Saves the language in a cookie (read by the server on every request) and re-renders. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LanguageSwitcher({ compact, className }: { compact?: boolean; className?: string }) {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn('relative inline-flex items-center gap-1.5 text-sm text-ink-muted', pending && 'opacity-60', className)}>
      <Globe size={15} className="shrink-0" />
      {compact ? <span className="sr-only">{t('language')}</span> : <span>{t('language')}</span>}
      <select
        value={locale}
        aria-label={t('language')}
        onChange={(e) => {
          setLocaleCookie(e.target.value as Locale);
          startTransition(() => router.refresh());
        }}
        className="rounded-sm border border-line bg-bg py-1.5 pe-7 ps-2 text-sm text-ink focus:border-forge focus:outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
