import { memo } from 'react';
import { CoachAvatar, CoachPortrait } from '@/components/coach/coach-portrait';
import { HeroAvatar } from '@/components/hero/hero-avatar';
import { sanitizeAvatar } from '@/lib/avatar';
import { getCoach } from '@/lib/coaches';
import { rankForLevel } from '@/lib/program/levels';

/** A member's picture: their own hero avatar when they have one, otherwise their chosen coach. */
export const ProfileAvatar = memo(function ProfileAvatar({
  profile,
  size = 36,
  large,
  className,
}: {
  profile: { avatar?: unknown; avatar_coach: string; level?: number };
  size?: number;
  /** Use the big animated coach portrait as the fallback (profile cards). */
  large?: boolean;
  className?: string;
}) {
  if (profile.avatar) {
    const ring = profile.level ? rankForLevel(profile.level).color : undefined;
    return <HeroAvatar avatar={sanitizeAvatar(profile.avatar)} size={size} ring={ring} className={className} />;
  }
  const coach = getCoach(profile.avatar_coach);
  return large ? (
    <CoachPortrait coach={coach} size={size} mood="idle" className={className} />
  ) : (
    <CoachAvatar coach={coach} size={size} className={className} />
  );
});
