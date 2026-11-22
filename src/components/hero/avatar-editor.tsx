'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { HeroAvatar } from './hero-avatar';
import { useProgress } from '@/context/progress-context';
import { AVATAR_SLOTS, isUnlocked, type AvatarSlot, type UnlockContext, type UnlockRule } from '@/lib/avatar';
import type { AvatarConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function unlockHint(t: ReturnType<typeof useTranslations>, rule: UnlockRule): string {
  if ('level' in rule) return t('unlock.level', { n: rule.level });
  if ('rank' in rule) return t('unlock.rank', { rank: rule.rank });
  if ('bosses' in rule) return t('unlock.bosses', { n: rule.bosses });
  if ('quests' in rule) return t('unlock.quests', { n: rule.quests });
  return t('unlock.clears', { n: rule.clears });
}

/** Pick hair, outfit, aura and more. Locked parts show what unlocks them. */
export function AvatarEditor({
  open,
  onClose,
  unlock,
  ring,
}: {
  open: boolean;
  onClose: () => void;
  unlock: UnlockContext;
  ring: string;
}) {
  const t = useTranslations('avatar');
  const { progress, updateAvatar } = useProgress();
  const [slot, setSlot] = useState<AvatarSlot>('hair');
  const [draft, setDraft] = useState<AvatarConfig>(progress.avatar);
  const current = AVATAR_SLOTS.find((s) => s.slot === slot)!;

  const save = () => {
    updateAvatar(draft);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('title')} size="lg">
      <div className="flex flex-col items-center gap-2">
        <HeroAvatar avatar={draft} size={132} ring={ring} title={t('title')} />
      </div>

      <div role="tablist" className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {AVATAR_SLOTS.map((s) => (
          <button
            key={s.slot}
            role="tab"
            aria-selected={slot === s.slot}
            onClick={() => setSlot(s.slot)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              slot === s.slot ? 'bg-brand-gradient text-white' : 'bg-surface text-ink-muted hover:text-ink'
            )}
          >
            {t(`slots.${s.slot}`)}
          </button>
        ))}
      </div>

      <div className={cn('mt-3 grid gap-2', current.swatch ? 'grid-cols-5 sm:grid-cols-7' : 'grid-cols-3 sm:grid-cols-5')}>
        {current.items.map((item) => {
          const unlocked = isUnlocked(item.unlock, unlock);
          const selected = draft[slot] === item.id;
          const preview = { ...draft, [slot]: item.id };
          return (
            <button
              key={item.id}
              type="button"
              disabled={!unlocked}
              onClick={() => setDraft(preview)}
              aria-pressed={selected}
              title={!unlocked && item.unlock ? unlockHint(t, item.unlock) : t(`items.${item.id}`)}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-md border p-1.5 text-[11px] font-semibold transition-colors',
                selected ? 'border-forge bg-forge-dim/50' : 'border-line hover:bg-surface',
                !unlocked && 'cursor-not-allowed opacity-60'
              )}
            >
              {current.swatch ? (
                <span className="h-9 w-9 rounded-full border border-white/20" style={{ background: item.color }} />
              ) : (
                <HeroAvatar avatar={preview} size={56} />
              )}
              <span className="w-full truncate text-center">{t(`items.${item.id}`)}</span>
              {!unlocked ? (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-md bg-bg/70 px-1 text-center text-[10px] leading-tight text-ink-muted">
                  <Lock size={14} />
                  {item.unlock ? unlockHint(t, item.unlock) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button className="flex-1 bg-brand-gradient text-white" onClick={save}>
          {t('save')}
        </Button>
      </div>
    </Modal>
  );
}
