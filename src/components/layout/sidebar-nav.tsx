'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, LogOut } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';
import { useAuth } from '@/context/auth-context';
import { SyncStatus } from './sync-status';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, profile, signOut, signingOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-forge text-bg">
          <Flame size={18} strokeWidth={2.5} />
        </span>
        <span className="font-display text-lg tracking-wide">FORGE PROTOCOL</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-forge-dim text-forge'
                  : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center justify-between px-3 pb-1">
          <SyncStatus />
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors hover:bg-surface-hover"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forge-dim font-mono text-xs font-bold text-forge">
            {initials(profile?.full_name, user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">{profile?.full_name || 'Athlete'}</span>
            <span className="block truncate text-xs text-ink-faint">{user.email}</span>
          </span>
        </Link>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-danger disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
