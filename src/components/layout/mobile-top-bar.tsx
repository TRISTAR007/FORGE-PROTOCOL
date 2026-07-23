'use client';

import { Flame } from 'lucide-react';
import { initials } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export function MobileTopBar({ onAvatarClick }: { onAvatarClick: () => void }) {
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-forge text-bg">
          <Flame size={16} strokeWidth={2.5} />
        </span>
        <span className="font-display text-base tracking-wide">FORGE</span>
      </div>
      <button
        onClick={onAvatarClick}
        aria-label="Open menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-forge-dim font-mono text-[11px] font-bold text-forge"
      >
        {initials(profile?.full_name, user.email)}
      </button>
    </header>
  );
}
