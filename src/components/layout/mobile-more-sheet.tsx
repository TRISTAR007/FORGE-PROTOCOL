'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { BeltBadge } from '@/components/community/belt-badge';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { getCoach } from '@/lib/coaches';
import { MOBILE_MORE } from './nav-items';
import { SyncStatus } from './sync-status';

export function MobileMoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('nav');
  const { user, profile, signOut, signingOut } = useAuth();
  const { settings } = useProgress();
  const { level } = useTrainingStats();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <CoachAvatar coach={getCoach(settings.coachId)} size={44} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{profile?.full_name || t('athlete')}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
            <BeltBadge level={level.level} className="mt-1" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-3">
          <SyncStatus />
          <LanguageSwitcher compact />
        </div>

        <div className="mt-3 space-y-1">
          {MOBILE_MORE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-sm px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
            >
              <item.icon size={18} />
              {t(item.key)}
            </Link>
          ))}
          <button
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger-dim disabled:opacity-50"
          >
            <LogOut size={18} className="rtl:-scale-x-100" />
            {signingOut ? t('signingOut') : t('signOut')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
