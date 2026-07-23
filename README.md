# FORGE Protocol

A 365-day home bodyweight training, nutrition, and habit-tracking app — built by merging two prior prototypes (**Toji Protocol** and **GLOWUP APP**) into one production-quality product with real authentication and per-user cloud data.

- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + Postgres)
- **Auth:** Email/password + "Continue with Google", via Supabase Auth
- **Data:** Every user's progress lives in its own row, protected by Postgres Row Level Security — nobody can ever read or write another user's data, even if the frontend were compromised.

---

## What's inside

- A real 365-day program: a 7-day rotating split (Push / Pull / Legs / Core / HIIT / Recovery / Rest) that genuinely progresses through 6 macro phases (beginner → intermediate → advanced exercise tiers), instead of repeating one week's data 52 times.
- A 34-exercise library with photos, muscles worked, and step-by-step instructions.
- A full-screen **guided workout session player** with an animated countdown ring for timed holds and rest periods.
- A Nigerian-market nutrition plan: daily macro targets, a sample meal plan, and a weekly shopping list with estimated costs.
- Progress tracking: body measurements, strength tests, a habit calendar, hydration, and daily non-negotiables — all synced to your account.
- Reference guides: posture correction, mobility routines, recovery/sleep, training science, and a simple skin routine.
- Responsive design: a sidebar on desktop, a bottom tab bar on mobile.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or newer
- A free [Supabase](https://supabase.com) account
- A [Google Cloud](https://console.cloud.google.com/) account (only needed for "Continue with Google")
- A [Vercel](https://vercel.com) account, for deployment

---

## 2. Create your Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick a name, a database password (save it somewhere safe), and a region close to you.
3. Once the project is ready, open **Settings → API**. You'll need two values in a moment:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon / public key**

### Run the database schema

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, copy its entire contents, paste it into the editor, and click **Run**.
3. This creates the `profiles` and `user_progress` tables, enables Row Level Security, and sets up a trigger so every new signup automatically gets its own empty progress record.

You can re-run this file safely at any time — it uses `create table if not exists` and `drop policy if exists` guards.

---

## 3. Set up Google OAuth (optional, for "Continue with Google")

You can skip this section and use email/password only — the app works fully without it.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
2. Go to **APIs & Services → OAuth consent screen**. Choose **External**, fill in the required fields (app name, support email), and save.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback` (use your actual Supabase project URL — find it in Supabase under **Authentication → Providers → Google**, it's shown there).
4. Click **Create**. Copy the **Client ID** and **Client Secret**.
5. In Supabase, go to **Authentication → Providers → Google**, toggle it on, and paste in the Client ID and Client Secret. Save.

That's it — no Google credentials go into your app's own environment variables; Supabase handles the OAuth exchange for you.

---

## 4. Configure environment variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the values from Supabase's **Settings → API** page:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   `NEXT_PUBLIC_SITE_URL` is used to build the Google OAuth redirect link — keep it as `http://localhost:3000` for local dev, and set it to your real domain once deployed (see step 6).

---

## 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, and you should land on Day 1 of the program.

**Verify it's working:**
- Sign up with a second, different account (or an incognito window) — it should start completely fresh, with none of the first account's progress.
- Log out and back in on the first account — your progress should still be there.
- In the Supabase dashboard, check **Table Editor → user_progress** — you should see one row per account.

---

## 6. Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import that repository.
3. Vercel will auto-detect Next.js — no build configuration changes needed.
4. Before deploying, add the environment variables (**Project Settings → Environment Variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → set this to your Vercel URL, e.g. `https://your-app.vercel.app`
5. Deploy.
6. Back in Supabase, go to **Authentication → URL Configuration** and add your Vercel URL to both **Site URL** and **Redirect URLs** (e.g. `https://your-app.vercel.app/**`). This is required for Google OAuth and email confirmation links to redirect correctly in production.

Once deployed, repeat the two-account check from step 5 against your live URL.

---

## Project structure

```
src/
  app/
    (auth)/login, (auth)/signup      — public auth pages
    auth/callback                    — OAuth code exchange route
    (app)/                           — protected app (requires login)
      dashboard, workout, exercises,
      nutrition, progress, resources,
      settings
    page.tsx                         — public landing page
  components/
    ui/          — design system primitives (Button, Card, Modal, …)
    layout/      — sidebar, mobile nav, app shell
    auth/        — login/signup forms, Google button
    workout/     — day selector, exercise list, session player
    exercises/   — exercise grid + detail modal
    dashboard/   — dashboard widgets
    progress/    — measurements, strength test, habit calendar
  context/
    auth-context.tsx      — current user/profile + sign out
    progress-context.tsx  — cloud-synced tracking data (replaces localStorage)
  lib/
    program/     — the 365-day program, exercise library, nutrition, resources data
    supabase/    — browser/server Supabase clients + middleware session helper
    types.ts, utils.ts
  middleware.ts  — session refresh + route protection
supabase/
  schema.sql     — full database schema, RLS policies, and signup trigger
```

## How user data privacy is enforced

- Every table (`profiles`, `user_progress`) has Row Level Security enabled with policies that check `auth.uid()` against the row's owner — this is enforced by Postgres itself, not just app code.
- The Supabase **anon key** is safe to expose in the browser (it's designed to be public) — it can only do what RLS allows, which is "read/write your own rows."
- No service-role key or other secret is used anywhere in this project, so there is nothing sensitive to leak.
- A new signup gets an empty `user_progress` row via a database trigger, before the app ever loads — there's no window where a new account could see stale or shared data.

## A note on this build environment

This project was generated in a sandboxed environment without npm registry access, so `npm install` / `npm run build` could not be executed here to produce a live compiled verification. Every file was hand-written and cross-checked (import resolution, export/import matching, Tailwind token usage, hook usage, and exercise/image reference integrity were all verified programmatically). Please run `npm install && npm run build` as your first step after extracting — if anything surfaces, it's most likely a dependency version nuance rather than a structural issue, and should be a quick fix.
