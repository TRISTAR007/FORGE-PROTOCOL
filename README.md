# Level Up Dojo

**Free anime-style workouts, coaches and community — for anime fans and everyone else.**

A 365-day home and gym training app guided by an original cast of anime-style coaches, with voice coaching, XP and belts, 30-day Training Arcs, nutrition for six world regions, a live community, 12 languages, and Android / iOS apps.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth, Postgres, Storage, Realtime) · next-intl · Capacitor 8
- **Auth:** Email/password + "Continue with Google", via Supabase Auth
- **Data:** Every user's data is protected by Postgres Row Level Security — nobody can read or write another user's private data, even if the frontend were compromised.

---

## What's inside

**Coaches** — eight original characters (Kaito, Sensei Ren, Mika, Ryu, Aiko, Zara, Leo, Nova) plus Mochi the mascot. Each has a specialty, a personality, their own lines for every moment of a workout, and a voice profile (pitch, pace, gender) for the browser's built-in speech engine. The coach greets you on the dashboard, talks you through guided sessions with animated reactions, and appears on your share cards. *All characters are original; no existing anime IP is used.*

**Training**
- A 365-day program in three versions — **Home (bodyweight)**, **Home (dumbbells)** and **Full gym** — across six phases that genuinely get harder.
- 136 exercises (bodyweight, cardio, mobility, dumbbell, kettlebell, band, barbell, pull-up bar, cable and machine) with instructions, muscles and filters.
- 31 **quick workouts** for any day, each led by a coach, filterable by equipment, length and focus.
- Six 30-day **Training Arcs** (push-ups, squats, plank, jumping jacks, grip, flexibility) that grow every day.
- A full-screen guided player: countdown ring, coach portrait + speech bubbles + voice, sound and haptic cues, rep logging, previous / +15s / pause, keyboard shortcuts, resume after interruption, personal records, "ready to progress" tips, confetti, and sharing to the community.

**Progress & motivation** — XP for everything you log, levels and belts (White Belt → Legend), a 365-day heatmap, 26 badges, personal bests, measurement and strength charts, private progress photos with a before/after slider, missed-day recovery, and a shareable progress card.

**Nutrition** — calorie and macro targets from your own stats, a protein tracker, swappable meals and a weekly shopping list, with meal plans for Global, West Africa, South Asia, East & Southeast Asia, Latin America and the Middle East & North Africa.

**Community** — public profiles (username, coach avatar, country, belt), eight live chat channels, replies, workout shares to #victories, a global and per-country leaderboard, reporting, blocking, moderators, bans, a database rate limit, automatic hiding of emails / phone numbers, and a 13+ age gate.

