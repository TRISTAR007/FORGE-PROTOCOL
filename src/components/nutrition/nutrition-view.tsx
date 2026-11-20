'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Shuffle, RotateCcw, Minus, Calculator, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RingProgress } from '@/components/ui/ring-progress';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { cn, addDays, toDateKey, todayKey } from '@/lib/utils';
import { fromDisplayLength, lengthUnit, toDisplayLength } from '@/lib/units';
import { computeTargets } from '@/lib/program/nutrition-targets';
import type { NutritionProfile } from '@/lib/types';
import {
  DAILY_TARGETS,
  GOLDEN_RULE,
  REGION_PLANS,
  regionMealOptions,
} from '@/lib/program/nutrition';

const DEFAULT_PROTEIN_TARGET = 140;

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
      {label}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-sm border border-line bg-bg px-3 py-2.5 text-sm normal-case tracking-normal text-ink focus:border-forge focus:outline-none"
      >
        <option value="" disabled>
          Choose…
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TargetsCard() {
  const { progress, settings, updateNutritionProfile } = useProgress();
  const { toast } = useToast();
  const profile = progress.nutritionProfile;
  const weightKg = progress.measurements.weight;
  const targets = computeTargets(weightKg, profile);
  const [editing, setEditing] = useState(!targets);
  const units = settings.units;

  const [height, setHeight] = useState(() =>
    profile.heightCm ? String(toDisplayLength(profile.heightCm, units)) : ''
  );
  const [age, setAge] = useState(() => (profile.age ? String(profile.age) : ''));
  const [sex, setSex] = useState<NutritionProfile['sex']>(profile.sex);
  const [activity, setActivity] = useState<NutritionProfile['activity']>(profile.activity ?? 'light');
  const [goal, setGoal] = useState<NutritionProfile['goal']>(profile.goal ?? 'gain');

  const save = () => {
    const h = Number(height);
    const a = Number(age);
    updateNutritionProfile({
      heightCm: Number.isFinite(h) && h > 0 ? Math.round(fromDisplayLength(h, units) * 10) / 10 : undefined,
      age: Number.isFinite(a) && a > 0 ? Math.round(a) : undefined,
      sex,
      activity,
      goal,
    });
    setEditing(false);
    toast('Targets updated.');
  };

  const shown = targets
    ? [
        { label: 'Calories', value: String(targets.calories) },
        { label: 'Protein', value: `${targets.protein}g` },
        { label: 'Carbs', value: `${targets.carbs}g` },
        { label: 'Fats', value: `${targets.fats}g` },
      ]
    : DAILY_TARGETS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Targets</CardTitle>
        <Badge tone={targets ? 'ok' : 'neutral'}>{targets ? 'Personalized' : 'General'}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shown.map((t) => (
            <div key={t.label} className="rounded-sm border border-line bg-bg p-3 text-center">
              <p className="font-display text-xl">{t.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t.label}</p>
            </div>
          ))}
        </div>
        {targets ? (
          <p className="mt-3 text-xs text-ink-faint">
            Burn ≈ {targets.tdee} kcal/day (resting {targets.bmr}).{' '}
            {profile.goal === 'maintain' ? 'Targets hold your weight steady.' : 'Targets add ~400 kcal for lean muscle gain.'}{' '}
            Recalculates when you log a new weight.
          </p>
        ) : null}

        <button
          onClick={() => setEditing((e) => !e)}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-forge hover:text-forge-hover"
          aria-expanded={editing}
        >
          <Calculator size={15} />
          {targets ? 'Edit my details' : 'Personalize my targets'}
          <ChevronDown size={14} className={cn('transition-transform', editing && 'rotate-180')} />
        </button>

        {editing ? (
          <div className="mt-4 space-y-3 rounded-sm border border-line bg-bg p-4">
            {!weightKg ? (
              <p className="text-sm text-ink-muted">
                First, <Link href="/progress" className="font-semibold text-forge hover:text-forge-hover">log your weight</Link>{' '}
                on the Progress page — targets are built from it.
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Input
                id="nutrition-height"
                label={`Height (${lengthUnit(units)})`}
                type="number"
                inputMode="decimal"
                min={0}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="—"
              />
              <Input
                id="nutrition-age"
                label="Age"
                type="number"
                inputMode="numeric"
                min={0}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="—"
              />
              <Select
                label="Sex"
                value={sex}
                onChange={setSex}
                options={[
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                ]}
              />
              <Select
                label="Activity"
                value={activity}
                onChange={setActivity}
                options={[
                  { id: 'light', label: 'Desk job + training' },
                  { id: 'moderate', label: 'On my feet + training' },
                  { id: 'active', label: 'Physical job + training' },
                ]}
              />
              <Select
                label="Goal"
                value={goal}
                onChange={setGoal}
                options={[
                  { id: 'gain', label: 'Build muscle (surplus)' },
                  { id: 'maintain', label: 'Maintain weight' },
                ]}
              />
            </div>
            <Button onClick={save} size="sm">
              Save Details
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProteinTracker() {
  const { progress, settings, addProtein } = useProgress();
  const plan = REGION_PLANS[settings.region];
  const key = todayKey();
  const target = computeTargets(progress.measurements.weight, progress.nutritionProfile)?.protein ?? DEFAULT_PROTEIN_TARGET;
  const today = progress.proteinLog[key] ?? 0;
  const pctDone = Math.min(100, (today / target) * 100);

  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i - 6);
    const k = toDateKey(date);
    return { key: k, label: date.toLocaleDateString('en-US', { weekday: 'narrow' }), grams: progress.proteinLog[k] ?? 0 };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Protein Today</CardTitle>
        <span className={cn('font-mono text-xs', today >= target ? 'text-ok' : 'text-ink-faint')}>
          {today}/{target}g
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <RingProgress value={pctDone} size={120} stroke={10} colorClassName={today >= target ? 'text-ok' : 'text-forge'}>
            <div className="text-center">
              <div className="font-display text-3xl leading-none tracking-wide">{today}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">grams</div>
            </div>
          </RingProgress>
          <div className="w-full min-w-0 flex-1">
            <p className="mb-2 text-xs text-ink-faint">Tap what you ate to add it:</p>
            <div className="flex flex-wrap gap-1.5">
              {plan.protein.map((f) => (
                <button
                  key={f.label}
                  onClick={() => addProtein(key, f.grams)}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-forge/50 hover:text-ink"
                >
                  {f.label} <span className="font-mono text-forge">+{f.grams}g</span>
                </button>
              ))}
              <button
                onClick={() => addProtein(key, -5)}
                disabled={today === 0}
                aria-label="Remove 5 grams"
                className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-ink-faint transition-colors hover:text-ink disabled:opacity-30"
              >
                <Minus size={12} /> 5g
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-end gap-2" aria-label="Protein over the last 7 days">
          {week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xs bg-surface-raised">
                <div
                  className={cn('w-full rounded-xs', d.grams >= target ? 'bg-ok' : 'bg-forge/70')}
                  style={{ height: `${Math.min(100, (d.grams / target) * 100)}%` }}
                  title={`${d.grams}g`}
                />
              </div>
              <span className={cn('font-mono text-[10px]', d.key === key ? 'text-forge' : 'text-ink-faint')}>{d.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MealPlanCard() {
  const { progress, settings, setMealSwap } = useProgress();
  const plan = REGION_PLANS[settings.region];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Meal Plan</CardTitle>
        <span className="font-mono text-xs text-ink-faint">Tap swap to change a meal</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.meals.map((meal) => {
          const options = regionMealOptions(meal);
          const index = Math.min(progress.mealSwaps[meal.title] ?? 0, options.length - 1);
          return (
            <div key={meal.title} className="flex gap-4 rounded-sm border border-line bg-bg p-3">
              <span className="w-16 shrink-0 font-mono text-xs text-ink-faint">{meal.time}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {meal.title}
                  {options.length > 1 ? (
                    <span className="ml-2 font-mono text-[10px] font-normal text-ink-faint">
                      option {index + 1}/{options.length}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{options[index].join(' · ')}</p>
              </div>
              {options.length > 1 ? (
                <button
                  onClick={() => setMealSwap(meal.title, (index + 1) % options.length)}
                  aria-label={`Swap ${meal.title}`}
                  className="flex shrink-0 items-center gap-1 self-start rounded-xs px-2 py-1 text-xs font-semibold text-forge hover:bg-surface-hover"
                >
                  <Shuffle size={13} /> Swap
                </button>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ShoppingListCard() {
  const { progress, settings, toggleShoppingItem, resetShoppingList } = useProgress();
  const plan = REGION_PLANS[settings.region];
  const SHOPPING_LIST = plan.shopping;
  const { toast } = useToast();
  const checkedCount = SHOPPING_LIST.filter((row) => progress.shoppingListChecked[row.item]).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Shopping List</CardTitle>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ink-faint">
            {checkedCount}/{SHOPPING_LIST.length}
          </span>
          {plan.total ? <Badge tone="brass">{plan.total}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-line-faint">
          {SHOPPING_LIST.map((row) => {
            const checked = Boolean(progress.shoppingListChecked[row.item]);
            return (
              <button
                key={row.item}
                type="button"
                onClick={() => toggleShoppingItem(row.item)}
                aria-pressed={checked}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-opacity hover:opacity-80"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border transition-colors',
                    checked ? 'border-forge bg-forge text-bg' : 'border-line bg-bg text-transparent'
                  )}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className={cn('flex-1 text-sm font-medium', checked ? 'text-ink-faint line-through' : 'text-ink')}>
                  {row.item}
                </span>
                <span className={cn('text-sm', checked ? 'text-ink-faint' : 'text-ink-muted')}>{row.quantity}</span>
                <span className={cn('hidden font-mono text-sm sm:inline', checked ? 'text-ink-faint' : 'text-ink-muted')}>
                  {row.cost}
                </span>
                <Badge tone={row.priority === 'High' ? 'forge' : 'neutral'} className="hidden sm:inline-flex">
                  {row.priority}
                </Badge>
              </button>
            );
          })}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={checkedCount === 0}
          onClick={() => {
            resetShoppingList();
            toast('Shopping list cleared for a new week.');
          }}
        >
          <RotateCcw size={14} />
          Start a New Week
        </Button>
      </CardContent>
    </Card>
  );
}

export function NutritionView() {
  const { settings } = useProgress();
  const tp = useTranslations('pages');
  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{tp('nutritionTitle')}</h1>
        <p className="mt-1 text-ink-muted">{tp('nutritionSubtitle')}</p>
      </div>

      <Card className="border-forge/30 bg-forge-dim/40 p-5">
        <div className="flex gap-3">
          <Sparkles size={20} className="mt-0.5 shrink-0 text-forge" />
          <div>
            <p className="font-display text-sm uppercase tracking-wide text-forge">The Golden Rule</p>
            <p className="mt-1 text-sm text-ink-muted">{GOLDEN_RULE}</p>
          </div>
        </div>
      </Card>

      <TargetsCard />
      <ProteinTracker />
      <MealPlanCard />

      <Card>
        <CardHeader>
          <CardTitle>Budget-Friendly Staples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REGION_PLANS[settings.region].foods.map((food) => (
              <div key={food} className="rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink-muted">
                {food}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ShoppingListCard />
    </div>
  );
}
