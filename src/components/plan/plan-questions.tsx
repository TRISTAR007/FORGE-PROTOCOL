'use client';

import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Building2,
  Check,
  Crown,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  ShieldCheck,
  Sprout,
  Target,
  TrendingUp,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { getCoach } from '@/lib/coaches';
import { GOAL_COACH, recommendRoutines } from '@/lib/program/plan';
import { LIMITATIONS } from '@/lib/program/safety';
import { RANKS, type Rank } from '@/lib/program/levels';
import type { Difficulty, Limitation, PlanGoal, PlanMinutes, TrainingMode, TrainingPlan } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface PlanDraft {
  goal: PlanGoal;
  experience: Difficulty;
  mode: TrainingMode;
  minutes: PlanMinutes;
  limitations: Limitation[];
  /** Heart condition, pregnancy, recent surgery… — shows advice and keeps things low-impact. */
  medical: boolean;
}

export const PLAN_STEPS = 5;

export function draftFromPlan(plan: TrainingPlan | null, mode: TrainingMode): PlanDraft {
  return {
    goal: plan?.goal ?? 'general',
    experience: plan?.experience ?? 'beginner',
    mode,
    minutes: plan?.minutes ?? 20,
    limitations: (plan?.limitations ?? []).filter((l) => l !== 'lowImpact'),
    medical: plan?.limitations.includes('lowImpact') ?? false,
  };
}

export function planFromDraft(d: PlanDraft): TrainingPlan {
  const limitations = [...d.limitations.filter((l) => l !== 'lowImpact'), ...(d.medical ? (['lowImpact'] as const) : [])];
  return { goal: d.goal, experience: d.experience, minutes: d.minutes, limitations, createdAt: new Date().toISOString() };
}

function Option({
  icon: Icon,
  label,
  sub,
  selected,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border p-3.5 text-start transition-colors',
        selected ? 'border-forge bg-forge-dim/50' : 'border-line hover:bg-surface'
      )}
    >
      {Icon ? <Icon size={20} className={selected ? 'text-forge' : 'text-ink-muted'} /> : null}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {sub ? <span className="block text-xs text-ink-faint">{sub}</span> : null}
      </span>
      {selected ? <Check size={16} className="text-forge" /> : null}
    </button>
  );
}

const GOALS: { id: PlanGoal; icon: LucideIcon }[] = [
  { id: 'strength', icon: Dumbbell },
  { id: 'fatLoss', icon: Flame },
  { id: 'endurance', icon: HeartPulse },
  { id: 'flexibility', icon: Wind },
  { id: 'general', icon: Target },
];

const LEVELS: { id: Difficulty; icon: LucideIcon }[] = [
  { id: 'beginner', icon: Sprout },
  { id: 'intermediate', icon: TrendingUp },
  { id: 'advanced', icon: Crown },
];

const MODES: { id: TrainingMode; icon: LucideIcon }[] = [
  { id: 'home', icon: Home },
  { id: 'dumbbells', icon: Dumbbell },
  { id: 'gym', icon: Building2 },
];

const MINUTES: PlanMinutes[] = [10, 20, 30, 45];