**Everywhere** — 12 languages (English, Spanish, Portuguese, French, German, Japanese, Korean, Chinese, Hindi, Indonesian, Arabic with right-to-left layout, Turkish), metric or imperial units, an installable offline-capable web app, and Android / iOS apps with native notifications, haptics and sharing.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- A free [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account, for deployment
- *(optional)* A [Google Cloud](https://console.cloud.google.com/) account for "Continue with Google"
- *(for the phone apps)* [Android Studio](https://developer.android.com/studio); for iOS, a Mac with Xcode

---

## 2. Create your Supabase project and database

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**. Save the database password.
2. **Settings → API**: copy the **Project URL** and **anon / public key**.
3. **SQL Editor → New query**: paste the whole of `supabase/schema.sql` and click **Run**. It creates:
   1. `profiles` and `user_progress` (private, owner-only)
   2. the signup trigger
   3. the private **`progress-photos`** storage bucket
   4. **`delete_own_account()`** for *Settings → Delete account*
   5. the **community**: `community_profiles`, `channels` (8 starter channels), `messages`, `message_reports`, `user_blocks`, `community_moderators`, `community_bans`, rate limiting and Realtime for live chat

The file is safe to re-run any time (`if not exists`, `on conflict do nothing`, `drop policy if exists`). **Upgrading an existing project? Run it again** — the new sections are added without touching existing data.

### Moderating the community

- **Make someone a moderator:** Table Editor → `community_moderators` → insert their user id (from Authentication → Users). Moderators can delete any message and read reports.
- **Review reports:** Table Editor → `message_reports`.
- **Ban someone:** insert their user id into `community_bans`. They can still read but can no longer post.

---

## 3. Google sign-in (optional)

1. Google Cloud Console → **APIs & Services → OAuth consent screen** → External → fill in app name and support email.
2. **Credentials → Create credentials → OAuth client ID** → Web application. Authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback` (shown in Supabase under **Authentication → Providers → Google**).
3. Paste the Client ID and Secret into Supabase → **Authentication → Providers → Google** and enable it.

---

## 4. Environment variables

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Set `NEXT_PUBLIC_SITE_URL` to your real domain in production — it's used for the Google redirect, social previews, the sitemap and calendar reminders.

---

## 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and pick your coach.

---

## 6. Deploy to Vercel

1. Import the GitHub repository at [vercel.com/new](https://vercel.com/new).
2. Add the three environment variables above (with your Vercel URL as `NEXT_PUBLIC_SITE_URL`).
3. Deploy.
4. In Supabase → **Authentication → URL Configuration**, add your URL to **Site URL** and **Redirect URLs** (e.g. `https://your-app.vercel.app/**`).

---

## 7. Android and iOS apps

The native apps (in `android/` and `ios/`) are a Capacitor shell that loads your deployed site, so every deploy updates the apps instantly. They add native daily notifications, haptics, the share sheet, the Android back button, a splash screen and app icons.

1. Deploy the site first (step 6).
2. Point the apps at it and sync:
   ```bash
   CAP_SERVER_URL=https://your-app.vercel.app npx cap sync
   ```
   (PowerShell: `$env:CAP_SERVER_URL="https://your-app.vercel.app"; npx cap sync`)
3. **Android:** `npx cap open android` → in Android Studio, **Build → Generate Signed App Bundle** → upload the `.aab` to Google Play Console ($25 one-time developer account).
4. **iOS (needs a Mac):** `npx cap open ios` → in Xcode, set your Team under *Signing & Capabilities*, then **Product → Archive** → upload to App Store Connect ($99/year Apple Developer Program).

Store listings need a privacy policy URL and screenshots. Apple reviews apps that load a website closely; the native notifications, haptics and sharing are there to help it pass, but approval isn't guaranteed.

To regenerate icons and splash screens after changing `assets/`:

```bash
npx capacitor-assets generate --android --ios
```

---

## Translations

- Text lives in `src/messages/<locale>.json`; `en.json` is the source of truth.
- The language comes from the user's choice (saved in a cookie) or their browser, and any missing key falls back to English.
- After editing `en.json`, update the other files and run:
  ```bash
  npm run check:i18n
  ```
  It reports missing keys, extra keys and mismatched `{placeholders}`.
- The current translations are first drafts. Have native speakers review them before a big launch.
- Exercise instructions, routine and coach descriptions, guides and meal plans are still English-only.

---

## Coach artwork

The coach portraits were AI-generated in the Figma file **"Level Up Dojo — Coach Art"**. Full-resolution originals are in `art/coaches/` (kept out of git); the web-optimized versions are in `public/images/coaches/`. To add a coach, generate a portrait in the same style, export a 768 px and a 160 px WebP, and add an entry to `src/lib/coaches.ts`.

---

## Development notes

- `npm run build` runs the TypeScript check and a full production build; `npx tsc --noEmit`, `npm run lint` and `npm run check:i18n` are quicker checks.
- The offline service worker (`public/sw.js`) only registers in production builds. Bump `VERSION` in it when you change caching rules.
- App icons, the manifest, `robots.txt`, `sitemap.xml` and the social image are generated from `src/app/`.

## How user data privacy is enforced

- Every table has Row Level Security. Private tables (`profiles`, `user_progress`) are owner-only; community tables expose only the public profile fields and messages to signed-in members.
- The Supabase anon key is safe to expose — it can only do what RLS allows. No service-role key is used anywhere.
- Progress photos are in a private bucket, served only through short-lived signed links to their owner.
- Deleting an account removes the auth user, which cascades to every row they own, including community messages; photos are removed through the Storage API first.
