import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Award, ChevronDown, Dumbbell, Globe2, Home, Mic, Moon, Swords, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/brand/brand-mark';
import { CoachPortrait } from '@/components/coach/coach-portrait';
import { LiveSessionPreview } from '@/components/landing/live-session-preview';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { createClient } from '@/lib/supabase/server';
import { EXERCISES } from '@/lib/program/exercises';
import { ROUTINES } from '@/lib/program/routines';
import { PHASES, SPLIT } from '@/lib/program/program';
import { COACHES } from '@/lib/coaches';
import { LOCALES } from '@/i18n/config';
import { APP_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${APP_NAME} — Free Anime Workouts, Coaches & Community`,
};

const PHASE_TONES = ['text-forge', 'text-brass', 'text-aqua', 'text-ok', 'text-violet', 'text-forge'];

export default async function LandingPage() {
  const t = await getTranslations('landing');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const week = Object.values(SPLIT).sort((a, b) => a.slot - b.slot);
  const primaryHref = user ? '/dashboard' : '/signup';

  const features = [
    { icon: Swords, title: t('f1Title'), body: t('f1Body') },
    { icon: Mic, title: t('f2Title'), body: t('f2Body') },
    { icon: Award, title: t('f3Title'), body: t('f3Body') },
    { icon: Users, title: t('f4Title'), body: t('f4Body') },
    { icon: Dumbbell, title: t('f5Title'), body: t('f5Body') },
    { icon: Globe2, title: t('f6Title'), body: t('f6Body') },
  ];
  const faq = (['1', '2', '3', '4', '5', '6', '7'] as const).map((n) => ({ q: t(`q${n}`), a: t(`a${n}`) }));

  return (
    <div className="min-h-screen overflow-x-hidden text-ink">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <BrandMark size={36} textClassName="text-base sm:text-lg" />
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
          <LanguageSwitcher compact className="hidden sm:inline-flex" />
          {user ? (
            <Link href="/dashboard">
              <Button className="whitespace-nowrap px-3 sm:px-4">{t('dashboard')}</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="whitespace-nowrap px-3 sm:px-4">
                  {t('signIn')}
                </Button>
              </Link>
              <Link href="/signup" className="hidden min-[400px]:block">
                <Button className="whitespace-nowrap bg-brand-gradient px-3 text-white sm:px-4">{t('getStarted')}</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div aria-hidden className="speed-lines pointer-events-none absolute left-1/2 top-[-200px] h-[1000px] w-[1000px] -translate-x-1/2 opacity-50" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pt-14 lg:grid-cols-[1.1fr,1fr]">
            <div className="text-center lg:text-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-forge/30 bg-forge-dim/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-forge">
                {t('badge')}
              </span>
              <h1 className="mt-6 text-balance font-display text-5xl leading-[1.05] tracking-wide sm:text-6xl">
                <span className="text-gradient">{t('titleA')}</span>
                <br />
                {t('titleB')}
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-muted lg:mx-0">{t('subtitle')}</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
                <Link href={primaryHref} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-brand-gradient text-white shadow-glow sm:w-auto">
                    {user ? t('ctaContinue') : t('ctaStart')}
                  </Button>
                </Link>
                {!user ? (
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      {t('ctaSignIn')}
                    </Button>
                  </Link>
                ) : null}
              </div>
              <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  {COACHES.slice(0, 6).map((c) => (
                    <CoachPortrait key={c.id} coach={c} size={40} mood="still" aura={false} rounded="full" className="ring-2 ring-bg" />
                  ))}
                </div>
                <p className="text-sm text-ink-muted">{t('coachesTitle')}</p>
              </div>
            </div>
            <LiveSessionPreview />
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Level Up Dojo at a glance" className="border-y border-line bg-surface/60 backdrop-blur">
          <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-6 py-8 text-center sm:grid-cols-4">
            {[
              { value: String(Object.keys(EXERCISES).length), label: t('statExercises') },
              { value: String(ROUTINES.length), label: t('statRoutines') },
              { value: String(COACHES.length), label: t('statCoaches') },
              { value: String(LOCALES.length), label: t('statLanguages') },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-4xl tracking-wide text-gradient">{s.value}</dd>
                <dd className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-faint">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Coaches */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-wide sm:text-4xl">{t('coachesTitle')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-ink-muted">{t('coachesSubtitle')}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {COACHES.map((c) => (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-xl border border-line bg-surface p-4 text-center transition-transform hover:-translate-y-1"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-24 opacity-60"
                  style={{ backgroundImage: `linear-gradient(180deg, ${c.colors[0]}50, transparent)` }}
                />
                <CoachPortrait coach={c} size={120} mood="still" className="relative mx-auto" />
                <p className="relative mt-3 font-display text-lg tracking-wide">{c.name}</p>
                <p className="relative font-mono text-[10px] uppercase tracking-widest" style={{ color: c.colors[0] }}>
                  {c.title}
                </p>
                <p className="relative mt-1 text-xs text-ink-muted">{c.specialty}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="text-center font-display text-3xl tracking-wide sm:text-4xl">{t('featuresTitle')}</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-line bg-surface p-6 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-gradient text-white shadow-glow">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg tracking-wide">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Training modes */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="font-display text-3xl tracking-wide sm:text-4xl">{t('modesTitle')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Home, title: t('modeHome'), body: t('modeHomeBody'), tone: 'text-forge' },
              { icon: Dumbbell, title: t('modeDb'), body: t('modeDbBody'), tone: 'text-brass' },
              { icon: Building2, title: t('modeGym'), body: t('modeGymBody'), tone: 'text-aqua' },
            ].map((m) => (
              <div key={m.title} className="relative overflow-hidden rounded-lg border border-line bg-surface p-6">
                <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-40" />
                <m.icon size={28} className={cn('relative', m.tone)} />
                <h3 className="relative mt-3 font-display text-xl tracking-wide">{m.title}</h3>
                <p className="relative mt-1 text-sm text-ink-muted">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Phases + week */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <li key={p.id} className="rounded-lg border border-line bg-surface p-5">
                <div className="flex items-baseline justify-between">
                  <span className={cn('font-display text-4xl tracking-wide', PHASE_TONES[i])}>{p.id}</span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">W {p.weeks}</span>
                </div>
                <h3 className="mt-2 font-display text-lg tracking-wide">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-7">
            {week.map((d, i) => (
              <div
                key={d.slot}
                className={cn(
                  'flex items-center gap-4 rounded-md border p-4 sm:flex-col sm:items-start sm:gap-2',
                  d.isRestDay ? 'border-line bg-bg' : 'border-line bg-surface'
                )}
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-display text-sm tracking-wide">
                    {d.isRestDay ? <Moon size={13} className="text-brass" /> : null}
                    {d.label}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{d.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <h2 className="text-center font-display text-3xl tracking-wide sm:text-4xl">{t('faqTitle')}</h2>
          <div className="mt-8 divide-y divide-line rounded-lg border border-line bg-surface">
            {faq.map((item) => (
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

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-xl border border-forge/30 bg-surface px-6 py-12 text-center">
            <div aria-hidden className="speed-lines pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative mx-auto flex justify-center -space-x-4 rtl:space-x-reverse">
              {COACHES.map((c) => (
                <CoachPortrait key={c.id} coach={c} size={56} mood="still" aura={false} rounded="full" className="ring-4 ring-surface" />
              ))}
            </div>
            <h2 className="relative mt-6 font-display text-3xl tracking-wide sm:text-4xl">{t('finalTitle')}</h2>
            <p className="relative mx-auto mt-3 max-w-md text-ink-muted">{t('finalBody')}</p>
            <Link href={primaryHref} className="relative mt-7 inline-block">
              <Button size="lg" className="bg-brand-gradient text-white shadow-glow">
                {user ? t('ctaContinue') : t('ctaStart')}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-xs text-ink-faint">{t('footer')}</p>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
