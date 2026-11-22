import type { SupabaseClient } from '@supabase/supabase-js';
import type { GuildId } from '@/lib/program/bosses';

export interface RaidGuildRow {
  guild: GuildId;
  damage: number;
  members: number;
}

export interface RaidTopRow {
  user_id: string;
  username: string;
  avatar_coach: string;
  avatar: unknown;
  country: string | null;
  guild: GuildId | null;
  damage: number;
}

export interface RaidSummary {
  week_start: string;
  hp: number;
  total: number;
  mine: number;
  guilds: RaidGuildRow[];
  top: RaidTopRow[];
}

/** Deals damage to this week's raid boss (server clamps and rate-limits it). Fire-and-forget. */
export async function raidHit(supabase: SupabaseClient, damage: number) {
  return supabase.rpc('raid_hit', { p_damage: Math.round(damage) });
}

export async function raidSummary(supabase: SupabaseClient) {
  return supabase.rpc('raid_summary').returns<RaidSummary>();
}

export async function joinGuild(supabase: SupabaseClient, userId: string, guild: GuildId) {
  return supabase.from('community_profiles').update({ guild }).eq('id', userId);
}
