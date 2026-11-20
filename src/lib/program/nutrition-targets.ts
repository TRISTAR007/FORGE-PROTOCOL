import type { NutritionProfile } from '@/lib/types';

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  bmr: number;
  tdee: number;
}

const ACTIVITY_FACTOR: Record<NonNullable<NutritionProfile['activity']>, number> = {
  light: 1.375, // training most days, otherwise mostly sitting
  moderate: 1.55, // training + on your feet a good part of the day
  active: 1.725, // training + physical job / lots of walking
};

/** Lean-gain surplus — enough to grow without piling on fat. */
const GAIN_SURPLUS_KCAL = 400;
const PROTEIN_G_PER_KG = 1.8;
const FAT_SHARE = 0.25;

/**
 * Daily targets from the Mifflin-St Jeor equation. Returns null until
 * weight, height, age and sex are all known.
 */
export function computeTargets(weightKg: number | undefined, profile: NutritionProfile): NutritionTargets | null {
  const { heightCm, age, sex } = profile;
  if (!weightKg || !heightCm || !age || !sex) return null;

  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTOR[profile.activity ?? 'light'];
  const calories = Math.round((tdee + (profile.goal === 'maintain' ? 0 : GAIN_SURPLUS_KCAL)) / 10) * 10;
  const protein = Math.round(weightKg * PROTEIN_G_PER_KG);
  const fats = Math.round((calories * FAT_SHARE) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));

  return { calories, protein, carbs, fats, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}
