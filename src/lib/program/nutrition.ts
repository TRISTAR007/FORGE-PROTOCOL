import type { NutritionRegion } from '@/lib/types';

export const DAILY_TARGETS = [
  { label: 'Calories', value: '2800' },
  { label: 'Protein', value: '140g' },
  { label: 'Carbs', value: '350g' },
  { label: 'Fats', value: '70g' },
];

export const GOLDEN_RULE =
  "If you're training hard and not seeing results, you're probably under-eating, not under-training. A caloric surplus is the goal — every home-cooked meal is a chance to add more. Beans and eggs are your best friends.";

export const BUDGET_FOODS = [
  'Beans (ewa) — high protein, cheap',
  'Eggs — complete protein',
  'Rice & stew — energy dense',
  'Moi moi — protein rich',
  'Groundnuts (peanuts) — healthy fats',
  'Fish (Titus, mackerel) — omega-3',
  'Yam — complex carbs',
  'Plantain — potassium & carbs',
];

export interface Meal {
  time: string;
  title: string;
  items: string[];
}

export const MEAL_PLAN: Meal[] = [
  { time: '7:00 AM', title: 'Breakfast', items: ['3 boiled eggs', '2 slices of wheat bread', '1 banana', 'Glass of milk or soymilk'] },
  { time: '10:00 AM', title: 'Mid-Morning', items: ['Handful of groundnuts', '1 apple or orange'] },
  { time: '1:00 PM', title: 'Lunch', items: ['Large plate of rice', 'Chicken or fish stew', 'Vegetables (ugu, spinach)', '1 moi moi'] },
  { time: '4:00 PM', title: 'Pre-Workout', items: ['1 plantain (boiled or fried)', 'Small glass of zobo'] },
  { time: '6:30 PM', title: 'Post-Workout', items: ['2 boiled eggs', '1 banana', 'Water'] },
  { time: '8:00 PM', title: 'Dinner', items: ['Yam porridge', 'Fish or egusi soup', 'Vegetables'] },
];

/**
 * Swappable alternatives per meal (index 0 is always the default above),
 * built from the same budget staples so the shopping list still covers them.
 */
export const MEAL_ALTERNATIVES: Record<string, string[][]> = {
  Breakfast: [
    ['Bowl of akamu (pap)', '3 akara (bean cakes)', '1 boiled egg'],
    ['Oats cooked in milk', '1 banana', 'Spoon of groundnut paste'],
    ['2 slices of bread', '2-egg omelette with onions & pepper', 'Glass of soymilk'],
  ],
  'Mid-Morning': [
    ['Roasted corn', 'Coconut chunks'],
    ['1 boiled egg', '1 orange'],
  ],
  Lunch: [
    ['Beans porridge (ewa)', '1 fried or boiled plantain', 'Fish'],
    ['Jollof rice', 'Grilled chicken', 'Coleslaw or cucumber'],
    ['Eba or semo', 'Okra or ogbono soup with fish'],
  ],
  'Pre-Workout': [
    ['1 banana', 'Handful of groundnuts'],
    ['2 slices of bread with groundnut paste'],
  ],
  'Post-Workout': [
    ['Moi moi', 'Glass of milk'],
    ['Leftover rice & stew', 'Boiled egg'],
  ],
  Dinner: [
    ['Boiled yam', 'Egg sauce', 'Vegetables'],
    ['Rice & beans', 'Fish stew'],
    ['Pounded yam or eba', 'Egusi soup with chicken'],
  ],
};

export function mealOptions(meal: Meal): string[][] {
  return [meal.items, ...(MEAL_ALTERNATIVES[meal.title] ?? [])];
}

