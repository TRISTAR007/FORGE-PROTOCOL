import Link from 'next/link';
import type { Metadata } from 'next';
import { Flame, Dumbbell, UtensilsCrossed, LineChart, Sparkles, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RingProgress } from '@/components/ui/ring-progress';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'FORGE Protocol — 365-Day Home Transformation',
};

const FEATURES = [
  {
    icon: Dumbbell,
    title: 'A real 365-day program',
    body: 'A rotating Push / Pull / Legs / Core / HIIT split that genuinely progresses through six phases — not the same week relabeled fifty times.',
  },
  {
    icon: Timer,
    title: 'Guided workout sessions',
    body: 'A full-screen session player walks you through every set with an animated rest timer, so you never have to guess when to move on.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Budget-friendly nutrition',
    body: 'A Nigerian-market meal plan and weekly shopping list with real estimated costs, built around a caloric surplus.',
  },
  {
    icon: LineChart,
    title: 'Progress that actually saves',
    body: 'Measurements, strength tests, and your training streak are tied to your account — signed in on any device, always there.',
  },
  {
    icon: Sparkles,
    title: 'Posture, recovery & skin',
    body: 'Daily non-negotiables and reference guides that go beyond the workout — posture correction, mobility, sleep, and a simple skin routine.',
  },
  {
    icon: Flame,
    title: 'Built for home, no equipment',
    body: 'Every movement uses bodyweight or things already in your house — a chair, a towel, a backpack.',
  },
];

function SessionPreview() {
  return (
    <div className="mx-auto mt-14 max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-raised">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">Push Day · Phase 3</p>
          <p className="text-xs font-semibold text-ink">Set 2 of 4</p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-forge text-bg">
          <Flame size={13} strokeWidth={2.5} />
        </span>
      </div>

      <div className="flex flex-col items-center px-6 py-8">
        <span className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-forge">Work</span>
        <RingProgress value={64} size={160} stroke={9} colorClassName="text-forge">
          <div className="text-center">
            <div className="font-display text-4xl tracking-wide text-ink">21</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">seconds</div>
          </div>
        </RingProgress>
        <h3 className="mt-6 font-display text-2xl tracking-wide text-ink">Diamond Push-up</h3>
        <p className="mt-1 max-w-[240px] text-center text-xs text-ink-muted">
          Elbows tucked, hands under chest — control the descent.
        </p>
      </div>

      <div className="flex gap-1 px-6 pb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < 3 ? 'bg-forge' : i === 3 ? 'bg-forge/60' : 'bg-surface-raised'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-forge text-bg">
            <Flame size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl tracking-wide">FORGE PROTOCOL</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(255,106,43,0.16), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-brass">
            365 Days · No Gym Required
          </span>
          <h1 className="mt-6 text-balance font-display text-5xl leading-[1.05] tracking-wide sm:text-7xl">
            Forge a new body,
            <br /> one day at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-ink-muted">
            A full year of home bodyweight training, real progressive overload, budget-friendly nutrition, and
            daily habit tracking — all in one account that remembers everything.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Day 1 — Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I already have an account
              </Button>
            </Link>
          </div>

          <SessionPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-md border border-line bg-surface p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-forge-dim text-forge">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-lg tracking-wide">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
        FORGE Protocol — built for training at home, on a budget, with no equipment.
      </footer>
    </div>
  );
}
