// =====================================================================
// Shared types
// =====================================================================

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'mobility' | 'cardio' | 'full';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/** Equipment an exercise needs. `none` = bodyweight / household items only. */
export type Equipment =
  | 'none'
  | 'dumbbell'
  | 'kettlebell'
  | 'band'
  | 'pullup-bar'
  | 'barbell'
  | 'bench'
  | 'jump-rope'
  | 'cable'
  | 'machine';

/** Which version of the 365-day program the person follows. */
export type TrainingMode = 'home' | 'dumbbells' | 'gym';

export interface Exercise {
  key: string;
  name: string;
  category: ExerciseCategory;
  difficulty: Difficulty;
  muscles: string[];
  description: string;
  image?: string;
  instructions: string[];
  sets: number;
  reps: string;
  rest: string;
  /** Defaults to ['none'] (bodyweight) when omitted. */
  equipment?: Equipment[];
}

/** A single exercise slot inside a workout day, referencing the library by key. */
export interface WorkoutExercise {
  exerciseKey: string;
  sets: number;
  /** Either a rep target ("8-12") or a time target in seconds. */
  reps?: string;
  timeSeconds?: number;
  rest: string;
  notes?: string;
}

export type SplitDay = 'push' | 'pull' | 'legs' | 'core' | 'hiit' | 'recovery' | 'rest';

export interface WarmupCooldownItem {
  exercise: string;
  reps?: string;
  duration?: string;
}

export interface DayTemplate {
  slot: number; // 1-7, position in the weekly split
  split: SplitDay;
  label: string;
  isRestDay: boolean;
  focus: string;
  baseDuration: string;
  kcalEstimate: string;
  warmup: WarmupCooldownItem[];
  cooldown: WarmupCooldownItem[];
  /** Ordered easy -> hard; the resolved phase index picks one tier. */
  tiers: WorkoutExercise[][];
  checklist: string[];
  restNote?: string;
}

export interface ResolvedWorkout {
  dayNumber: number;
  date: Date;
  weekNumber: number;
  phase: number;
  split: SplitDay;
  label: string;
  isRestDay: boolean;
  intensity: Difficulty;
  focus: string;
  duration: string;
  kcalEstimate: string;
  warmup: WarmupCooldownItem[];
  cooldown: WarmupCooldownItem[];
  exercises: WorkoutExercise[];
  checklist: string[];
  restNote?: string;
  motivation: string;
}

export interface Phase {
  id: number;
  name: string;
  weeks: string;
  description: string;
}

// ---------------------------------------------------------------------
// Persisted progress (mirrors the `data` jsonb column in user_progress)
// ---------------------------------------------------------------------

export interface Measurements {
  weight?: number;
  chest?: number;
  arms?: number;
  waist?: number;
  thighs?: number;
  updatedAt?: string;
}

export interface StrengthTests {
  pushups?: number;
  squats?: number;
  plankSeconds?: number;
  updatedAt?: string;
}

export interface MeasurementEntry {
  date: string; // YYYY-MM-DD
  weight?: number;
  chest?: number;
  arms?: number;
  waist?: number;
  thighs?: number;
}

export interface StrengthEntry {
  date: string; // YYYY-MM-DD
  pushups?: number;
  squats?: number;
  plankSeconds?: number;
}

