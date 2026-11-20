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
-- Done. Every new signup gets its own profile + progress row, and RLS
-- guarantees no user can ever read or write another user's data.
-- ---------------------------------------------------------------------
