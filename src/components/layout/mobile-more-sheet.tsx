'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { initials } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { MOBILE_MORE } from './nav-items';
import { SyncStatus } from './sync-status';

export function MobileMoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile, signOut, signingOut } = useAuth();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forge-dim font-mono text-sm font-bold text-forge">
            {initials(profile?.full_name, user.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{profile?.full_name || 'Athlete'}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
        </div>
        <div className="pt-3">
          <SyncStatus />
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
              {item.label}
            </Link>
          ))}
          <button
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger-dim disabled:opacity-50"
          >
            <LogOut size={18} />
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
