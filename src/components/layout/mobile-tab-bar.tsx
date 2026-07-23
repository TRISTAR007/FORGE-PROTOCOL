'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOBILE_PRIMARY } from './nav-items';

export function MobileTabBar({ onMoreClick, moreActive }: { onMoreClick: () => void; moreActive: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      {MOBILE_PRIMARY.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
              active ? 'text-forge' : 'text-ink-faint'
            )}
          >
            <item.icon size={20} strokeWidth={active ? 2.4 : 2} />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
          moreActive ? 'text-forge' : 'text-ink-faint'
        )}
      >
        <MoreHorizontal size={20} strokeWidth={moreActive ? 2.4 : 2} />
        More
      </button>
    </nav>
  );
}
