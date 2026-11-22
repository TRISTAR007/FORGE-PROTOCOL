'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brand/brand-mark';
import { HeroAvatar } from '@/components/hero/hero-avatar';
import { BeltBadge } from '@/components/community/belt-badge';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';


export function MobileTopBar({ onAvatarClick }: { onAvatarClick: () => void }) {
  const { progress } = useProgress();
  const { level } = useTrainingStats();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/[0.97] px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden">
      <Link href="/dashboard" aria-label="Home">
        <BrandMark size={30} textClassName="text-base" />
      </Link>
      <button onClick={onAvatarClick} aria-label="Open menu" className="flex items-center gap-2">
        <BeltBadge level={level.level} compact />
        <HeroAvatar avatar={progress.avatar} size={32} ring={level.rank.color} />
      </button>
    </header>
  );
}
