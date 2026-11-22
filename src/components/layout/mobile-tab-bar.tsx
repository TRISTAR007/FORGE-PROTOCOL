'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOBILE_PRIMARY, isActivePath } from './nav-items';

export function MobileTabBar({ onMoreClick, moreActive }: { onMoreClick: () => void; moreActive: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-bg-raised pb-[env(safe-area-inset-bottom)] lg:hidden">
      {MOBILE_PRIMARY.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
              active ? 'text-forge' : 'text-ink-faint'
            )}
          >
            {active ? <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand-gradient" /> : null}
            <item.icon size={20} strokeWidth={active ? 2.4 : 2} />
            {t(item.key)}
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
          moreActive ? 'text-forge' : 'text-ink-faint'
        )}
      >
        <MoreHorizontal size={20} strokeWidth={moreActive ? 2.4 : 2} />
        {t('more')}
      </button>
    </nav>
  );
}
