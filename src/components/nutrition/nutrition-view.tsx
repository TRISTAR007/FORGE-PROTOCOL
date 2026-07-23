'use client';

import { Sparkles, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProgress } from '@/context/progress-context';
import { cn } from '@/lib/utils';
import {
  DAILY_TARGETS,
  GOLDEN_RULE,
  BUDGET_FOODS,
  MEAL_PLAN,
  SHOPPING_LIST,
  SHOPPING_TOTAL,
} from '@/lib/program/nutrition';

export function NutritionView() {
  const { progress, toggleShoppingItem } = useProgress();
  const checkedCount = SHOPPING_LIST.filter((row) => progress.shoppingListChecked[row.item]).length;

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Nutrition</h1>
        <p className="mt-1 text-ink-muted">Budget-friendly, protein-forward meals built for a caloric surplus.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Daily Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DAILY_TARGETS.map((t) => (
              <div key={t.label} className="rounded-sm border border-line bg-bg p-3 text-center">
                <p className="font-display text-xl">{t.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget-Friendly Staples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BUDGET_FOODS.map((food) => (
              <div key={food} className="rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink-muted">
                {food}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Daily Meal Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MEAL_PLAN.map((meal) => (
            <div key={meal.title} className="flex gap-4 rounded-sm border border-line bg-bg p-3">
              <span className="w-16 shrink-0 font-mono text-xs text-ink-faint">{meal.time}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{meal.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{meal.items.join(' · ')}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Shopping List</CardTitle>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-ink-faint">
              {checkedCount}/{SHOPPING_LIST.length}
            </span>
            <Badge tone="brass">{SHOPPING_TOTAL}</Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
