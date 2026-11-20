import Link from 'next/link';
import type { Metadata } from 'next';
import { Flame, Dumbbell, UtensilsCrossed, LineChart, Sparkles, Timer, ChevronDown, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveSessionPreview } from '@/components/landing/live-session-preview';
import { createClient } from '@/lib/supabase/server';
import { EXERCISES } from '@/lib/program/exercises';
import { PHASES, SPLIT } from '@/lib/program/program';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'FORGE Protocol — 365-Day Home Transformation',
};

const EXERCISE_COUNT = Object.keys(EXERCISES).length;

const FEATURES = [
  {
    icon: Dumbbell,
    title: 'A real 365-day program',
    body: 'A rotating Push / Pull / Legs / Core / HIIT split that genuinely progresses through six phases — not the same week relabeled fifty times.',
  },
  {
    icon: Timer,
    title: 'A coach in your pocket',
    body: 'A full-screen guided session with rest timers, sound and voice cues, rep logging, and personal records — so you never guess what comes next.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Budget-friendly nutrition',
    body: 'A Nigerian-market meal plan with swappable meals, a weekly shopping list with real costs, and calorie and protein targets built from your numbers.',
  },
  {
    icon: LineChart,
    title: 'Progress you can see',
    body: 'A year-at-a-glance heatmap, trend charts for every measurement, private progress photos with a before/after slider, and badges to chase.',
  },
  {
    icon: Sparkles,
    title: 'Posture, recovery & skin',
    body: 'Daily non-negotiables and reference guides that go beyond the workout — posture correction, mobility, sleep, and a simple skin routine.',
  },
  {
    icon: Flame,
    title: 'Built for home, works offline',
    body: 'Every movement uses bodyweight or things already in your house. Install it on your phone and it keeps working without a connection.',
  },
];

const FAQ = [
  {
    q: 'Do I need any equipment?',
    a: 'No. Every exercise uses your bodyweight or things you already have — a chair, a towel, a backpack, a doorframe.',
  },
  {
    q: "I'm a complete beginner. Is this for me?",
    a: 'Yes. Phase 1 starts with knee and incline push-ups, split squats and short planks. Harder variations unlock as you move through the phases, so the program grows with you.',
  },
  {
    q: 'How long are the workouts?',
    a: 'Most sessions take 20–45 minutes, five days a week, with a recovery day and a full rest day each week.',
  },
  {
    q: 'What happens if I miss a few days?',
    a: "Scheduled rest days never break your streak. If life gets in the way, the dashboard offers to shift your schedule so you pick up exactly where you left off — nothing you've logged is lost.",
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. It is built mobile-first, keeps your screen awake during workouts, and can be installed to your home screen, where it also works offline.',
  },
  {
    q: 'Is my data private?',
    a: 'Your progress is locked to your account at the database level, progress photos are stored privately, and you can export or permanently delete everything from Settings at any time.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Create an account and start Day 1.',
  },
];

const PHASE_TONES = ['text-forge', 'text-brass', 'text-ok', 'text-forge', 'text-brass', 'text-ok'];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const week = Object.values(SPLIT).sort((a, b) => a.slot - b.slot);
  const primaryHref = user ? '/dashboard' : '/signup';

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-forge text-bg sm:h-9 sm:w-9">
            <Flame size={17} strokeWidth={2.5} />
          </span>
          <span className="whitespace-nowrap font-display text-lg tracking-wide sm:text-xl">FORGE PROTOCOL</span>
        </div>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button className="whitespace-nowrap px-3 sm:px-4">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="whitespace-nowrap px-3 sm:px-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="hidden min-[400px]:block">
                <Button className="whitespace-nowrap px-3 sm:px-4">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
            style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,106,43,0.16), transparent 60%)' }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-16 text-center sm:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-brass">
              365 Days · No Gym Required
            </span>
            <h1 className="mt-6 text-balance font-display text-5xl leading-[1.05] tracking-wide sm:text-7xl">
              Forge a new body,
              <br /> one day at a time.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-ink-muted">
              A full year of home bodyweight training, real progressive overload, budget-friendly nutrition, and daily
              habit tracking — all in one account that remembers everything.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  {user ? 'Continue Your Program' : 'Start Day 1 — Free'}
                </Button>
              </Link>
              {!user ? (
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    I already have an account
                  </Button>
                </Link>
              ) : null}
            </div>

            <LiveSessionPreview />
          </div>
        </section>

        <section aria-label="Program at a glance" className="border-y border-line bg-surface/50">
          <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-6 py-8 text-center sm:grid-cols-4">
            {[
              { value: '365', label: 'Days' },
              { value: '6', label: 'Phases' },
              { value: String(EXERCISE_COUNT), label: 'Exercises' },
              { value: '0', label: 'Equipment' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-4xl tracking-wide">{s.value}</dd>
                <dd className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-faint">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-md border border-line bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-forge-dim text-forge">
                  <f.icon size={20} />
                </div>
                <h2 className="mt-4 font-display text-lg tracking-wide">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brass">How the year is built</p>
          <h2 className="mt-2 font-display text-3xl tracking-wide sm:text-4xl">Six phases. Each one harder than the last.</h2>
          <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <li key={p.id} className="relative rounded-md border border-line bg-surface p-5">
                <div className="flex items-baseline justify-between">
                  <span className={cn('font-display text-4xl tracking-wide', PHASE_TONES[i])}>{p.id}</span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">Weeks {p.weeks}</span>
                </div>
                <h3 className="mt-2 font-display text-lg tracking-wide">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brass">A typical week</p>
          <h2 className="mt-2 font-display text-3xl tracking-wide sm:text-4xl">Five training days. Two to recover.</h2>
          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-7">
            {week.map((d, i) => (
              <div
                key={d.slot}
                className={cn(
                  'flex items-center gap-4 rounded-md border p-4 sm:flex-col sm:items-start sm:gap-2',
                  d.isRestDay ? 'border-line bg-bg' : 'border-line bg-surface'
                )}
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">Day {i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-display text-base tracking-wide">
                    {d.isRestDay ? <Moon size={14} className="text-brass" /> : null}
                    {d.label}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{d.focus}</p>
                </div>
                {!d.isRestDay ? <span className="font-mono text-[11px] text-forge">{d.baseDuration}</span> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <h2 className="text-center font-display text-3xl tracking-wide sm:text-4xl">Questions</h2>
          <div className="mt-8 divide-y divide-line rounded-md border border-line bg-surface">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown size={18} className="shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-lg border border-forge/30 bg-surface px-6 py-12 text-center">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 120%, rgba(255,106,43,0.22), transparent 60%)' }}
            />
            <h2 className="relative font-display text-3xl tracking-wide sm:text-4xl">Day 1 is today.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-ink-muted">
              Thirty minutes, no equipment, and a plan for every day of the year.
            </p>
            <Link href={primaryHref} className="relative mt-7 inline-block">
              <Button size="lg">{user ? 'Go to Dashboard' : 'Start Day 1 — Free'}</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
        FORGE Protocol — built for training at home, on a budget, with no equipment.
      </footer>
    </div>
  );
}
