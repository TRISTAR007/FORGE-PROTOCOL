/**
 * The Level Up Dojo coach cast — original characters (no existing anime
 * IP). Each coach has a look, a specialty, a voice profile for the
 * browser's speech engine, and English lines in their own personality.
 * Other languages fall back to translated generic lines (see voice.* in
 * the message catalogs), spoken with the same voice profile.
 */

export type CoachId = 'kaito' | 'ren' | 'mika' | 'ryu' | 'aiko' | 'zara' | 'leo' | 'nova';

export type CoachEvent = 'greet' | 'start' | 'work' | 'hold' | 'rest' | 'done' | 'pr';

export interface Coach {
  id: CoachId;
  name: string;
  title: string;
  specialty: string;
  element: string;
  /** Two-stop gradient for frames, auras and name plates. */
  colors: [string, string];
  bio: string;
  catchphrase: string;
  image: string;
  thumb: string;
  voice: { pitch: number; rate: number; gender: 'female' | 'male' };
  lines: Record<CoachEvent, string[]>;
}

const img = (id: CoachId) => ({ image: `/images/coaches/${id}.webp`, thumb: `/images/coaches/${id}-thumb.webp` });

export const COACHES: Coach[] = [
  {
    id: 'kaito',
    name: 'Kaito Blaze',
    title: 'The Blazing Rookie',
    specialty: 'Push & HIIT',
    element: 'Fire',
    colors: ['#FF8A3D', '#FF2E63'],
    bio: 'A rookie who turned every "impossible" into a warm-up. Kaito believes effort is a flame — feed it every day and it never goes out.',
    catchphrase: 'Burn brighter than yesterday!',
    ...img('kaito'),
    voice: { pitch: 1.15, rate: 1.12, gender: 'male' },
    lines: {
      greet: [
        "Another day, another level! Let's burn brighter than yesterday!",
        "You showed up — that's already a win. Now let's make it a big one!",
        'Heroes are built on ordinary days like this one. Ready?',
      ],
      start: ["Training arc: activated! Let's go!", 'Fists up — this session is ours!'],
      work: ['{exercise}! Set {set} of {sets}. Give me {reps}!', '{exercise}, {reps} reps. Every single one counts — go!'],
      hold: ["{exercise}! Hold for {seconds} seconds — don't you dare drop!", '{exercise}. {seconds} seconds of pure fire!'],
      rest: ['Breathe! {seconds} seconds. Next up: {next}!', 'Great set! Rest {seconds}. {next} is waiting for you!'],
      done: ["That's how heroes are made! Workout complete!", 'You burned bright today. Same time tomorrow?'],
      pr: ['New personal record! You just levelled up for real!'],
    },
  },
  {
    id: 'ren',
    name: 'Sensei Ren',
    title: 'The Quiet Blade',
    specialty: 'Mobility & Form',
    element: 'Wind',
    colors: ['#B4BEFF', '#6C7BFF'],
    bio: 'A swordsman who traded duels for discipline. Ren teaches that perfect form beats rushed reps, and that rest is part of the training.',
    catchphrase: 'Slow is smooth. Smooth is strong.',
    ...img('ren'),
    voice: { pitch: 0.85, rate: 0.9, gender: 'male' },
    lines: {
      greet: [
        'Slow is smooth, and smooth is strong. Let us begin.',
        'A calm mind moves a strong body. Welcome back.',
        'Today, we sharpen what we built yesterday.',
      ],
      start: ['Breathe in. Breathe out. We begin.', 'Focus. Every movement with intention.'],
      work: ['{exercise}. Set {set} of {sets}. {reps} reps — control every one.', '{exercise}. {reps} reps. Quality over speed.'],
      hold: ['{exercise}. Hold {seconds} seconds. Breathe through it.', 'Stillness is strength. {seconds} seconds.'],
      rest: ['Rest {seconds} seconds. Let the breath settle. Next: {next}.', 'Recover. {next} follows in {seconds} seconds.'],
      done: ['Well done. Discipline is a quiet victory.', 'You trained with honour today.'],
      pr: ['A new best. Your patience is paying off.'],
    },
  },
  {
    id: 'mika',
    name: 'Mika Star',
    title: 'The Stage Sprinter',
    specialty: 'Cardio & Rhythm',
    element: 'Light',
    colors: ['#FF7AC6', '#FFB86B'],
    bio: 'A pop idol who discovered her real stage was the training floor. Mika turns every cardio session into a concert — and you are the headliner.',
    catchphrase: 'Sparkle and sweat!',
    ...img('mika'),
    voice: { pitch: 1.45, rate: 1.15, gender: 'female' },
    lines: {
      greet: [
        'Hiii! Ready to sparkle and sweat today?',
        "Your fans are cheering — okay, it's me, I'm your fans! Let's go!",
        "Cardio party time! Let's shine!",
      ],
      start: ['Music on, energy up! Here we go!', "It's showtime! Let's make it a hit!"],
      work: ['{exercise}! Set {set} of {sets} — {reps} reps, keep the rhythm!', '{exercise}! {reps} reps, you look amazing!'],
      hold: ['{exercise} for {seconds} seconds — smile through it!', 'Hold it, superstar! {seconds} seconds!'],
      rest: ["Water break! {seconds} seconds. Then {next} — you've got this!", 'Quick breather! {next} is next!'],
      done: ['Encore! That was an amazing performance!', 'Standing ovation! You did it!'],
      pr: ["New record! You're a superstar!"],
    },
  },
  {
    id: 'ryu',
    name: 'Ryu Iron',
    title: 'The Steel Pilot',
    specialty: 'Strength & Equipment',
    element: 'Steel',
    colors: ['#3DE3F5', '#4F7CFF'],
    bio: 'A former mech pilot who decided his own body was the best machine to upgrade. Ryu runs the equipment wing of the dojo with calm precision.',
    catchphrase: 'Steel is forged by repetition.',
    ...img('ryu'),
    voice: { pitch: 0.7, rate: 0.95, gender: 'male' },
    lines: {
      greet: [
        'Systems online. Strength protocol ready.',
        'Steel is forged by repetition. Report for training.',
        'Today we move heavy things with perfect form.',
      ],
      start: ['Initiating session. All systems green.', 'Engage. Controlled power.'],
      work: ['{exercise}. Set {set} of {sets}. {reps} reps. Control the weight.', '{exercise}. {reps} reps. Full range of motion.'],
      hold: ['{exercise}. {seconds} second hold. Lock in.', 'Hold position. {seconds} seconds.'],
      rest: ['Recovery window: {seconds} seconds. Next target: {next}.', 'Cooling systems. {next} in {seconds} seconds.'],
      done: ['Mission complete. Strength levels increasing.', 'Session logged. Excellent output.'],
      pr: ['New record logged. Power output rising.'],
    },
  },
  {
    id: 'aiko',
    name: 'Aiko Frost',
    title: 'The Ice Guardian',
    specialty: 'Core & Holds',
    element: 'Ice',
    colors: ['#9BE7FF', '#5B8CFF'],
    bio: 'Cool, composed, and secretly very proud of you. Aiko guards the dojo’s core training — planks, holds and balance that make everything else stronger.',
    catchphrase: 'An unshakable core, an unshakable mind.',
    ...img('aiko'),
    voice: { pitch: 1.1, rate: 0.95, gender: 'female' },
    lines: {
      greet: [
        'Stay cool. A strong core is an unshakable mind.',
        "Hmph. You came back. Good. Let's get to work.",
        "Calm, precise, relentless. That's today's plan.",
      ],
      start: ['Focus. We begin now.', "Don't waste my time — or yours. Let's go."],
      work: ['{exercise}. Set {set} of {sets}. {reps} reps. Precise movements.', '{exercise}. {reps} reps. Keep it clean.'],
      hold: ["{exercise}. Hold for {seconds} seconds. Don't let the cold reach your core.", 'Freeze. {seconds} seconds.'],
      rest: ['{seconds} seconds of rest. Next: {next}. Stay focused.', 'Rest. {next} in {seconds} seconds.'],
      done: ['...Not bad at all. You did well today.', "Fine work. I'm — not impressed. Okay, a little."],
      pr: ["A new record? Impressive. Don't let it go to your head."],
    },
  },
  {
    id: 'zara',
    name: 'Zara Storm',
    title: 'The Lightning Sprinter',
    specialty: 'Legs & Speed',
    element: 'Lightning',
    colors: ['#FFD84A', '#2ED47A'],
    bio: 'The fastest feet in Lagos and the loudest cheer in the dojo. Zara builds legs that sprint, jump and never skip leg day.',
    catchphrase: "Lightning doesn't wait — neither do we!",
    ...img('zara'),
    voice: { pitch: 1.05, rate: 1.15, gender: 'female' },
    lines: {
      greet: [
        "Fast feet, strong legs, no excuses! Let's move!",
        "Lightning doesn't wait — and neither do we!",
        'Every step today makes you faster tomorrow.',
      ],
      start: ["On your marks... go go go!", 'Charge up! Here we go!'],
      work: ['{exercise}! Set {set} of {sets} — {reps} reps, fast and clean!', '{exercise}! {reps} reps, drive through those legs!'],
      hold: ['{exercise} for {seconds} seconds — feel that power charging!', 'Hold the charge! {seconds} seconds!'],
      rest: ['Recharge! {seconds} seconds. Next: {next}!', 'Shake it out! {next} is coming!'],
      done: ['Full charge! That was electric!', "You struck like lightning today!"],
      pr: ['Personal record — you just broke the speed limit!'],
    },
  },
  {
    id: 'leo',
    name: 'Leo Fang',
    title: 'The Wild Climber',
    specialty: 'Pull & Back',
    element: 'Beast',
    colors: ['#F5B841', '#7BC67E'],
    bio: 'Raised climbing cliffs with his wolf pup, Pip. Leo builds backs, grips and pull-ups the wild way — with a grin and a howl.',
    catchphrase: 'The pack trains together!',
    ...img('leo'),
    voice: { pitch: 0.95, rate: 1.08, gender: 'male' },
    lines: {
      greet: [
        'The pack trains together! Ready to climb?',
        "Strong back, strong spirit. Let's hunt some reps!",
        'Even Pip did his warm-up today. Your turn!',
      ],
      start: ['Awoo! Hunt begins now!', 'Grip it and rip it — safely! Go!'],
      work: ['{exercise}! Set {set} of {sets}, {reps} reps — pull like you mean it!', '{exercise}! {reps} reps, wild and strong!'],
      hold: ['{exercise}, {seconds} seconds — hold your ground!', "Don't let go! {seconds} seconds!"],
      rest: ['Rest up, {seconds} seconds. Next: {next}!', 'Catch your breath. {next} next!'],
      done: ['Awooo! The pack is proud of you!', 'Wild work today, champ!'],
      pr: ["New record! You're the alpha today!"],
    },
  },
  {
    id: 'nova',
    name: 'Nova Byte',
    title: 'The Data Mage',
    specialty: 'Stats & Smart Training',
    element: 'Code',
    colors: ['#B78CFF', '#3DE3F5'],
    bio: 'A genius gamer who min-maxes real life. Nova tracks every rep, spots your patterns, and turns progress into the most satisfying XP bar you have ever seen.',
    catchphrase: 'Grind XP in real life.',
    ...img('nova'),
    voice: { pitch: 1.25, rate: 1.2, gender: 'female' },
    lines: {
      greet: [
        "Data says you're more awesome when you train. Let's verify.",
        "Loading today's quest... done! Let's grind some XP.",
        'Your streak graph looks hungry. Feed it!',
      ],
      start: ['Quest started. Logging all reps.', 'Player one, ready. Go!'],
      work: ['{exercise}. Set {set} of {sets}. Target: {reps} reps.', '{exercise}. {reps} reps. Logging...'],
      hold: ['{exercise}. {seconds} seconds. Timer running.', 'Hold for {seconds}. Progress bar filling.'],
      rest: ['Cooldown: {seconds} seconds. Next quest: {next}.', 'Respawning in {seconds}. Next: {next}.'],
      done: ['Workout complete! XP gained. Stats updated.', 'Quest cleared! Saving progress.'],
      pr: ['New personal best detected! Adding it to your hall of fame.'],
    },
  },
];

export const DEFAULT_COACH: CoachId = 'kaito';

export function getCoach(id: string | undefined | null): Coach {
  return COACHES.find((c) => c.id === id) ?? COACHES[0];
}

/** Fills `{placeholders}` in a line. */
export function fillLine(line: string, vars: Record<string, string | number>): string {
  return line.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : ''));
}

/** Picks a line deterministically from a seed (e.g. the day number), so a page shows a stable greeting. */
export function pickLine(coach: Coach, event: CoachEvent, seed = 0): string {
  const lines = coach.lines[event];
  return lines[Math.abs(seed) % lines.length];
}

/** Which coach suits a workout split / exercise category best — used for "guest coach" moments. */
export const SPECIALTY_COACH: Record<string, CoachId> = {
  push: 'kaito',
  hiit: 'mika',
  cardio: 'mika',
  pull: 'leo',
  legs: 'zara',
  core: 'aiko',
  mobility: 'ren',
  recovery: 'ren',
  rest: 'ren',
  strength: 'ryu',
};
