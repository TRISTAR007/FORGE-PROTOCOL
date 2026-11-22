export interface CommunityProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_coach: string;
  country: string | null;
  bio: string | null;
  favorite_show: string | null;
  xp: number;
  level: number;
  created_at: string;
  /** Added by schema section 8 — absent until that SQL has been run. */
  guild?: string | null;
  avatar?: unknown;
}

export interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
  locked: boolean;
}

export type MessageKind = 'text' | 'workout';

export interface WorkoutShareMeta {
  title: string;
  sets: number;
  minutes: number;
  reps: number;
  coachId: string;
}

export interface Message {
  id: number;
  channel_id: string;
  user_id: string;
  body: string;
  kind: MessageKind;
  meta: WorkoutShareMeta | null;
  reply_to: number | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export type ReportReason = 'harassment' | 'hate' | 'inappropriate' | 'personal' | 'spam' | 'other';

export const REPORT_REASONS: ReportReason[] = ['harassment', 'hate', 'inappropriate', 'personal', 'spam', 'other'];

export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
export const MAX_MESSAGE_LENGTH = 1000;
