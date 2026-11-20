import type { CoachId } from '@/lib/coaches';
import type { Difficulty, Equipment, WorkoutExercise } from '@/lib/types';

export type RoutineFocus = 'full' | 'upper' | 'lower' | 'core' | 'cardio' | 'mobility' | 'strength';

export interface Routine {
  id: string;
  name: string;
  coachId: CoachId;
  focus: RoutineFocus;
  /** Equipment needed beyond bodyweight ([] = none). */
  equipment: Equipment[];
  minutes: number;
  difficulty: Difficulty;
  description: string;
  exercises: WorkoutExercise[];
}

const e = (exerciseKey: string, sets: number, reps: string, rest: string, notes?: string): WorkoutExercise => ({
  exerciseKey,
  sets,
  reps,
  rest,
  notes,
});

/** Stand-alone quick workouts — playable any day, outside the 365-day plan. */
export const ROUTINES: Routine[] = [
  // ---- No equipment -------------------------------------------------------
  {
    id: 'hero-wakeup', name: 'Hero Wake-Up', coachId: 'kaito', focus: 'full', equipment: [], minutes: 8, difficulty: 'beginner',
    description: 'A short full-body spark to start any day.',
    exercises: [e('jumpingJack', 2, '30s', '15s'), e('bodyweightSquat', 2, '12', '20s'), e('inclinePushup', 2, '10', '20s'), e('plank', 2, '20s', '20s')],
  },
  {
    id: 'speedrun-10', name: '10-Minute Speedrun', coachId: 'nova', focus: 'full', equipment: [], minutes: 10, difficulty: 'beginner',
    description: 'The most XP per minute. Five moves, no excuses.',
    exercises: [e('jumpingJack', 2, '30s', '15s'), e('bodyweightSquat', 2, '15', '20s'), e('kneePushup', 2, '10', '20s'), e('mountainClimber', 2, '20s', '20s'), e('gluteBridge', 2, '15', '20s')],
  },
  {
    id: 'blazing-push', name: 'Blazing Fist Push', coachId: 'kaito', focus: 'upper', equipment: [], minutes: 15, difficulty: 'intermediate',
    description: 'Every push-up variation Kaito swears by.',
    exercises: [e('standardPushup', 3, '10', '45s'), e('wideGripPushup', 3, '10', '45s'), e('pikePushup', 3, '8', '60s'), e('diamondPushup', 2, '8', '60s'), e('shoulderTap', 2, '20 total', '30s')],
  },
  {
    id: 'idol-cardio', name: 'Idol Stage Cardio', coachId: 'mika', focus: 'cardio', equipment: [], minutes: 12, difficulty: 'beginner',
    description: 'Low-impact cardio with rhythm — great for beginners.',
    exercises: [e('jumpingJack', 3, '30s', '20s'), e('buttKicks', 3, '30s', '20s'), e('shadowBoxing', 3, '30s', '20s'), e('lateralShuffle', 3, '30s', '20s')],
  },
  {
    id: 'encore-hiit', name: 'Encore HIIT', coachId: 'mika', focus: 'cardio', equipment: [], minutes: 20, difficulty: 'advanced',
    description: 'A finale-level HIIT session. Bring water.',
    exercises: [e('burpee', 4, '10', '45s'), e('tuckJump', 3, '8', '45s'), e('skaterHop', 4, '30s', '30s'), e('mountainClimber', 4, '30s', '30s'), e('starJump', 3, '10', '45s')],
  },
  {
    id: 'quiet-blade-flow', name: 'Quiet Blade Flow', coachId: 'ren', focus: 'mobility', equipment: [], minutes: 12, difficulty: 'beginner',
    description: 'A calm mobility flow for hips, spine and shoulders.',
    exercises: [e('catCow', 1, '10', '0s'), e('worldGreatestStretch', 1, '5 each', '0s'), e('hipFlexorStretch', 1, '45s each', '0s'), e('openBook', 1, '8 each', '0s'), e('pigeonPose', 1, '60s each', '0s'), e('childPose', 1, '60s', '0s')],
  },
  {
    id: 'morning-kata', name: 'Morning Kata', coachId: 'ren', focus: 'mobility', equipment: [], minutes: 8, difficulty: 'beginner',
    description: 'Wake the joints up before the day starts.',
    exercises: [e('armCircles', 1, '30s', '0s'), e('legSwings', 1, '10 each', '0s'), e('inchworm', 2, '6', '20s'), e('deepSquatHold', 1, '60s', '0s'), e('wallAngel', 2, '10', '20s')],
  },
  {
    id: 'desk-reset', name: 'Desk Break Reset', coachId: 'ren', focus: 'mobility', equipment: [], minutes: 5, difficulty: 'beginner',
    description: 'Undo hours of sitting in five minutes.',
    exercises: [e('armCircles', 1, '30s', '0s'), e('wallAngel', 1, '10', '0s'), e('hipFlexorStretch', 1, '30s each', '0s'), e('cobraStretch', 1, '30s', '0s')],
  },
  {
    id: 'bedtime-cooldown', name: 'Bedtime Cooldown', coachId: 'ren', focus: 'mobility', equipment: [], minutes: 10, difficulty: 'beginner',
    description: 'Slow stretches that help you sleep.',
    exercises: [e('childPose', 1, '60s', '0s'), e('pigeonPose', 1, '45s each', '0s'), e('openBook', 1, '8 each', '0s'), e('cobraStretch', 1, '30s', '0s'), e('deepSquatHold', 1, '45s', '0s')],
  },
  {
    id: 'frozen-core', name: 'Frozen Core', coachId: 'aiko', focus: 'core', equipment: [], minutes: 12, difficulty: 'intermediate',
    description: 'Holds and slow reps for an unshakable middle.',
    exercises: [e('hollowHold', 3, '30s', '30s'), e('plank', 3, '40s', '30s'), e('sidePlank', 2, '30s each', '30s'), e('deadBug', 3, '10 each', '30s'), e('flutterKicks', 3, '30s', '30s')],
  },
  {
    id: 'glacier-abs', name: 'Glacier Abs Blitz', coachId: 'aiko', focus: 'core', equipment: [], minutes: 8, difficulty: 'beginner',
    description: 'A quick ab finisher you can add to any day.',
    exercises: [e('crunch', 2, '15', '20s'), e('heelTaps', 2, '20 total', '20s'), e('reverseCrunch', 2, '12', '20s'), e('russianTwist', 2, '20 total', '20s')],
  },
  {
    id: 'lightning-legs', name: 'Lightning Legs', coachId: 'zara', focus: 'lower', equipment: [], minutes: 18, difficulty: 'intermediate',
    description: 'Power, glutes and calves — never skip leg day.',
    exercises: [e('jumpSquat', 3, '10', '60s'), e('reverseLunge', 3, '10 each', '45s'), e('sumoSquat', 3, '15', '45s'), e('singleLegGluteBridge', 3, '10 each', '45s'), e('calfRaise', 3, '20', '30s')],
  },
  {
    id: 'storm-sprint', name: 'Storm Sprint Intervals', coachId: 'zara', focus: 'cardio', equipment: [], minutes: 10, difficulty: 'intermediate',
    description: 'Fast feet and short rests. Heart rate: up.',
    exercises: [e('fastFeet', 4, '20s', '20s'), e('highKnees', 4, '20s', '20s'), e('skaterHop', 3, '30s', '30s'), e('buttKicks', 3, '20s', '20s')],
  },
  {
    id: 'wild-back', name: 'Wild Back Builder', coachId: 'leo', focus: 'upper', equipment: [], minutes: 15, difficulty: 'beginner',
    description: 'Back and posture work with zero equipment.',
    exercises: [e('floorPull', 3, '10 each', '45s'), e('supermanHold', 3, '30s', '45s'), e('reverseSnowAngel', 3, '12', '45s'), e('doorframeRow', 3, '12', '45s'), e('birdDog', 3, '10 each', '30s')],
  },
  {
    id: 'optimized-full-body', name: 'Optimized Full Body', coachId: 'nova', focus: 'full', equipment: [], minutes: 20, difficulty: 'intermediate',
    description: 'Nova’s statistically balanced full-body session.',
    exercises: [e('bodyweightSquat', 3, '15', '45s'), e('standardPushup', 3, '12', '45s'), e('reverseLunge', 3, '10 each', '45s'), e('plank', 3, '40s', '30s'), e('inchworm', 2, '8', '30s'), e('burpee', 2, '8', '60s')],
  },
  {
    id: 'calisthenics-ascent', name: 'Calisthenics Ascent', coachId: 'kaito', focus: 'strength', equipment: [], minutes: 25, difficulty: 'advanced',
    description: 'Advanced bodyweight skills for the dedicated.',
    exercises: [e('archerPushup', 3, '6 each', '90s'), e('pseudoPlanchePushup', 3, '8', '90s'), e('assistedPistol', 3, '6 each', '90s'), e('vUp', 3, '12', '60s'), e('explosivePushup', 3, '6', '90s')],
  },
  {
    id: 'hundred-rep-trial', name: 'The 100-Rep Trial', coachId: 'kaito', focus: 'full', equipment: [], minutes: 20, difficulty: 'intermediate',
    description: '100 push-ups, 100 squats, 100 crunches — in sets.',
    exercises: [e('standardPushup', 5, '20', '60s', 'Drop to knees when needed'), e('bodyweightSquat', 5, '20', '45s'), e('crunch', 5, '20', '45s')],
  },

  // ---- Pull-up bar --------------------------------------------------------
  {
    id: 'pack-pullup-ladder', name: 'Pack Pull-up Ladder', coachId: 'leo', focus: 'upper', equipment: ['pullup-bar'], minutes: 15, difficulty: 'intermediate',
    description: 'Build your way to strong, clean pull-ups.',
    exercises: [e('scapularPullUp', 3, '10', '45s'), e('negativePullUp', 3, '5', '90s'), e('chinUp', 3, '6', '90s'), e('deadHang', 3, '30s', '60s'), e('hangingKneeRaise', 3, '10', '60s')],
  },

  // ---- Dumbbells ----------------------------------------------------------
  {
    id: 'steel-upper', name: 'Steel Upper Body', coachId: 'ryu', focus: 'upper', equipment: ['dumbbell'], minutes: 25, difficulty: 'intermediate',
    description: 'Press, row and arms with one pair of dumbbells.',
    exercises: [e('dbFloorPress', 4, '10', '75s'), e('dbRow', 4, '10 each', '60s'), e('dbShoulderPress', 3, '10', '75s'), e('dbBicepCurl', 3, '12', '45s'), e('dbTricepExtension', 3, '12', '45s')],
  },
  {
    id: 'mech-legs', name: 'Mech Leg Protocol', coachId: 'ryu', focus: 'lower', equipment: ['dumbbell'], minutes: 25, difficulty: 'intermediate',
    description: 'Squat, hinge and lunge with dumbbells.',
    exercises: [e('dbGobletSquat', 4, '12', '75s'), e('dbRomanianDeadlift', 4, '10', '90s'), e('dbLunge', 3, '10 each', '75s'), e('singleLegCalfRaise', 3, '12 each', '45s'), e('wallSit', 2, '45s', '45s')],
  },
  {
    id: 'db-full-burn', name: 'Dumbbell Full-Body Burn', coachId: 'kaito', focus: 'full', equipment: ['dumbbell'], minutes: 20, difficulty: 'intermediate',
    description: 'Thrusters, rows and squats for maximum burn.',
    exercises: [e('dbThruster', 4, '10', '60s'), e('dbRenegadeRow', 3, '8 each', '60s'), e('dbGobletSquat', 3, '15', '45s'), e('dbShoulderPress', 3, '10', '60s'), e('burpee', 2, '8', '60s')],
  },
  {
    id: 'arm-day-arc', name: 'Arm Day Arc', coachId: 'leo', focus: 'upper', equipment: ['dumbbell'], minutes: 15, difficulty: 'beginner',
    description: 'Biceps, triceps and shoulders. The pack approves.',
    exercises: [e('dbBicepCurl', 3, '12', '45s'), e('dbHammerCurl', 3, '10', '45s'), e('dbTricepExtension', 3, '12', '45s'), e('diamondPushup', 2, '10', '60s'), e('dbLateralRaise', 3, '15', '45s')],
  },

  // ---- Kettlebell / band / rope -----------------------------------------
  {
    id: 'kettlebell-storm', name: 'Kettlebell Swing Storm', coachId: 'zara', focus: 'full', equipment: ['kettlebell'], minutes: 12, difficulty: 'intermediate',
    description: 'Explosive hips and a strong grip with one bell.',
    exercises: [e('kbSwing', 5, '15', '45s'), e('kbDeadlift', 3, '10', '60s'), e('kbHalo', 2, '8 each way', '30s'), e('kbPress', 3, '6 each', '60s')],
  },
  {
    id: 'band-posture-fix', name: 'Band Posture Fix', coachId: 'ren', focus: 'upper', equipment: ['band'], minutes: 10, difficulty: 'beginner',
    description: 'Open up rounded shoulders with a resistance band.',
    exercises: [e('bandPullApart', 3, '20', '30s'), e('bandFacePull', 3, '15', '30s'), e('bandRow', 3, '12', '45s'), e('wallAngel', 2, '10', '30s')],
  },
  {
    id: 'band-total-body', name: 'Band Total Body', coachId: 'mika', focus: 'full', equipment: ['band'], minutes: 15, difficulty: 'beginner',
    description: 'A full workout that fits in a backpack.',
    exercises: [e('bandChestPress', 3, '12', '45s'), e('bandRow', 3, '12', '45s'), e('bandLateralWalk', 3, '12 each way', '30s'), e('bandCurl', 3, '12', '30s'), e('bandTricepPushdown', 3, '12', '30s')],
  },
  {
    id: 'rope-rhythm', name: 'Rope Rhythm', coachId: 'mika', focus: 'cardio', equipment: ['jump-rope'], minutes: 12, difficulty: 'intermediate',
    description: 'Skipping intervals — feel the beat.',
    exercises: [e('jumpRopeBasic', 5, '60s', '30s'), e('fastFeet', 3, '20s', '20s'), e('doubleUnders', 3, '20s', '45s')],
  },

  // ---- Gym ----------------------------------------------------------------
  {
    id: 'iron-dojo-strength', name: 'Iron Dojo Strength', coachId: 'ryu', focus: 'strength', equipment: ['barbell', 'bench'], minutes: 45, difficulty: 'advanced',
    description: 'Heavy fives on the big lifts. Use a spotter.',
    exercises: [e('bbBackSquat', 5, '5', '180s'), e('bbBenchPress', 5, '5', '180s'), e('bbRow', 4, '8', '120s'), e('bbHipThrust', 3, '10', '90s')],
  },
  {
    id: 'gym-push-day', name: 'Gym Push Day', coachId: 'kaito', focus: 'upper', equipment: ['barbell', 'bench', 'dumbbell', 'cable'], minutes: 40, difficulty: 'intermediate',
    description: 'Chest, shoulders and triceps in the gym.',
    exercises: [e('bbBenchPress', 4, '6', '150s'), e('bbOverheadPress', 3, '6', '120s'), e('dbBenchPress', 3, '10', '90s'), e('dbLateralRaise', 3, '15', '45s'), e('cableTricepPushdown', 3, '12', '45s')],
  },
  {
    id: 'gym-pull-day', name: 'Gym Pull Day', coachId: 'leo', focus: 'upper', equipment: ['pullup-bar', 'machine', 'cable', 'dumbbell'], minutes: 40, difficulty: 'intermediate',
    description: 'Back, rear delts and biceps in the gym.',
    exercises: [e('pullUp', 4, '6', '120s'), e('latPulldown', 3, '10', '75s'), e('seatedCableRow', 3, '10', '75s'), e('cableFacePull', 3, '15', '45s'), e('dbHammerCurl', 3, '10', '45s')],
  },
  {
    id: 'gym-leg-day', name: 'Gym Leg Day', coachId: 'zara', focus: 'lower', equipment: ['barbell', 'machine'], minutes: 40, difficulty: 'intermediate',
    description: 'Squats, hinges and machines for complete legs.',
    exercises: [e('bbBackSquat', 4, '6', '150s'), e('bbRomanianDeadlift', 3, '8', '120s'), e('legPress', 3, '12', '90s'), e('legCurl', 3, '12', '60s'), e('legExtension', 3, '15', '60s')],
  },
  {
    id: 'machine-starter', name: 'Machine Starter Circuit', coachId: 'nova', focus: 'full', equipment: ['machine', 'cable'], minutes: 30, difficulty: 'beginner',
    description: 'A guided first gym session on machines.',
    exercises: [e('chestPressMachine', 3, '12', '60s'), e('latPulldown', 3, '12', '60s'), e('legPress', 3, '12', '60s'), e('seatedCableRow', 3, '12', '60s'), e('cableWoodchop', 2, '10 each', '45s')],
  },
];

