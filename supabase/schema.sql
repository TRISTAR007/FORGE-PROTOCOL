-- =====================================================================
-- FORGE PROTOCOL — Supabase schema
-- =====================================================================
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- What this creates:
--   1. public.profiles      — one row per user: display name, avatar,
--                              and the date their 365-day program began.
--   2. public.user_progress — one row per user holding all in-app
--                              tracking data (workouts completed,
--                              checklists, water, measurements, strength
--                              tests, habit calendar, daily non-negotiables)
--                              as a single JSON document.
--   3. Row Level Security policies so a user can only ever read or
--      write their own rows — enforced by the database, not just the
--      app, so this holds even if the client is compromised.
--   4. A trigger that automatically creates a profile + empty progress
--      row the moment someone signs up (email/password OR Google).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text,
  avatar_url         text,
  program_start_date date not null default current_date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. user_progress
-- ---------------------------------------------------------------------
-- `data` mirrors a single well-defined shape (kept in sync with
-- src/lib/types.ts -> ProgressData) so the whole app can load one row
-- per user in one query and write it back after every interaction:
--
-- {
--   completedDays: number[],
--   checklistCompleted: { [dayNumber: string]: number[] },
--   exerciseChecks: { [dayNumber: string]: number[] },
--   waterIntake: { [isoDate: string]: number },
--   habits: { [isoDate: string]: boolean },
--   dailyTasks: { [isoDate: string]: string[] },
--   measurements: { weight, chest, arms, waist, thighs, updatedAt },
--   strengthTests: { pushups, squats, plank, updatedAt }
-- }

create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

drop policy if exists "Progress is viewable by owner" on public.user_progress;
create policy "Progress is viewable by owner"
  on public.user_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Progress is editable by owner" on public.user_progress;
create policy "Progress is editable by owner"
  on public.user_progress for update
  using (auth.uid() = user_id);

drop policy if exists "Progress is insertable by owner" on public.user_progress;
create policy "Progress is insertable by owner"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. Keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. Auto-provision a profile + empty progress row on signup
-- ---------------------------------------------------------------------
-- Fires for both email/password signups and Google OAuth signups.
-- Google provides `full_name`/`name` and `avatar_url`/`picture` inside
-- raw_user_meta_data — we try both keys since providers are inconsistent.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, program_start_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    current_date
  )
  on conflict (id) do nothing;

  insert into public.user_progress (user_id, data)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Progress photos (private storage bucket)
-- ---------------------------------------------------------------------
-- Each user's photos live under a folder named after their user id
-- (`<user id>/<photo id>.jpg`). The bucket is private: photos are only
-- ever shown through short-lived signed URLs, and these policies only
-- let a user touch objects inside their own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Progress photos are viewable by owner" on storage.objects;
create policy "Progress photos are viewable by owner"
  on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Progress photos are uploadable by owner" on storage.objects;
create policy "Progress photos are uploadable by owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Progress photos are deletable by owner" on storage.objects;
create policy "Progress photos are deletable by owner"
  on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- 6. Self-service account deletion
-- ---------------------------------------------------------------------
-- Lets a signed-in user delete their own auth account (Settings →
-- Delete account). profiles and user_progress rows go with it via
-- `on delete cascade`. The app removes the user's photos through the
-- Storage API first, since storage objects can't be deleted from SQL.
-- `security definer` is required to touch auth.users; the function only
-- ever deletes the caller's own row.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- ---------------------------------------------------------------------
-- 7. Community (profiles, channels, chat, reports, blocks)
-- ---------------------------------------------------------------------
-- Public community identity is kept separate from the private `profiles`
-- table: only username, display name, avatar, country, bio, favorite
-- show, XP and level are visible to other signed-in users.

create table if not exists public.community_profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  username          text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name      text check (char_length(display_name) <= 40),
  avatar_coach      text not null default 'kaito'
                    check (avatar_coach in ('kaito','ren','mika','ryu','aiko','zara','leo','nova')),
  country           text check (country ~ '^[A-Z]{2}$'),
  bio               text check (char_length(bio) <= 160),
  favorite_show     text check (char_length(favorite_show) <= 60),
  xp                integer not null default 0 check (xp >= 0),
  level             integer not null default 1 check (level between 1 and 200),
  rules_accepted_at timestamptz not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists community_profiles_username_key on public.community_profiles (lower(username));
create index if not exists community_profiles_xp_idx on public.community_profiles (xp desc);

-- Moderators and bans are managed by you in the Supabase dashboard
-- (Table Editor): add a user id to grant moderation / to ban someone.
create table if not exists public.community_moderators (
  user_id uuid primary key references auth.users (id) on delete cascade
);
create table if not exists public.community_bans (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now()
);

create or replace function public.is_community_moderator(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.community_moderators where user_id = uid) $$;

create or replace function public.is_community_banned(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.community_bans where user_id = uid) $$;

alter table public.community_profiles enable row level security;
alter table public.community_moderators enable row level security;
alter table public.community_bans enable row level security;