export interface ProgressData {
  completedDays: number[];
  checklistCompleted: Record<string, number[]>;
  exerciseChecks: Record<string, number[]>;
  waterIntake: Record<string, number>;
  habits: Record<string, boolean>;
  dailyTasks: Record<string, string[]>;
  measurements: Measurements;
  strengthTests: StrengthTests;
  /** One entry appended every time measurements are saved — powers the progress trend chart. */
  measurementHistory: MeasurementEntry[];
  /** One entry appended every time a strength test is recorded — powers the progress trend chart. */
  strengthHistory: StrengthEntry[];
  /** Keyed by shopping-list item name. */
  shoppingListChecked: Record<string, boolean>;
  /** Milestone ids already celebrated (e.g. "streak-7", "phase-2"), so a celebration only ever shows once. */
  celebratedMilestones: string[];
  onboardingCompleted: boolean;
  /** Latest guided-session log per program day (re-doing a day replaces it). */
  sessionLogs: SessionLog[];
  /** Stored partially so new settings fall back to DEFAULT_SETTINGS — read via `getSettings`. */
  settings: Partial<UserSettings>;
  /** Grams of protein logged, keyed by YYYY-MM-DD. */
  proteinLog: Record<string, number>;
  favoriteExercises: string[];
  nutritionProfile: NutritionProfile;
  /** Chosen option index per meal title (0 = the default meal). */
  mealSwaps: Record<string, number>;
  progressPhotos: ProgressPhoto[];
  /** Quick workouts finished from the Workouts library (newest last, capped). */
  routineLogs: RoutineLog[];
  /** Training-arc challenges: arcId → progress. */
  arcs: Record<string, ArcProgress>;
}

// ---------------------------------------------------------------------
// Feature data
// ---------------------------------------------------------------------

export type UnitSystem = 'metric' | 'imperial';

export type NutritionRegion = 'global' | 'west-africa' | 'south-asia' | 'east-asia' | 'latin-america' | 'mena';

export interface UserSettings {
  /** Display units only — measurements are always stored in kg / cm. */
  units: UnitSystem;
  sound: boolean;
  voice: boolean;
  vibration: boolean;
  /** Glasses of water per day. */
  waterGoal: number;
  /** Daily reminder time, HH:MM (local). */
  reminderTime: string;
  /** The coach who guides workouts and greets you (see lib/coaches). */
  coachId: string;
  /** Which version of the 365-day program to follow. */
  trainingMode: TrainingMode;
  /** Meal plan region for the nutrition page. */
  region: NutritionRegion;
}

export const DEFAULT_SETTINGS: UserSettings = {
  units: 'metric',
  sound: true,
  voice: true,
  vibration: true,
  waterGoal: 8,
  reminderTime: '18:00',
  coachId: 'kaito',
  trainingMode: 'home',
  region: 'global',
};

export function getSettings(data: Pick<ProgressData, 'settings'>): UserSettings {
  return { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) };
}

export interface SessionLog {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  durationSec: number;
  /** reps[exerciseIndex][setIndex] — null for timed holds or skipped sets. Kept compact on purpose. */
  reps: (number | null)[][];
  /** Exercise key per index. Present on newer logs; older logs are resolved from the home program. */
  keys?: string[];
}

export interface RoutineLog {
  routineId: string;
  date: string; // YYYY-MM-DD
  durationSec: number;
  reps: (number | null)[][];
  keys: string[];
}

export interface ArcProgress {
  startedOn: string; // YYYY-MM-DD
  /** Arc day numbers (1-based) completed. */
  doneDays: number[];
}

export interface NutritionProfile {
  heightCm?: number;
  age?: number;
  sex?: 'male' | 'female';
  activity?: 'light' | 'moderate' | 'active';
  goal?: 'gain' | 'maintain';
}

export interface ProgressPhoto {
  id: string;
  date: string; // YYYY-MM-DD
  /** Object path inside the private `progress-photos` storage bucket. */
  path: string;
}

export const EMPTY_PROGRESS: ProgressData = {
  completedDays: [],
  checklistCompleted: {},
  exerciseChecks: {},
  waterIntake: {},
  habits: {},
  dailyTasks: {},
  measurements: {},
  strengthTests: {},
  measurementHistory: [],
  strengthHistory: [],
  shoppingListChecked: {},
  celebratedMilestones: [],
  onboardingCompleted: false,
  sessionLogs: [],
  settings: {},
  proteinLog: {},
  favoriteExercises: [],
  nutritionProfile: {},
  mealSwaps: {},
  progressPhotos: [],
  routineLogs: [],
  arcs: {},
};

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  program_start_date: string;
  created_at: string;
}