export function getRoutine(id: string): Routine | undefined {
  return ROUTINES.find((r) => r.id === id);
}

// ---------------------------------------------------------------------
// Training arcs — 30-day progressive challenges
// ---------------------------------------------------------------------

export interface Arc {
  id: string;
  name: string;
  coachId: CoachId;
  exerciseKey: string;
  unit: 'reps' | 'seconds';
  /** Target on day 1, and how much it grows each training day. */
  start: number;
  step: number;
  days: number;
  description: string;
  equipment: Equipment[];
}

/** Every 7th arc day is a rest day. */
export const ARC_REST_EVERY = 7;

export const ARCS: Arc[] = [
  { id: 'pushup-arc', name: 'Push-up Arc', coachId: 'kaito', exerciseKey: 'standardPushup', unit: 'reps', start: 10, step: 2, days: 30, equipment: [], description: 'From 10 push-ups to 60 in 30 days. Split them into as many sets as you need.' },
  { id: 'squat-arc', name: 'Squat Arc', coachId: 'zara', exerciseKey: 'bodyweightSquat', unit: 'reps', start: 20, step: 3, days: 30, equipment: [], description: 'Build legs that never quit: 20 squats up to 95.' },
  { id: 'plank-arc', name: 'Plank Arc', coachId: 'aiko', exerciseKey: 'plank', unit: 'seconds', start: 20, step: 5, days: 30, equipment: [], description: 'From a 20-second plank to over two minutes.' },
  { id: 'jack-arc', name: 'Jumping Jack Arc', coachId: 'mika', exerciseKey: 'jumpingJack', unit: 'reps', start: 30, step: 5, days: 30, equipment: [], description: 'Cardio every day, growing a little each time.' },
  { id: 'hang-arc', name: 'Grip Arc', coachId: 'leo', exerciseKey: 'deadHang', unit: 'seconds', start: 15, step: 2, days: 30, equipment: ['pullup-bar'], description: 'Dead hangs for a grip that never lets go.' },
  { id: 'flex-arc', name: 'Flexibility Arc', coachId: 'ren', exerciseKey: 'deepSquatHold', unit: 'seconds', start: 30, step: 5, days: 30, equipment: [], description: 'A daily deep squat hold to open hips and ankles.' },
];

export function getArc(id: string): Arc | undefined {
  return ARCS.find((a) => a.id === id);
}

export function isArcRestDay(arcDay: number): boolean {
  return arcDay % ARC_REST_EVERY === 0;
}

/** Target for a given arc day (rest days still return the previous day's number for display). */
export function arcTarget(arc: Arc, arcDay: number): number {
  const trainingDaysSoFar = arcDay - Math.floor(arcDay / ARC_REST_EVERY);
  return arc.start + arc.step * Math.max(0, trainingDaysSoFar - 1);
}
