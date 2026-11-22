import { DEFAULT_AVATAR, type AvatarConfig } from '@/lib/types';
import { RANKS, type Rank } from '@/lib/program/levels';

/**
 * The person's own hero avatar: an original chibi-style bust drawn in SVG
 * (see components/hero/hero-avatar). Parts unlock as you train — levels,
 * ranks, beaten Arc bosses and finished quests.
 */

export type AvatarSlot = keyof AvatarConfig;

export type UnlockRule =
  | { level: number }
  | { rank: Rank['id'] }
  | { bosses: number }
  | { quests: number }
  | { clears: number };

export interface AvatarItem {
  id: string;
  /** Swatch color (colors) or preview tint. */
  color?: string;
  unlock?: UnlockRule;
}

export const SKIN_TONES: AvatarItem[] = [
  { id: 'tone1', color: '#FFE3D1' },
  { id: 'tone2', color: '#F6CBA8' },
  { id: 'tone3', color: '#E3A879' },
  { id: 'tone4', color: '#C68652' },
  { id: 'tone5', color: '#8D5A35' },
  { id: 'tone6', color: '#5C3A22' },
];

export const EYE_COLORS: AvatarItem[] = [
  { id: 'amber', color: '#F59E0B' },
  { id: 'brown', color: '#7C4A1E' },
  { id: 'blue', color: '#3B82F6' },
  { id: 'green', color: '#22C55E' },
  { id: 'violet', color: '#8B5CF6', unlock: { level: 5 } },
  { id: 'crimson', color: '#EF4444', unlock: { rank: 'C' } },
  { id: 'gold', color: '#FFC94A', unlock: { rank: 'S' } },
];

export const HAIR_STYLES: AvatarItem[] = [
  { id: 'spiky' },
  { id: 'short' },
  { id: 'long' },
  { id: 'ponytail' },
  { id: 'bun' },
  { id: 'buzz' },
  { id: 'wild', unlock: { level: 10 } },
  { id: 'twin', unlock: { level: 12 } },
  { id: 'crest', unlock: { rank: 'A' } },
];

export const HAIR_COLORS: AvatarItem[] = [
  { id: 'black', color: '#1F1B2E' },
  { id: 'brown', color: '#5B3A24' },
  { id: 'blonde', color: '#F2C36B' },
  { id: 'ginger', color: '#C2410C' },
  { id: 'blue', color: '#3B82F6', unlock: { level: 5 } },
  { id: 'pink', color: '#FF4D94', unlock: { level: 5 } },
  { id: 'silver', color: '#D7DCE6', unlock: { level: 8 } },
  { id: 'violet', color: '#8B5CF6', unlock: { quests: 20 } },
  { id: 'flame', color: '#FF7A1A', unlock: { rank: 'S' } },
];

export const OUTFITS: AvatarItem[] = [
  { id: 'gi' },
  { id: 'tank' },
  { id: 'hoodie' },
  { id: 'track', unlock: { level: 4 } },
  { id: 'raider', unlock: { clears: 10 } },
  { id: 'battle', unlock: { bosses: 1 } },
  { id: 'champion', unlock: { rank: 'S' } },
];

export const OUTFIT_COLORS: AvatarItem[] = [
  { id: 'crimson', color: '#E11D48' },
  { id: 'midnight', color: '#27235C' },
  { id: 'snow', color: '#E8ECF4' },
  { id: 'forest', color: '#15803D' },
  { id: 'ocean', color: '#0369A1' },
  { id: 'violet', color: '#6D28D9', unlock: { level: 6 } },
  { id: 'gold', color: '#CA8A04', unlock: { rank: 'B' } },
];

export const HEADGEAR: AvatarItem[] = [
  { id: 'none' },
  { id: 'cap' },
  { id: 'band', unlock: { level: 3 } },
  { id: 'neko', unlock: { quests: 25 } },
  { id: 'horns', unlock: { bosses: 2 } },
  { id: 'crown', unlock: { rank: 'SS' } },
];

export const AURAS: AvatarItem[] = [
  { id: 'none' },
  { id: 'ember', color: '#FF7A1A', unlock: { level: 6 } },
  { id: 'sakura', color: '#F9A8D4', unlock: { clears: 7 } },
  { id: 'frost', color: '#7DD3FC', unlock: { bosses: 1 } },
  { id: 'storm', color: '#FFD84A', unlock: { rank: 'A' } },
  { id: 'void', color: '#8B5CF6', unlock: { bosses: 3 } },
  { id: 'solar', color: '#FFC94A', unlock: { rank: 'SSS' } },
];

export const ACCESSORIES: AvatarItem[] = [
  { id: 'none' },
  { id: 'towel' },
  { id: 'headphones', unlock: { level: 2 } },
  { id: 'scarf', unlock: { clears: 5 } },
  { id: 'dumbbell', unlock: { level: 7 } },
  { id: 'medal', unlock: { bosses: 1 } },
];

export const AVATAR_SLOTS: { slot: AvatarSlot; items: AvatarItem[]; swatch: boolean }[] = [
  { slot: 'hair', items: HAIR_STYLES, swatch: false },
  { slot: 'hairColor', items: HAIR_COLORS, swatch: true },
  { slot: 'eyes', items: EYE_COLORS, swatch: true },
  { slot: 'skin', items: SKIN_TONES, swatch: true },
  { slot: 'outfit', items: OUTFITS, swatch: false },
  { slot: 'outfitColor', items: OUTFIT_COLORS, swatch: true },
  { slot: 'headgear', items: HEADGEAR, swatch: false },
  { slot: 'aura', items: AURAS, swatch: false },
  { slot: 'accessory', items: ACCESSORIES, swatch: false },
];

export interface UnlockContext {
  level: number;
  bosses: number;
  quests: number;
  clears: number;
}

function rankIndex(id: Rank['id']): number {
  return RANKS.findIndex((r) => r.id === id);
}

export function isUnlocked(rule: UnlockRule | undefined, ctx: UnlockContext): boolean {
  if (!rule) return true;
  if ('level' in rule) return ctx.level >= rule.level;
  if ('rank' in rule) return ctx.level >= RANKS[rankIndex(rule.rank)].minLevel;
  if ('bosses' in rule) return ctx.bosses >= rule.bosses;
  if ('quests' in rule) return ctx.quests >= rule.quests;
  return ctx.clears >= rule.clears;
}

const ITEMS_BY_SLOT = Object.fromEntries(AVATAR_SLOTS.map((s) => [s.slot, s.items])) as Record<AvatarSlot, AvatarItem[]>;

export function colorOf(slot: AvatarSlot, id: string): string {
  const items = ITEMS_BY_SLOT[slot];
  return (items.find((i) => i.id === id) ?? items[0]).color ?? '#888';
}

/** Drops unknown ids (e.g. from another device or a tampered profile) back to defaults. */
export function sanitizeAvatar(raw: unknown): AvatarConfig {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<AvatarSlot, unknown>>;
  const out = { ...DEFAULT_AVATAR };
  for (const { slot, items } of AVATAR_SLOTS) {
    const value = input[slot];
    if (typeof value === 'string' && items.some((i) => i.id === value)) out[slot] = value;
  }
  return out;
}

/** Number of avatar parts unlocked so far, and how many exist. */
export function unlockCount(ctx: UnlockContext): { unlocked: number; total: number } {
  let unlocked = 0;
  let total = 0;
  for (const { items } of AVATAR_SLOTS) {
    for (const item of items) {
      total++;
      if (isUnlocked(item.unlock, ctx)) unlocked++;
    }
  }
  return { unlocked, total };
}
