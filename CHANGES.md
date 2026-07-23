# Fixes applied

## 1. Critical bug — `cookies()` must be awaited (Next.js 16)
Next.js 15+ made `cookies()` async. `src/lib/supabase/server.ts` was calling it
synchronously, which crashed the landing page, the entire protected app layout,
and the OAuth callback route (`TypeError: cookieStore.get is not a function`,
confirmed via `tsc --noEmit` — 3 errors, all here).

**Fixed:** `createClient()` is now `async` and awaits `cookies()`. The three
call sites (`src/app/page.tsx`, `src/app/(app)/layout.tsx`,
`src/app/auth/callback/route.ts`) now `await createClient()`.
`tsc --noEmit` now reports 0 errors project-wide.

## 2. Duplicated code
- **Tone-mapping object** (`{ beginner: 'ok', intermediate: 'brass', advanced: 'forge' }`)
  was defined three times under two names (`DIFFICULTY_TONE` in
  `exercise-grid.tsx` and `exercise-modal.tsx`, `INTENSITY_TONE` in
  `workout-hero.tsx`). Consolidated into one `DIFFICULTY_TONE` export in
  `src/lib/utils.ts`; all three components now import it.
- **"or" divider** between Google sign-in and the email form was identical
  markup in `login-form.tsx` and `signup-form.tsx`. Extracted to
  `src/components/auth/or-divider.tsx`.
- **Error message block** was identical in both auth forms. Extracted to
  `src/components/ui/form-error.tsx`.
- **Button's loading spinner** reimplemented the same styling as the shared
  `Spinner` component instead of using it. `button.tsx` now renders
  `<Spinner size={16} />`.

## 3. Dead code
- `Spinner` is now used (via the Button fix above).
- `FullPageSpinner` was exported but never imported anywhere — there's no
  client-side "checking session" loading state in this app (auth resolves
  server-side before the React tree mounts), so there was no honest place to
  wire it in. Removed rather than forcing an unrequested UI change.

## 4. ESLint / eslint-config-next version mismatch
`eslint-config-next@16.2.10` declares a peer dependency of `eslint >= 9.0.0`
(confirmed in its `package.json`), but the project pinned `eslint@^8.57.0`.
Running lint crashed with `TypeError: Converting circular structure to JSON` —
a known issue when `eslint-plugin-react-hooks`'s self-referencing flat-config
object is processed by ESLint 8's legacy validator.

**Fixed:**
- `package.json`: `eslint` bumped to `^9.0.0`; `lint` script changed from
  `next lint` (removed in Next.js 16) to `eslint .`.
- `.eslintrc.json` replaced with `eslint.config.mjs`, importing
  `eslint-config-next/core-web-vitals`'s native flat-config export directly
  (no `FlatCompat` — that's what caused the circular-structure crash).

**Note:** I verified this fix against Next.js/ESLint's own migration
documentation and confirmed the exact root cause (the peer dependency
mismatch), but couldn't run `npm install` in this sandbox (no network access,
and the bundled `node_modules` still has the old eslint 8), so I haven't
personally executed a clean `npm install && npm run lint` against the new
versions. Run that once after pulling this down — if anything's off, it's
almost certainly a further version nuance in the 9.x range, not the approach.

---
Everything else (typecheck, hook dependency arrays, no `any`/`TODO`/leftover
`console.log`) was already clean and untouched.

---

# UI/UX upgrade batch

8 features added on top of the fixes above. Every item below was compiled
with `tsc --noEmit` immediately after being written — the project sat at
0 TypeScript errors after each individual change, not just at the end.

## 1. Wake Lock during workouts
`session-player.tsx` now requests `navigator.wakeLock` when a session opens
and releases it on close, with feature detection (silently does nothing on
browsers without support) and re-acquisition if the tab was backgrounded
and comes back into view.

## 2. Contrast fix
`ink-faint` was `#6F7178` (3.78:1 against the background — fails WCAG AA's
4.5:1 for normal text). Computed a replacement, `#919299`, that preserves
the exact same hue/saturation and clears 4.5:1 against every background
tone it can appear on (bg, surface, surface-raised, surface-hover).

