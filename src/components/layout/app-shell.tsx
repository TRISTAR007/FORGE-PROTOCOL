'use client';

import { useState, type ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';
import { MobileTopBar } from './mobile-top-bar';
import { MobileTabBar } from './mobile-tab-bar';
import { MobileMoreSheet } from './mobile-more-sheet';
import { WelcomeModal } from '@/components/onboarding/welcome-modal';
import { MilestoneCelebration } from '@/components/dashboard/milestone-celebration';

export function AppShell({ children }: { children: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <WelcomeModal />
      <MilestoneCelebration />
      <SidebarNav />
      <MobileTopBar onAvatarClick={() => setMoreOpen(true)} />

      <main className="pb-24 lg:ml-64 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      <MobileTabBar onMoreClick={() => setMoreOpen(true)} moreActive={moreOpen} />
      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
