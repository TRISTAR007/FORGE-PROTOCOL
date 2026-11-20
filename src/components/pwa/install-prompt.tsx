'use client';

import { useTranslations } from 'next-intl';

import { Download, Share, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorageValue } from '@/hooks/use-local-storage';
import { promptInstall, useInstallState } from '@/lib/pwa-install';

/** Invites the person to install the app to their home screen (shown only when it's possible). */
export function InstallPrompt() {
  const t = useTranslations('install');
  const state = useInstallState();
  const [dismissed, setDismissed] = useLocalStorageValue('forge:install-dismissed');

  if (dismissed || state === 'installed' || state === 'unavailable') return null;

  return (
    <div className="relative flex flex-col gap-3 rounded-md border border-line bg-surface p-4 pe-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-forge-dim text-forge">
          <Smartphone size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{t('title')}</p>
          {state === 'ios' ? (
            <p className="mt-0.5 text-sm text-ink-muted">
              <Share size={13} className="me-1 inline align-[-2px]" />
              {t('iosBody')}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-ink-muted">{t('body')}</p>
          )}
        </div>
      </div>
      {state === 'prompt' ? (
        <Button size="sm" onClick={() => void promptInstall()} className="shrink-0 self-start sm:self-center">
          <Download size={14} /> {t('button')}
        </Button>
      ) : null}
      <button
        onClick={() => setDismissed('1')}
        aria-label="Dismiss"
        className="absolute end-2 top-2 rounded-xs p-1.5 text-ink-faint hover:bg-surface-hover hover:text-ink"
      >
        <X size={14} />
      </button>
    </div>
  );
}
