import type { SupabaseClient } from '@supabase/supabase-js';
import type { Channel, CommunityProfile, Message, ReportReason, WorkoutShareMeta } from './types';

/** True when the error means the community tables haven't been created yet. */
export function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /relation .* does not exist|could not find the table/i.test(error.message ?? '')
  );
}

const PROFILE_COLUMNS = 'id, username, display_name, avatar_coach, country, bio, favorite_show, xp, level, created_at';

export async function getMyProfile(supabase: SupabaseClient, userId: string) {
  return supabase.from('community_profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle<CommunityProfile>();
}

export async function getProfiles(supabase: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return { data: [] as CommunityProfile[], error: null };
  return supabase.from('community_profiles').select(PROFILE_COLUMNS).in('id', ids).returns<CommunityProfile[]>();
}

export async function isUsernameTaken(supabase: SupabaseClient, username: string, exceptId?: string) {
  let query = supabase.from('community_profiles').select('id').ilike('username', username);
  if (exceptId) query = query.neq('id', exceptId);
  const { data } = await query.limit(1);
  return (data?.length ?? 0) > 0;
}

export interface ProfileInput {
  username: string;
  display_name: string | null;
  avatar_coach: string;
  country: string | null;
  bio: string | null;
  favorite_show: string | null;
}

export async function createProfile(supabase: SupabaseClient, userId: string, input: ProfileInput, xp: number, level: number) {
  return supabase
    .from('community_profiles')
    .insert({ id: userId, ...input, xp, level, rules_accepted_at: new Date().toISOString() })
    .select(PROFILE_COLUMNS)
    .single<CommunityProfile>();
}

export async function updateProfile(supabase: SupabaseClient, userId: string, input: Partial<ProfileInput>) {
  return supabase.from('community_profiles').update(input).eq('id', userId).select(PROFILE_COLUMNS).single<CommunityProfile>();
}

/** Keeps the public XP / level in step with the person's training. */
export async function syncXp(supabase: SupabaseClient, userId: string, xp: number, level: number) {
  return supabase.from('community_profiles').update({ xp, level }).eq('id', userId);
}

export async function listChannels(supabase: SupabaseClient) {
  return supabase.from('channels').select('id, slug, name, description, sort, locked').order('sort').returns<Channel[]>();
}

const MESSAGE_COLUMNS = 'id, channel_id, user_id, body, kind, meta, reply_to, created_at, edited_at, deleted_at';

/** Newest `limit` messages before `beforeId`, returned oldest-first. */
export async function fetchMessages(supabase: SupabaseClient, channelId: string, beforeId?: number, limit = 50) {
  let query = supabase.from('messages').select(MESSAGE_COLUMNS).eq('channel_id', channelId).order('id', { ascending: false }).limit(limit);
  if (beforeId) query = query.lt('id', beforeId);
  const { data, error } = await query.returns<Message[]>();
  return { data: (data ?? []).reverse(), error };
}

export async function sendMessage(
  supabase: SupabaseClient,
  userId: string,
  channelId: string,
  body: string,
  replyTo: number | null = null
) {
  return supabase
    .from('messages')
    .insert({ channel_id: channelId, user_id: userId, body, reply_to: replyTo, kind: 'text' })
    .select(MESSAGE_COLUMNS)
    .single<Message>();
}

/** Posts a finished workout to #victories. */
export async function shareWorkout(supabase: SupabaseClient, userId: string, meta: WorkoutShareMeta) {
  const { data: channel, error } = await supabase.from('channels').select('id').eq('slug', 'victories').maybeSingle<{ id: string }>();
  if (error || !channel) return { error: error ?? new Error('No #victories channel') };
  return supabase.from('messages').insert({ channel_id: channel.id, user_id: userId, body: '', kind: 'workout', meta });
}

/** Soft delete — keeps reply threads intact and lets moderators see what happened. */
export async function deleteMessage(supabase: SupabaseClient, messageId: number) {
  return supabase.from('messages').update({ deleted_at: new Date().toISOString(), body: '' }).eq('id', messageId);
}

export async function reportMessage(supabase: SupabaseClient, userId: string, messageId: number, reason: ReportReason) {
  return supabase.from('message_reports').insert({ message_id: messageId, reporter_id: userId, reason });
}

export async function listBlocks(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from('user_blocks').select('blocked_id').eq('blocker_id', userId);
  return new Set((data ?? []).map((r: { blocked_id: string }) => r.blocked_id));
}

export async function blockUser(supabase: SupabaseClient, userId: string, blockedId: string) {
  return supabase.from('user_blocks').insert({ blocker_id: userId, blocked_id: blockedId });
}

export async function unblockUser(supabase: SupabaseClient, userId: string, blockedId: string) {
  return supabase.from('user_blocks').delete().eq('blocker_id', userId).eq('blocked_id', blockedId);
}

export async function leaderboard(supabase: SupabaseClient, country?: string | null) {
  let query = supabase.from('community_profiles').select(PROFILE_COLUMNS).order('xp', { ascending: false }).limit(50);
  if (country) query = query.eq('country', country);
  return query.returns<CommunityProfile[]>();
}

/** Database error raised by the rate-limit trigger. */
export function isRateLimited(error: { message?: string } | null | undefined) {
  return !!error && /rate[_ ]limit/i.test(error.message ?? '');
}
