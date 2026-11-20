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