/** Quick-add buttons for the protein tracker — rough, budget-food portions. */
export const PROTEIN_FOODS: { label: string; grams: number }[] = [
  { label: 'Egg', grams: 6 },
  { label: 'Beans, 1 cup', grams: 15 },
  { label: 'Moi moi', grams: 9 },
  { label: 'Fish, 1 piece', grams: 20 },
  { label: 'Chicken, palm-size', grams: 30 },
  { label: 'Milk, 1 glass', grams: 8 },
  { label: 'Groundnuts, handful', grams: 7 },
  { label: 'Akara, 3 pieces', grams: 9 },
];

export interface ShoppingItem {
  item: string;
  quantity: string;
  cost: string;
  priority: 'High' | 'Medium';
}

export const SHOPPING_LIST: ShoppingItem[] = [
  { item: 'Eggs', quantity: '2 crates (60 eggs)', cost: '₦3,000 – 3,500', priority: 'High' },
  { item: 'Beans (ewa)', quantity: '2 kg', cost: '₦1,200', priority: 'High' },
  { item: 'Rice', quantity: '5 kg', cost: '₦3,500', priority: 'High' },
  { item: 'Chicken', quantity: '2 kg', cost: '₦3,000', priority: 'Medium' },
  { item: 'Fish (Titus)', quantity: '10 pieces', cost: '₦2,500', priority: 'Medium' },
  { item: 'Groundnuts', quantity: '1 kg', cost: '₦800', priority: 'Medium' },
  { item: 'Yam', quantity: '3 large tubers', cost: '₦1,500', priority: 'High' },
  { item: 'Plantain', quantity: '1 bunch', cost: '₦1,000', priority: 'Medium' },
  { item: 'Bananas', quantity: '1 bunch', cost: '₦800', priority: 'Medium' },
  { item: 'Vegetables', quantity: 'Various', cost: '₦1,500', priority: 'High' },
  { item: 'Milk', quantity: '2 liters', cost: '₦1,200', priority: 'Medium' },
  { item: 'Bread', quantity: '2 loaves', cost: '₦1,000', priority: 'Medium' },
];

export const SHOPPING_TOTAL = '₦20,000 – ₦25,000 per week';

// ---------------------------------------------------------------------
// Regional plans — same structure and protein focus, built from staples
// that are cheap and easy to find in each region. Prices are only shown
// where they were researched (West Africa); elsewhere items are listed
// without costs.
// ---------------------------------------------------------------------

export interface RegionMeal extends Meal {
  alternatives?: string[][];
}

export interface RegionPlan {
  foods: string[];
  meals: RegionMeal[];
  shopping: ShoppingItem[];
  total?: string;
  protein: { label: string; grams: number }[];
}

const GLOBAL_PROTEIN = [
  { label: 'Egg', grams: 6 },
  { label: 'Beans or lentils, 1 cup', grams: 15 },
  { label: 'Chicken, palm-size', grams: 30 },
  { label: 'Fish or tuna, 1 portion', grams: 22 },
  { label: 'Milk, 1 glass', grams: 8 },
  { label: 'Yogurt, 1 cup', grams: 10 },
  { label: 'Tofu or paneer, 100 g', grams: 12 },
  { label: 'Peanuts, handful', grams: 7 },
];

const item = (name: string, quantity: string, priority: 'High' | 'Medium' = 'High'): ShoppingItem => ({
  item: name,
  quantity,
  cost: '',
  priority,
});

