'use client';

import { useTranslations } from 'next-intl';

export function OrDivider() {
  const t = useTranslations('auth');
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-line" />
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{t('or')}</span>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
