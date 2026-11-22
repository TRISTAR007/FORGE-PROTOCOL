import type { CoachId } from '@/lib/coaches';
import type { Difficulty, Equipment, PlanGoal, TrainingMode, TrainingPlan } from '@/lib/types';
import { ROUTINES, type Routine, type RoutineFocus } from './routines';
import { isStressful } from './safety';

/** Which coach suits each goal best (shown on the plan summary). */
export const GOAL_COACH: Record<PlanGoal, CoachId> = {
  strength: 'ryu',
  fatLoss: 'mika',
  endurance: 'zara',
  flexibility: 'ren',
  general: 'kaito',
};

const GOAL_FOCUS: Record<PlanGoal, RoutineFocus[]> = {
  strength: ['strength', 'upper', 'lower', 'full'],
  fatLoss: ['cardio', 'full', 'lower'],
  endurance: ['cardio', 'full', 'core'],
  flexibility: ['mobility', 'core'],
  general: ['full', 'cardio', 'core', 'mobility', 'upper', 'lower', 'strength'],
};

const LEVEL: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const MODE_GEAR: Record<TrainingMode, Equipment[]> = {
  // "Bodyweight only" really means no gear at all.
  home: [],
  dumbbells: ['band', 'jump-rope', 'dumbbell', 'kettlebell', 'bench'],
  gym: ['band', 'jump-rope', 'dumbbell', 'kettlebell', 'bench', 'barbell', 'pullup-bar', 'cable', 'machine'],
};

/** Routines that fit the plan: goal, time, level, equipment — and the fewest moves that need swapping. */
export function recommendRoutines(plan: TrainingPlan | null, mode: TrainingMode, count = 3, seed = 0): Routine[] {
  const gear = MODE_GEAR[mode];
  const usable = ROUTINES.filter((r) => r.equipment.every((e) => gear.includes(e)));
  if (!plan) return rotate(usable.filter((r) => r.minutes <= 15), count, seed);

  const focus = GOAL_FOCUS[plan.goal];
  const scored = usable
    .map((r) => {
      let score = 0;
      const fi = focus.indexOf(r.focus);
      score += fi === -1 ? -3 : 3 - fi * 0.5;
      score += r.minutes <= plan.minutes ? 2 : r.minutes <= plan.minutes + 5 ? 0 : -3;
      const gap = LEVEL[r.difficulty] - LEVEL[plan.experience];
      score += gap > 0 ? -2 * gap : gap === 0 ? 1 : 0;
      score -= r.exercises.filter((e) => isStressful(e.exerciseKey, plan.limitations)).length * 3;
      return { r, score };
    })
    .sort((a, b) => b.score - a.score);

  // Rotate within the best handful so the dashboard isn't identical every day.
  const top = scored.slice(0, Math.max(count * 2, 6)).map((s) => s.r);
  return rotate(top, count, seed);
}

function rotate<T>(list: T[], count: number, seed: number): T[] {
  if (list.length === 0) return [];
  return Array.from({ length: Math.min(count, list.length) }, (_, i) => list[(seed * count + i) % list.length]);
}