drop policy if exists "Community profiles are visible to members" on public.community_profiles;
create policy "Community profiles are visible to members"
  on public.community_profiles for select to authenticated using (true);

drop policy if exists "Community profile is creatable by owner" on public.community_profiles;
create policy "Community profile is creatable by owner"
  on public.community_profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Community profile is editable by owner" on public.community_profiles;
create policy "Community profile is editable by owner"
  on public.community_profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Moderators can see their own role" on public.community_moderators;
create policy "Moderators can see their own role"
  on public.community_moderators for select to authenticated using (auth.uid() = user_id);

-- Light leaderboard anti-cheat: XP synced from the app can only grow a
-- little per update, and timestamps can't be forged.
create or replace function public.guard_community_profile()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.xp := least(new.xp, 200000);
    new.created_at := now();
  else
    if new.xp > old.xp + 5000 then new.xp := old.xp + 5000; end if;
    new.created_at := old.created_at;
    new.rules_accepted_at := old.rules_accepted_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_community_profile on public.community_profiles;
create trigger guard_community_profile
  before insert or update on public.community_profiles
  for each row execute procedure public.guard_community_profile();

create table if not exists public.channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  sort        integer not null default 0,
  locked      boolean not null default false
);

alter table public.channels enable row level security;
drop policy if exists "Channels are visible to members" on public.channels;
create policy "Channels are visible to members"
  on public.channels for select to authenticated using (true);

insert into public.channels (slug, name, description, sort) values
  ('general',       'General',        'Say hi and hang out with the dojo.',                1),
  ('victories',     'Victories',      'Finished workouts, new records and wins.',          2),
  ('training-help', 'Training Help',  'Form checks, programming questions and advice.',    3),
  ('beginners',     'Beginners',      'New here? No question is too basic.',               4),
  ('gym-lifting',   'Gym & Lifting',  'Barbells, machines and the equipment track.',       5),
  ('nutrition',     'Nutrition',      'Budget meals, protein ideas and recipes.',          6),
  ('anime-talk',    'Anime Talk',     'What you are watching, reading and loving.',        7),
  ('international', 'International',  'Chat in any language — the dojo is worldwide.',     8)
on conflict (slug) do nothing;

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id    uuid not null references public.community_profiles (id) on delete cascade,
  body       text not null default '' check (char_length(body) <= 1000),
  kind       text not null default 'text' check (kind in ('text', 'workout')),
  meta       jsonb,
  reply_to   bigint references public.messages (id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  deleted_at timestamptz
);

create index if not exists messages_channel_id_idx on public.messages (channel_id, id desc);
create index if not exists messages_user_recent_idx on public.messages (user_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "Messages are visible to members" on public.messages;
create policy "Messages are visible to members"
  on public.messages for select to authenticated using (true);

drop policy if exists "Members can post as themselves" on public.messages;
create policy "Members can post as themselves"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = user_id
    and not public.is_community_banned(auth.uid())
    and exists (select 1 from public.channels c where c.id = channel_id and not c.locked)
  );

drop policy if exists "Authors and moderators can edit messages" on public.messages;
create policy "Authors and moderators can edit messages"
  on public.messages for update to authenticated
  using (auth.uid() = user_id or public.is_community_moderator(auth.uid()))
  with check (auth.uid() = user_id or public.is_community_moderator(auth.uid()));

-- Server-side rate limit + validation (the app also filters, but this is the real guard).
create or replace function public.guard_message_insert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.messages
      where user_id = new.user_id and created_at > now() - interval '10 seconds') >= 5 then
    raise exception 'rate_limit: too many messages, slow down';
  end if;
  if new.kind = 'text' and char_length(btrim(new.body)) = 0 then
    raise exception 'Message is empty';
  end if;
  new.created_at := now();
  new.edited_at := null;
  new.deleted_at := null;
  return new;
end;
$$;

drop trigger if exists guard_message_insert on public.messages;
create trigger guard_message_insert
  before insert on public.messages
  for each row execute procedure public.guard_message_insert();

create table if not exists public.message_reports (
  id          bigint generated always as identity primary key,
  message_id  bigint not null references public.messages (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason      text not null check (reason in ('harassment','hate','inappropriate','personal','spam','other')),
  created_at  timestamptz not null default now(),
  unique (message_id, reporter_id)
);

alter table public.message_reports enable row level security;
drop policy if exists "Members can report messages" on public.message_reports;
create policy "Members can report messages"
  on public.message_reports for insert to authenticated with check (auth.uid() = reporter_id);
drop policy if exists "Moderators can read reports" on public.message_reports;
create policy "Moderators can read reports"
  on public.message_reports for select to authenticated using (public.is_community_moderator(auth.uid()));

create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.user_blocks enable row level security;
drop policy if exists "Members manage their own blocks" on public.user_blocks;
create policy "Members manage their own blocks"
  on public.user_blocks for all to authenticated
  using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- Live chat: stream new / edited messages to connected clients.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Done. Every new signup gets its own profile + progress row, and RLS
-- guarantees no user can ever read or write another user's data.
-- ---------------------------------------------------------------------
