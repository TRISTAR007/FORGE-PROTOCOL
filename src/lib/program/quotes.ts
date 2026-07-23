export const QUOTES: string[] = [
  'Day one is the hardest. You already won by starting. Consistency beats intensity every time.',
  'Recovery is when you grow. Respect the process.',
  "You're building the foundation. Every rep counts. Trust the process.",
  'Upper body strength is being built. Feel the muscles working.',
  'Leg day builds total body strength. Embrace the burn.',
  "Push through the discomfort. That's where the change happens.",
  'Rest is productive. Completing a week is huge — protect the streak.',
  'The only bad workout is the one that never happened.',
  "You're skinny or soft because of inputs, not genetics. Every meal and every set is a lever you control.",
  'Small, boring, repeated actions compound into a completely different body.',
  'Form first, ego last. Slow reps beat sloppy ones.',
  'Nobody sees day 47. Show up for it anyway.',
  'Posture, sleep, water — the free gains nobody wants to do.',
  'Progress is not linear. Some weeks it just looks like showing up.',
  'The body you want is built in the reps you almost skipped.',
];

export function quoteForDay(dayNumber: number): string {
  return QUOTES[dayNumber % QUOTES.length];
}
