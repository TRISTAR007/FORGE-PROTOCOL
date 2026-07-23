export interface DailyTask {
  id: string;
  label: string;
  sub: string;
}

/** Daily non-negotiables shown on the dashboard, independent of the day's workout. */
export const DAILY_TASKS: DailyTask[] = [
  { id: 'morning', label: 'Morning Posture Routine', sub: 'Wall posture + stretches, 2 min' },
  { id: 'eat', label: 'Eat Enough (all meals + snack)', sub: 'A caloric surplus is the goal' },
  { id: 'water', label: 'Drink Water (2L+)', sub: 'Skin and recovery both start here' },
  { id: 'evening', label: 'Evening Posture Routine', sub: 'Stretches before bed, 3 min' },
  { id: 'skin', label: 'Skin Routine', sub: 'Cold water AM, warm water PM' },
  { id: 'sleep', label: 'Sleep 7-8 Hours', sub: 'The real transformation happens here' },
];
