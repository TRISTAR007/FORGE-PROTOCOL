'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, isActivePath } from './nav-items';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { BrandMark } from '@/components/brand/brand-mark';
import { HeroAvatar } from '@/components/hero/hero-avatar';
import { BeltBadge } from '@/components/community/belt-badge';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

import { SyncStatus } from './sync-status';

export function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { profile, signOut, signingOut } = useAuth();
  const { progress } = useProgress();
  const { level } = useTrainingStats();

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-line bg-bg-raised lg:flex">
      <Link href="/dashboard" className="px-5 py-6">
        <BrandMark size={38} textClassName="text-lg" />
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold transition-colors',
                active ? 'bg-forge-dim text-forge' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
              )}
            >
              {active ? <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-brand-gradient" /> : null}
              <item.icon size={18} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-line p-3">
        <div className="flex items-center justify-between gap-2 px-2">
          <SyncStatus />
          <LanguageSwitcher compact />
        </div>
        <Link
          href="/hero"
          className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-surface-hover"
        >
          <HeroAvatar avatar={progress.avatar} size={38} ring={level.rank.color} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">{profile?.full_name || t('athlete')}</span>
            <BeltBadge level={level.level} className="mt-0.5" />
          </span>
        </Link>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-danger disabled:opacity-50"
        >
          <LogOut size={16} className="rtl:-scale-x-100" />
          {signingOut ? t('signingOut') : t('signOut')}
        </button>
      </div>
    </aside>
  );
}