## 3. Loading skeleton
Correction to how this was originally scoped: every page under `(app)/` is
a client component with no independent data-fetching boundary — only the
shared layout does async work. That means per-route `loading.tsx` files
would never actually fire differently per page; Next only ever shows the
one shared boundary, regardless of which page triggered it. Built
per-route files anyway, they'd just be inert. Instead, the one real
skeleton (`(app)/loading.tsx`) was changed from dashboard-shaped to
generic, so it doesn't misrepresent whichever page is actually loading.

## 4. Landing page preview panel
Added a hand-built static panel (`SessionPreview`, inline in `page.tsx`)
styled like the guided workout session — ring timer, exercise name,
progress dots — using the real design tokens. Not a screenshot (no
browser/render tool available to capture the live app); a constructed
mockup using the same components and colors instead.

## 5. Data model (foundation for #6-8)
Added to `ProgressData` in `types.ts` — all purely additive, so existing
stored rows default in safely through the existing `{...EMPTY_PROGRESS,
...stored}` spread in `(app)/layout.tsx`, no migration needed:
- `measurementHistory` / `strengthHistory` — one entry appended per day a
  measurement or strength test is saved (`progress-context.tsx`'s
  `saveMeasurements` / `recordStrengthTest` now write to both the existing
  snapshot field and the new history array; re-saving same-day replaces
  that day's entry rather than duplicating it)
- `shoppingListChecked` — keyed by item name
- `celebratedMilestones` — milestone ids already shown, so a celebration
  only ever fires once
- `onboardingCompleted` — see #7

## 6. Nutrition shopping-list checkboxes
The shopping list is now tappable, backed by the new `shoppingListChecked`
field. Splitting this out required care: making the page interactive meant
it needed `'use client'`, but the page also exports `metadata` for the
browser tab title, which only works in Server Components — the two are
incompatible in the same file. Split into `nutrition/page.tsx` (thin
server wrapper, keeps `metadata`) rendering the new
`components/nutrition/nutrition-view.tsx` (client component, holds all
the actual UI and the checkbox logic).

## 7. Progress trend charts
New `components/ui/trend-chart.tsx` — hand-rolled SVG line chart (no
charting library, matching the existing `RingProgress` approach), wired
into `MeasurementsCard` (weight trend) and `StrengthTestCard` (push-up
trend). Along the way:
- Added `parseDateKey` to `utils.ts` (the local-not-UTC date parsing
  `use-program.ts` already had privately) so both the chart and the hook
  use the same safe parsing instead of a second copy existing.
- Caught before shipping: initially had weight-loss colored as
  "improvement" (green). That's wrong for this app specifically — the
  Nutrition page's own Golden Rule pushes a caloric *surplus* for growth,
  not loss. Weight now renders neutrally (no assumed direction); only
  push-ups uses the green/muted "improved" coloring, since a higher max
  push-up count is unambiguous regardless of the person's own goal.

## 8. Onboarding + milestone celebrations
`components/onboarding/welcome-modal.tsx` — a minimal first-run prompt
(weight/chest/waist, or skip) shown once. Caught before shipping: since
`onboardingCompleted` is a new field, every *existing* user would also
default to `false` on it — as first written, this would have shown
"Welcome to FORGE Protocol" to someone 200 days into their program. Fixed
by also requiring zero prior activity (`completedDays`, `measurements`,
`measurementHistory`, `exerciseChecks` all empty) before showing it, so
it's genuinely scoped to brand-new accounts only.

`components/dashboard/milestone-celebration.tsx` — celebrates streak
thresholds (7/30/60/100/365 days) and phase advancement (Phase 2 onward),
using the `ember` pulse animation that was already defined in the Tailwind
config but unused anywhere. Each milestone celebrates once, tracked via
`celebratedMilestones`.

Both are mounted in `AppShell` (inside `ProgressProvider`, wrapping every
`(app)` page) rather than on a single page, so they trigger correctly
regardless of which page happens to be the entry point.
