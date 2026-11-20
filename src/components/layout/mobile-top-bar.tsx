'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brand/brand-mark';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { BeltBadge } from '@/components/community/belt-badge';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { getCoach } from '@/lib/coaches';

export function MobileTopBar({ onAvatarClick }: { onAvatarClick: () => void }) {
  const { settings } = useProgress();
  const { level } = useTrainingStats();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur lg:hidden">
      <Link href="/dashboard" aria-label="Home">
        <BrandMark size={30} textClassName="text-base" />
      </Link>
      <button onClick={onAvatarClick} aria-label="Open menu" className="flex items-center gap-2">
        <BeltBadge level={level.level} compact />
        <CoachAvatar coach={getCoach(settings.coachId)} size={32} />
      </button>
    </header>
  );
}