/** One question of the plan builder. */
export function PlanQuestion({ step, draft, onChange }: { step: number; draft: PlanDraft; onChange: (d: PlanDraft) => void }) {
  const t = useTranslations('plan');
  const tSettings = useTranslations('settings');
  const set = (patch: Partial<PlanDraft>) => onChange({ ...draft, ...patch });

  const heading = (key: string) => (
    <div className="mb-3">
      <h3 className="font-display text-lg tracking-wide">{t(`${key}Title`)}</h3>
      <p className="text-sm text-ink-muted">{t(`${key}Body`)}</p>
    </div>
  );

  if (step === 0)
    return (
      <div>
        {heading('goal')}
        <div className="space-y-2">
          {GOALS.map((g) => (
            <Option key={g.id} icon={g.icon} label={t(`goals.${g.id}`)} sub={t(`goals.${g.id}Sub`)} selected={draft.goal === g.id} onClick={() => set({ goal: g.id })} />
          ))}
        </div>
      </div>
    );

  if (step === 1)
    return (
      <div>
        {heading('experience')}
        <div className="space-y-2">
          {LEVELS.map((l) => (
            <Option key={l.id} icon={l.icon} label={t(`levels.${l.id}`)} sub={t(`levels.${l.id}Sub`)} selected={draft.experience === l.id} onClick={() => set({ experience: l.id })} />
          ))}
        </div>
      </div>
    );

  if (step === 2)
    return (
      <div>
        {heading('equipment')}
        <div className="space-y-2">
          {MODES.map((m) => (
            <Option key={m.id} icon={m.icon} label={tSettings(`modes.${m.id}`)} sub={t(`modeSub.${m.id}`)} selected={draft.mode === m.id} onClick={() => set({ mode: m.id })} />
          ))}
        </div>
      </div>
    );

  if (step === 3)
    return (
      <div>
        {heading('time')}
        <div className="grid grid-cols-2 gap-2">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set({ minutes: m })}
              aria-pressed={draft.minutes === m}
              className={cn(
                'rounded-md border p-4 text-center transition-colors',
                draft.minutes === m ? 'border-forge bg-forge-dim/50' : 'border-line hover:bg-surface'
              )}
            >
              <span className="block font-display text-2xl">{m}</span>
              <span className="block text-xs text-ink-faint">{t('minutesPerDay')}</span>
            </button>
          ))}
        </div>
      </div>
    );

  // Step 4: injuries / limitations.
  const toggle = (l: Limitation) =>
    set({ limitations: draft.limitations.includes(l) ? draft.limitations.filter((x) => x !== l) : [...draft.limitations, l] });
  return (
    <div>
      {heading('limits')}
      <div className="flex flex-wrap gap-2">
        {LIMITATIONS.filter((l) => l !== 'lowImpact').map((l) => {
          const on = draft.limitations.includes(l);
          return (
            <button
              key={l}
              type="button"
              onClick={() => toggle(l)}
              aria-pressed={on}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
                on ? 'border-aqua bg-aqua/15 text-aqua' : 'border-line text-ink-muted hover:bg-surface'
              )}
            >
              {on ? <Check size={14} /> : null}
              {t(`limitations.${l}`)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => set({ limitations: [], medical: false })}
          aria-pressed={draft.limitations.length === 0 && !draft.medical}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
            draft.limitations.length === 0 && !draft.medical ? 'border-ok bg-ok/15 text-ok' : 'border-line text-ink-muted hover:bg-surface'
          )}
        >
          {t('limitations.none')}
        </button>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-line p-3.5">
        <input
          type="checkbox"
          checked={draft.medical}
          onChange={(e) => set({ medical: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[#FF4D94]"
        />
        <span>
          <span className="block text-sm font-semibold">{t('medical')}</span>
          <span className="block text-xs text-ink-faint">{t('medicalSub')}</span>
        </span>
      </label>

      {draft.medical || draft.limitations.length > 0 ? (
        <p className="mt-3 flex items-start gap-2 rounded-md border border-brass/30 bg-brass-dim/40 p-3 text-xs text-ink-muted">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-brass" />
          {t('doctorNote')}
        </p>
      ) : null}
    </div>
  );
}

/** "Here's your plan" — shown after the last question. */
export function PlanSummary({ draft, rank }: { draft: PlanDraft; rank?: Rank }) {
  const t = useTranslations('plan');
  const tSettings = useTranslations('settings');
  const plan = planFromDraft(draft);
  const coach = getCoach(GOAL_COACH[draft.goal]);
  const picks = recommendRoutines(plan, draft.mode, 3);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg tracking-wide">{t('summaryTitle')}</h3>
        <p className="text-sm text-ink-muted">{t('summaryBody')}</p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        {[
          [t('summaryGoal'), t(`goals.${draft.goal}`)],
          [t('summaryLevel'), t(`levels.${draft.experience}`)],
          [t('summaryGear'), tSettings(`modes.${draft.mode}`)],
          [t('summaryTime'), t('minutesValue', { n: draft.minutes })],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-surface px-3 py-2">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-display text-xl text-bg"
          style={{ background: (rank ?? RANKS[0]).color }}
        >
          {(rank ?? RANKS[0]).id}
        </span>
        <p className="text-sm text-ink-muted">{rank ? t('summaryRankNow', { rank: rank.id }) : t('summaryRank')}</p>
      </div>

      <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
        <CoachAvatar coach={coach} size={44} />
        <p className="text-sm text-ink-muted">{t('summaryCoach', { name: coach.name })}</p>
      </div>

      {picks.length > 0 ? (
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('summaryPicks')}</p>
          <ul className="space-y-1 text-sm">
            {picks.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-sm bg-surface px-3 py-1.5">
                <span className="font-semibold">{r.name}</span>
                <span className="font-mono text-xs text-ink-faint">{r.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {plan.limitations.length > 0 ? (
        <p className="flex items-start gap-2 rounded-md border border-aqua/30 bg-aqua/10 p-3 text-xs text-ink-muted">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-aqua" />
          {t('summarySafe')}
        </p>
      ) : null}
    </div>
  );
}