export const REGION_PLANS: Record<NutritionRegion, RegionPlan> = {
  'west-africa': {
    foods: BUDGET_FOODS,
    meals: MEAL_PLAN.map((m) => ({ ...m, alternatives: MEAL_ALTERNATIVES[m.title] })),
    shopping: SHOPPING_LIST,
    total: SHOPPING_TOTAL,
    protein: PROTEIN_FOODS,
  },
  global: {
    foods: [
      'Oats — cheap, filling carbs',
      'Eggs — complete protein',
      'Canned beans & lentils — protein + fibre',
      'Peanut butter — calorie-dense fats',
      'Rice & potatoes — easy energy',
      'Canned tuna or sardines — lean protein',
      'Milk & plain yogurt — protein + calcium',
      'Frozen vegetables — cheap, no waste',
    ],
    meals: [
      { time: '7:00 AM', title: 'Breakfast', items: ['Oats cooked in milk', '1 banana', '1 spoon of peanut butter'], alternatives: [['3-egg scramble', '2 slices of toast', '1 glass of milk']] },
      { time: '10:00 AM', title: 'Mid-Morning', items: ['Plain yogurt', '1 piece of fruit'] },
      { time: '1:00 PM', title: 'Lunch', items: ['Rice', 'Beans or lentils', 'Chicken or tuna', 'Vegetables'], alternatives: [['Pasta', 'Tuna & tomato sauce', 'Side salad']] },
      { time: '4:00 PM', title: 'Pre-Workout', items: ['Toast with peanut butter', '1 banana'] },
      { time: '6:30 PM', title: 'Post-Workout', items: ['2 boiled eggs', '1 glass of milk'] },
      { time: '8:00 PM', title: 'Dinner', items: ['Potatoes', 'Chicken thigh or eggs', 'Frozen vegetables'], alternatives: [['Lentil soup', 'Bread', 'Cheese or yogurt']] },
    ],
    shopping: [
      item('Eggs', '24–30'), item('Oats', '1 kg'), item('Rice', '2 kg'), item('Canned beans / lentils', '4 cans'),
      item('Chicken thighs', '1.5 kg', 'Medium'), item('Canned tuna or sardines', '4 cans', 'Medium'), item('Milk', '4 liters'),
      item('Plain yogurt', '1 kg', 'Medium'), item('Peanut butter', '1 jar', 'Medium'), item('Potatoes', '2 kg'),
      item('Bananas', '1 bunch', 'Medium'), item('Frozen vegetables', '2 bags'),
    ],
    protein: GLOBAL_PROTEIN,
  },
  'south-asia': {
    foods: [
      'Dal (lentils) — everyday protein',
      'Chana & rajma — protein + fibre',
      'Eggs — complete protein',
      'Paneer — protein-rich',
      'Atta (wheat flour) for roti — energy',
      'Rice & poha — easy carbs',
      'Curd (dahi) — protein + gut health',
      'Peanuts — cheap healthy fats',
    ],
    meals: [
      { time: '7:00 AM', title: 'Breakfast', items: ['Poha or upma with peanuts', '2 boiled eggs or a besan chilla', 'Glass of milk'], alternatives: [['2 parathas', 'Bowl of curd', '1 banana']] },
      { time: '10:00 AM', title: 'Mid-Morning', items: ['Roasted chana', '1 banana'] },
      { time: '1:00 PM', title: 'Lunch', items: ['Rice', 'Dal', 'Vegetable sabzi', 'Bowl of curd'], alternatives: [['Rajma chawal', 'Salad', 'Buttermilk']] },
      { time: '4:00 PM', title: 'Pre-Workout', items: ['1 roti with peanut butter or jaggery', 'Tea or water'] },
      { time: '6:30 PM', title: 'Post-Workout', items: ['Paneer bhurji or 2 eggs', 'Glass of milk'] },
      { time: '8:00 PM', title: 'Dinner', items: ['3 rotis', 'Chicken curry or chana masala', 'Salad'] },
    ],
    shopping: [
      item('Dal (toor / moong)', '2 kg'), item('Chana & rajma', '1 kg each'), item('Eggs', '30'), item('Paneer', '500 g', 'Medium'),
      item('Atta', '5 kg'), item('Rice', '5 kg'), item('Poha', '1 kg', 'Medium'), item('Milk', '7 liters'), item('Curd', '1 kg', 'Medium'),
      item('Peanuts', '500 g', 'Medium'), item('Bananas', '1 dozen', 'Medium'), item('Seasonal vegetables', 'Various'),
    ],
    protein: [
      { label: 'Egg', grams: 6 },
      { label: 'Dal, 1 bowl', grams: 9 },
      { label: 'Chana or rajma, 1 cup', grams: 14 },
      { label: 'Paneer, 100 g', grams: 18 },
      { label: 'Curd, 1 bowl', grams: 8 },
      { label: 'Milk, 1 glass', grams: 8 },
      { label: 'Chicken, palm-size', grams: 30 },
      { label: 'Peanuts, handful', grams: 7 },
    ],
  },
  'east-asia': {
    foods: [
      'Rice — staple energy',
      'Tofu — cheap plant protein',
      'Eggs — complete protein',
      'Edamame & soybeans — protein + fibre',
      'Mackerel & sardines — omega-3',
      'Chicken — lean protein',
      'Sweet potato — complex carbs',
      'Soy milk — protein drink',
    ],
    meals: [
      { time: '7:00 AM', title: 'Breakfast', items: ['Rice porridge (congee) or rice', '2 eggs', 'Soy milk'], alternatives: [['Rice', 'Miso soup with tofu', 'Grilled fish']] },
      { time: '10:00 AM', title: 'Mid-Morning', items: ['Boiled edamame', '1 piece of fruit'] },
      { time: '1:00 PM', title: 'Lunch', items: ['Rice', 'Tofu or chicken stir-fry', 'Greens'], alternatives: [['Noodle soup', 'Egg', 'Chicken slices', 'Bok choy']] },
      { time: '4:00 PM', title: 'Pre-Workout', items: ['Rice ball or steamed sweet potato'] },
      { time: '6:30 PM', title: 'Post-Workout', items: ['Soy milk', '2 boiled eggs'] },
      { time: '8:00 PM', title: 'Dinner', items: ['Rice', 'Grilled mackerel or chicken', 'Kimchi or pickled vegetables'] },
    ],
    shopping: [
      item('Rice', '5 kg'), item('Tofu', '4 blocks'), item('Eggs', '30'), item('Frozen edamame', '1 kg', 'Medium'),
      item('Mackerel or sardines', '1 kg', 'Medium'), item('Chicken', '1.5 kg'), item('Sweet potatoes', '2 kg', 'Medium'),
      item('Soy milk', '4 liters'), item('Leafy greens', 'Various'), item('Noodles', '1 kg', 'Medium'),
    ],
    protein: [
      { label: 'Egg', grams: 6 },
      { label: 'Tofu, 100 g', grams: 9 },
      { label: 'Edamame, 1 cup', grams: 17 },
      { label: 'Fish, 1 portion', grams: 22 },
      { label: 'Chicken, palm-size', grams: 30 },
      { label: 'Soy milk, 1 glass', grams: 7 },
      { label: 'Natto or tempeh, 1 pack', grams: 15 },
      { label: 'Peanuts, handful', grams: 7 },
    ],
  },
  'latin-america': {
    foods: [
      'Black or pinto beans — protein + fibre',
      'Eggs — complete protein',
      'Rice — staple energy',
      'Corn tortillas — cheap carbs',
      'Oats — filling breakfast',
      'Chicken — lean protein',
      'Plantains — potassium & carbs',
      'Milk — for licuados',
    ],
    meals: [
      { time: '7:00 AM', title: 'Breakfast', items: ['Huevos revueltos (3 eggs)', '2 corn tortillas', 'Refried beans'], alternatives: [['Avena (oats) cooked in milk', '1 banana', 'Cinnamon']] },
      { time: '10:00 AM', title: 'Mid-Morning', items: ['Licuado: milk, banana and oats'] },
      { time: '1:00 PM', title: 'Lunch', items: ['Arroz', 'Frijoles', 'Pollo', 'Ensalada'], alternatives: [['Chicken tacos', 'Beans', 'Salsa & avocado']] },
      { time: '4:00 PM', title: 'Pre-Workout', items: ['Plátano cocido (boiled plantain)'] },
      { time: '6:30 PM', title: 'Post-Workout', items: ['2 eggs', 'Glass of milk'] },
      { time: '8:00 PM', title: 'Dinner', items: ['Tortillas', 'Chicken or beans', 'Avocado', 'Vegetables'] },
    ],
    shopping: [
      item('Beans (dry or canned)', '2 kg'), item('Eggs', '30'), item('Rice', '3 kg'), item('Corn tortillas', '2 packs'),
      item('Oats', '1 kg', 'Medium'), item('Chicken', '2 kg'), item('Plantains', '6', 'Medium'), item('Milk', '5 liters'),
      item('Avocados', '4', 'Medium'), item('Bananas', '1 bunch', 'Medium'), item('Vegetables', 'Various'),
    ],
    protein: [
      { label: 'Huevo (egg)', grams: 6 },
      { label: 'Frijoles, 1 cup', grams: 15 },
      { label: 'Pollo, palm-size', grams: 30 },
      { label: 'Licuado with milk', grams: 10 },
      { label: 'Queso fresco, 50 g', grams: 9 },
      { label: 'Milk, 1 glass', grams: 8 },
      { label: 'Tuna, 1 can', grams: 25 },
      { label: 'Peanuts, handful', grams: 7 },
    ],
  },
  mena: {
    foods: [
      'Lentils — soup and stews',
      'Chickpeas & hummus — protein + fats',
      'Fava beans (ful) — classic breakfast protein',
      'Eggs — complete protein',
      'Khubz / pita — everyday carbs',
      'Rice & bulgur — energy',
      'Yogurt & labneh — protein',
      'Dates — fast pre-workout fuel',
    ],
    meals: [
      { time: '7:00 AM', title: 'Breakfast', items: ['Ful medames', '2 eggs', 'Pita bread'], alternatives: [['Labneh with olive oil', 'Eggs', 'Pita', 'Cucumber & tomato']] },
      { time: '10:00 AM', title: 'Mid-Morning', items: ['3 dates', 'Handful of nuts'] },
      { time: '1:00 PM', title: 'Lunch', items: ['Rice or bulgur', 'Grilled chicken', 'Lentil soup', 'Salad'], alternatives: [['Mujadara (lentils & rice)', 'Yogurt', 'Salad']] },
      { time: '4:00 PM', title: 'Pre-Workout', items: ['Dates', 'Small bowl of yogurt'] },
      { time: '6:30 PM', title: 'Post-Workout', items: ['Labneh or yogurt', '2 boiled eggs'] },
      { time: '8:00 PM', title: 'Dinner', items: ['Hummus', 'Chicken or falafel', 'Bread', 'Salad'] },
    ],
    shopping: [
      item('Lentils', '2 kg'), item('Chickpeas', '1 kg'), item('Fava beans (ful)', '4 cans'), item('Eggs', '30'),
      item('Pita / khubz', '3 packs'), item('Rice or bulgur', '3 kg'), item('Chicken', '2 kg'), item('Yogurt or labneh', '1.5 kg'),
      item('Dates', '1 kg', 'Medium'), item('Olive oil', '1 bottle', 'Medium'), item('Vegetables', 'Various'),
    ],
    protein: [
      { label: 'Egg', grams: 6 },
      { label: 'Ful medames, 1 bowl', grams: 13 },
      { label: 'Hummus, 3 tbsp', grams: 4 },
      { label: 'Lentil soup, 1 bowl', grams: 9 },
      { label: 'Chicken, palm-size', grams: 30 },
      { label: 'Labneh or yogurt, 1 cup', grams: 12 },
      { label: 'Falafel, 3 pieces', grams: 8 },
      { label: 'Milk, 1 glass', grams: 8 },
    ],
  },
};

export function regionMealOptions(meal: RegionMeal): string[][] {
  return [meal.items, ...(meal.alternatives ?? [])];
}
