import type { DayTemplate, Phase, ResolvedWorkout, SplitDay, TrainingMode, WorkoutExercise } from '@/lib/types';
import { addDays, formatLongDate } from '@/lib/utils';
import { quoteForDay } from './quotes';

export const PROGRAM_LENGTH_DAYS = 365;

export const PHASES: Phase[] = [
  { id: 1, name: 'Foundation', weeks: '1-8', description: 'Building movement patterns and base work capacity' },
  { id: 2, name: 'Muscle Growth', weeks: '9-16', description: 'Hypertrophy focus with increased volume' },
  { id: 3, name: 'Strength', weeks: '17-24', description: 'Lower reps, higher intensity, strength focus' },
  { id: 4, name: 'Athletic Development', weeks: '25-32', description: 'Power, speed, and explosive movement' },
  { id: 5, name: 'Advanced Calisthenics', weeks: '33-40', description: 'Skill work and advanced progressions' },
  { id: 6, name: 'Peak Performance', weeks: '41-52', description: 'Integration and peak physique development' },
];

export function getPhase(weekNumber: number): Phase {
  if (weekNumber <= 8) return PHASES[0];
  if (weekNumber <= 16) return PHASES[1];
  if (weekNumber <= 24) return PHASES[2];
  if (weekNumber <= 32) return PHASES[3];
  if (weekNumber <= 40) return PHASES[4];
  return PHASES[5];
}

/** Phase 1-2 => tier 0 (beginner), phase 3-4 => tier 1 (intermediate), phase 5-6 => tier 2 (advanced). */
function tierForPhase(phaseId: number): 0 | 1 | 2 {
  if (phaseId <= 2) return 0;
  if (phaseId <= 4) return 1;
  return 2;
}

function ex(exerciseKey: string, sets: number, reps: string, rest: string, notes?: string): WorkoutExercise {
  return { exerciseKey, sets, reps, rest, notes };
}

const WARMUP_DYNAMIC = [
  { exercise: 'Jumping Jacks', duration: '2 min' },
  { exercise: 'Arm Circles', reps: '20 forward, 20 back' },
  { exercise: 'Leg Swings', reps: '10 each leg' },
  { exercise: 'Bodyweight Squats', reps: '10' },
];

const WARMUP_LIGHT = [
  { exercise: 'Light Walking / Jog in Place', duration: '3 min' },
  { exercise: 'Cat-Cow', reps: '10' },
  { exercise: "World's Greatest Stretch", reps: '5 each side' },
];

const COOLDOWN_STANDARD = [
  { exercise: "Child's Pose", duration: '2 min' },
  { exercise: 'Chest Stretch', duration: '1 min each side' },
  { exercise: 'Deep Breathing', duration: '2 min' },
];

const COOLDOWN_LEGS = [
  { exercise: 'Pigeon Pose', duration: '2 min each side' },
  { exercise: 'Hamstring Stretch', duration: '2 min each leg' },
  { exercise: "Child's Pose", duration: '2 min' },
];

const CHECKLIST_TRAINING = [
  'Completed the warm-up',
  'All exercises performed with good form',
  'Drank water during the workout',
  'Completed the cooldown',
  'Post-workout meal within 1 hour',
  '8+ hours of sleep tonight',
];

const CHECKLIST_RECOVERY = [
  'Completed the mobility routine',
  'Went for a 15-20 min walk',
  'Drank 3L of water today',
  'Practiced good posture all day',
  'In bed on time',
];

const CHECKLIST_REST = [
  'No training today — full recovery',
  'Ate enough to support recovery',
  'Stretched or foam rolled if available',
  'Reflected on this week',
  'Planned next week',
];

/**
 * The weekly split. Each training day carries three exercise tiers
 * (beginner / intermediate / advanced) so the program genuinely
 * progresses as the user advances through the six macro phases,
 * instead of repeating the same week 52 times with a relabeled name.
 */
export const SPLIT: Record<number, DayTemplate> = {
  1: {
    slot: 1,
    split: 'push',
    label: 'Push Day',
    isRestDay: false,
    focus: 'Chest · Shoulders · Triceps',
    baseDuration: '30-40 min',
    kcalEstimate: '180-240',
    warmup: WARMUP_DYNAMIC,
    cooldown: COOLDOWN_STANDARD,
    checklist: CHECKLIST_TRAINING,
    tiers: [
      [
        ex('kneePushup', 3, '8-12', '60s', 'Focus on form'),
        ex('inclinePushup', 3, '10-15', '60s', 'Use a bed or chair'),
        ex('chairDip', 3, '8-12', '60s'),
        ex('scapularPushup', 2, '15', '60s', 'Shoulder health'),
        ex('plank', 3, '20-30s', '60s'),
      ],
      [
        ex('standardPushup', 3, '8-15', '90s'),
        ex('pikePushup', 3, '6-10', '90s'),
        ex('chairDip', 3, '12-15', '60s'),
        ex('diamondPushup', 2, '6-8', '90s', 'Knees down if needed'),
        ex('plank', 3, '40-50s', '60s'),
      ],
      [
        ex('standardPushup', 4, '15-20', '75s', 'Slow eccentric'),
        ex('diamondPushup', 3, '10-12', '90s'),
        ex('pikePushup', 4, '10-12', '90s'),
        ex('chairDip', 3, '15-20', '60s'),
        ex('plank', 3, '60s+', '60s'),
      ],
    ],
  },
  2: {
    slot: 2,
    split: 'pull',
    label: 'Pull & Back',
    isRestDay: false,
    focus: 'Back · Rear Delts · Posture',
    baseDuration: '25-35 min',
    kcalEstimate: '150-200',
    warmup: WARMUP_LIGHT,
    cooldown: COOLDOWN_STANDARD,
    checklist: CHECKLIST_TRAINING,
    tiers: [
      [
        ex('backpackRow', 3, '10-15', '60s', 'Use a light pack'),
        ex('floorPull', 2, '10 each', '60s', 'Y-T-W positions'),
        ex('supermanHold', 3, '20-30s', '60s'),
        ex('reverseSnowAngel', 3, '12', '60s'),
        ex('scapularPushup', 2, '15', '60s'),
      ],
      [
        ex('towelRow', 3, '8-12', '90s', 'Secure the door anchor'),
        ex('doorframeRow', 3, '10-12', '60s'),
        ex('supermanHold', 3, '30-40s', '60s'),
        ex('floorPull', 3, '12 each', '60s'),
        ex('birdDog', 3, '10 each', '45s'),
      ],
      [
        ex('towelRow', 4, '12-15', '90s'),
        ex('doorframeRow', 4, '12-15', '60s'),
        ex('supermanHold', 3, '45s', '60s'),
        ex('reverseSnowAngel', 3, '15', '60s'),
        ex('birdDog', 3, '12 each', '45s'),
      ],
    ],
  },
  3: {
    slot: 3,
    split: 'legs',
    label: 'Leg Day',
    isRestDay: false,
    focus: 'Legs · Glutes · Calves',
    baseDuration: '35-45 min',
    kcalEstimate: '200-260',
    warmup: WARMUP_DYNAMIC,
    cooldown: COOLDOWN_LEGS,
    checklist: CHECKLIST_TRAINING,
    tiers: [
      [
        ex('bodyweightSquat', 3, '15-20', '60s', 'Slow tempo'),
        ex('splitSquat', 3, '10 each', '60s'),
        ex('gluteBridge', 3, '15-20', '60s'),
        ex('calfRaise', 3, '20-25', '45s'),
        ex('wallSit', 3, '30s', '60s'),
      ],
      [
        ex('bulgarianSplitSquat', 3, '8-12 each', '90s', 'Rear foot on a chair'),
        ex('walkingLunge', 3, '12 each', '60s'),
        ex('gluteBridge', 4, '20', '60s', 'Hold 2s at the top'),
        ex('calfRaise', 3, '25', '45s'),
        ex('wallSit', 3, '45s', '60s'),
      ],
      [
        ex('bulgarianSplitSquat', 4, '12-15 each', '90s'),
        ex('walkingLunge', 4, '15 each', '60s'),
        ex('squatToReach', 4, '15', '45s'),
        ex('calfRaise', 4, '25-30', '45s'),
        ex('wallSit', 3, '60s', '60s'),
      ],
    ],
  },
  4: {
    slot: 4,
    split: 'core',
    label: 'Core & Posture',
    isRestDay: false,
    focus: 'Abs · Lower Back · Alignment',
    baseDuration: '20-25 min',
    kcalEstimate: '130-170',
    warmup: WARMUP_LIGHT,
    cooldown: COOLDOWN_STANDARD,
    checklist: CHECKLIST_TRAINING,
    tiers: [
      [
        ex('plank', 3, '20-30s', '60s'),
        ex('deadBug', 3, '10 each', '60s'),
        ex('bicycleCrunch', 3, '20 total', '60s'),
        ex('birdDog', 3, '10 each', '45s'),
        ex('catCow', 1, '10', '0s', 'Reset the spine'),
      ],
      [
        ex('plank', 3, '40-50s', '60s'),
        ex('legRaise', 3, '10-15', '60s'),
        ex('mountainClimber', 3, '30s', '60s'),
        ex('sidePlank', 2, '20-30s each', '45s'),
        ex('bicycleCrunch', 3, '25 total', '60s'),
      ],
      [
        ex('plank', 3, '60s+', '60s'),
        ex('legRaise', 3, '15-20', '60s'),
        ex('mountainClimber', 4, '40s', '60s'),
        ex('sidePlank', 3, '30-40s each', '45s'),
        ex('bicycleCrunch', 4, '30 total', '60s'),
      ],
    ],
  },
  5: {
    slot: 5,
    split: 'hiit',
    label: 'Full Body HIIT',
    isRestDay: false,
    focus: 'Total Body Conditioning',
    baseDuration: '20-30 min',
    kcalEstimate: '220-280',
    warmup: WARMUP_DYNAMIC,
    cooldown: COOLDOWN_STANDARD,
    checklist: CHECKLIST_TRAINING,
    tiers: [
      [
        ex('squatToReach', 3, '12', '45s'),
        ex('mountainClimber', 3, '20s', '45s'),
        ex('inclinePushup', 3, '10', '45s'),
        ex('highKnees', 3, '20s', '30s'),
        ex('stepBackBurpee', 3, '6-8', '60s'),
      ],
      [
        ex('squatToReach', 4, '15', '45s'),
        ex('mountainClimber', 4, '30s', '45s'),
        ex('standardPushup', 4, '10', '45s'),
        ex('highKnees', 4, '30s', '30s'),
        ex('stepBackBurpee', 4, '8-10', '60s'),
      ],
      [
        ex('squatToReach', 4, '20', '30s'),
        ex('mountainClimber', 4, '40s', '30s'),
        ex('standardPushup', 4, '15', '45s'),
        ex('highKnees', 4, '40s', '20s'),
        ex('stepBackBurpee', 4, '12-15', '45s'),
      ],
    ],
  },
  6: {
    slot: 6,
    split: 'recovery',
    label: 'Active Recovery',
    isRestDay: true,
    focus: 'Mobility & Light Movement',
    baseDuration: '15-20 min',
    kcalEstimate: '—',
    warmup: [],
    cooldown: [],
    tiers: [],
    checklist: CHECKLIST_RECOVERY,
    restNote:
      'Light walk, a full mobility pass, and extra water. Muscles grow on rest days — this one still matters.',
  },
  7: {
    slot: 7,
    split: 'rest',
    label: 'Rest Day',
    isRestDay: true,
    focus: 'Full Recovery',
    baseDuration: '—',
    kcalEstimate: '—',
    warmup: [],
    cooldown: [],
    tiers: [],
    checklist: CHECKLIST_REST,
    restNote: 'No training. Sleep well, eat well, stay loose. Push Day is back tomorrow.',
  },
};

export function splitLabel(split: SplitDay): string {
  const map: Record<SplitDay, string> = {
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    core: 'Core',
    hiit: 'HIIT',
    recovery: 'Recovery',
    rest: 'Rest',
  };
  return map[split];
}

/**
 * Equipment versions of the same weekly split. Same days, same phases,
 * and — deliberately — the same five exercises per training day as the
 * home program, so day completion, streaks and logs stay valid if
 * someone switches mode mid-year. Keyed by split slot (1–5).
 */
const MODE_TIERS: Record<Exclude<TrainingMode, 'home'>, Record<number, WorkoutExercise[][]>> = {
  dumbbells: {
    1: [
      [ex('dbFloorPress', 3, '10-12', '75s'), ex('dbShoulderPress', 3, '8-12', '75s'), ex('inclinePushup', 3, '10-15', '60s'), ex('dbTricepExtension', 3, '10-12', '60s'), ex('plank', 3, '20-30s', '60s')],
      [ex('dbFloorPress', 4, '8-12', '75s'), ex('dbArnoldPress', 3, '8-10', '90s'), ex('standardPushup', 3, '10-15', '60s'), ex('dbLateralRaise', 3, '12-15', '60s'), ex('dbTricepExtension', 3, '12-15', '60s')],
      [ex('dbFloorPress', 4, '10-12', '75s', 'Slow lowering'), ex('dbShoulderPress', 4, '8-10', '90s'), ex('declinePushup', 3, '10-15', '75s'), ex('dbLateralRaise', 4, '12-15', '45s'), ex('diamondPushup', 3, '10-12', '75s')],
    ],
    2: [
      [ex('dbRow', 3, '10 each', '60s'), ex('dbBicepCurl', 3, '10-12', '60s'), ex('supermanHold', 3, '20-30s', '60s'), ex('reverseSnowAngel', 3, '12', '60s'), ex('dbShrug', 3, '12-15', '60s')],
      [ex('dbRow', 4, '10 each', '60s'), ex('dbRomanianDeadlift', 3, '10-12', '90s'), ex('dbHammerCurl', 3, '10-12', '60s'), ex('reverseSnowAngel', 3, '15', '60s'), ex('dbBicepCurl', 3, '10-12', '60s')],
      [ex('dbRenegadeRow', 3, '8 each', '75s'), ex('dbRow', 4, '12 each', '60s'), ex('dbRomanianDeadlift', 4, '10', '90s'), ex('dbHammerCurl', 3, '12', '60s'), ex('dbShrug', 3, '15', '60s')],
    ],
    3: [
      [ex('dbGobletSquat', 3, '12-15', '75s'), ex('reverseLunge', 3, '10 each', '60s'), ex('gluteBridge', 3, '15-20', '60s'), ex('calfRaise', 3, '20', '45s'), ex('wallSit', 3, '30s', '60s')],
      [ex('dbGobletSquat', 4, '10-12', '75s'), ex('dbRomanianDeadlift', 3, '10-12', '90s'), ex('dbLunge', 3, '10 each', '75s'), ex('singleLegGluteBridge', 3, '10 each', '60s'), ex('singleLegCalfRaise', 3, '12 each', '45s')],
      [ex('dbGobletSquat', 4, '12-15', '75s'), ex('bulgarianSplitSquat', 4, '10 each', '90s'), ex('dbRomanianDeadlift', 4, '10', '90s'), ex('jumpSquat', 3, '10', '75s'), ex('singleLegCalfRaise', 4, '15 each', '45s')],
    ],
    4: [
      [ex('plank', 3, '30s', '60s'), ex('deadBug', 3, '10 each', '60s'), ex('russianTwist', 3, '20 total', '45s'), ex('birdDog', 3, '10 each', '45s'), ex('catCow', 1, '10', '0s')],
      [ex('hollowHold', 3, '30s', '45s'), ex('russianTwist', 3, '20 total', '45s', 'Hold a dumbbell'), ex('legRaise', 3, '12', '60s'), ex('sidePlank', 2, '30s each', '45s'), ex('shoulderTap', 3, '20 total', '45s')],
      [ex('hollowHold', 3, '40s', '45s'), ex('vUp', 3, '10', '60s'), ex('sidePlankHipDip', 3, '10 each', '45s'), ex('mountainClimber', 4, '40s', '60s'), ex('plankWalkup', 3, '10', '60s')],
    ],
    5: [
      [ex('dbThruster', 3, '10', '60s'), ex('jumpingJack', 3, '30s', '30s'), ex('dbRow', 3, '10 each', '45s'), ex('highKnees', 3, '20s', '30s'), ex('stepBackBurpee', 3, '6-8', '60s')],
      [ex('dbThruster', 4, '12', '60s'), ex('skaterHop', 3, '30s', '45s'), ex('dbGobletSquat', 3, '15', '45s'), ex('mountainClimber', 4, '30s', '45s'), ex('burpee', 3, '8', '60s')],
      [ex('dbThruster', 4, '15', '60s'), ex('tuckJump', 3, '8', '60s'), ex('dbRenegadeRow', 3, '8 each', '60s'), ex('skaterHop', 4, '40s', '45s'), ex('burpee', 4, '10', '60s')],
    ],
  },
  gym: {
    1: [
      [ex('chestPressMachine', 3, '10-12', '75s'), ex('dbShoulderPress', 3, '10', '75s'), ex('dbLateralRaise', 3, '12-15', '60s'), ex('cableTricepPushdown', 3, '12-15', '60s'), ex('plank', 3, '30s', '60s')],
      [ex('bbBenchPress', 4, '6-8', '150s'), ex('dbShoulderPress', 3, '8-10', '90s'), ex('dbBenchPress', 3, '10-12', '90s'), ex('dbLateralRaise', 3, '15', '45s'), ex('cableTricepPushdown', 3, '12', '60s')],
      [ex('bbBenchPress', 5, '5', '180s'), ex('bbOverheadPress', 4, '5-6', '150s'), ex('dbBenchPress', 3, '10', '90s'), ex('dbLateralRaise', 4, '15', '45s'), ex('dbTricepExtension', 3, '10-12', '60s')],
    ],
    2: [
      [ex('latPulldown', 3, '10-12', '75s'), ex('seatedCableRow', 3, '10-12', '75s'), ex('cableFacePull', 3, '15', '45s'), ex('dbBicepCurl', 3, '12', '60s'), ex('deadHang', 3, '20-30s', '60s')],
      [ex('negativePullUp', 3, '5', '90s'), ex('bbRow', 4, '8', '120s'), ex('latPulldown', 3, '10', '75s'), ex('cableFacePull', 3, '15', '45s'), ex('dbHammerCurl', 3, '10', '60s')],
      [ex('pullUp', 4, '6-8', '120s'), ex('bbRow', 4, '6-8', '120s'), ex('seatedCableRow', 3, '10', '75s'), ex('cableFacePull', 3, '15', '45s'), ex('dbBicepCurl', 3, '10', '60s')],
    ],
    3: [
      [ex('legPress', 3, '12', '90s'), ex('dbGobletSquat', 3, '12', '75s'), ex('legCurl', 3, '12', '60s'), ex('legExtension', 3, '12', '60s'), ex('calfRaise', 3, '20', '45s')],
      [ex('bbBackSquat', 4, '6-8', '150s'), ex('bbRomanianDeadlift', 3, '8-10', '120s'), ex('legPress', 3, '10-12', '90s'), ex('legCurl', 3, '12', '60s'), ex('singleLegCalfRaise', 3, '12 each', '45s')],
      [ex('bbBackSquat', 5, '5', '180s'), ex('bbDeadlift', 3, '5', '180s'), ex('bbHipThrust', 4, '8-10', '90s'), ex('bulgarianSplitSquat', 3, '8 each', '90s'), ex('legExtension', 3, '12-15', '60s')],
    ],
    4: [
      [ex('plank', 3, '30s', '60s'), ex('cableWoodchop', 3, '10 each', '45s'), ex('deadBug', 3, '10 each', '45s'), ex('reverseCrunch', 3, '12', '45s'), ex('catCow', 1, '10', '0s')],
      [ex('hangingKneeRaise', 3, '10-12', '60s'), ex('cableWoodchop', 3, '12 each', '45s'), ex('hollowHold', 3, '30s', '45s'), ex('sidePlank', 2, '30s each', '45s'), ex('russianTwist', 3, '20 total', '45s')],
      [ex('hangingKneeRaise', 4, '12-15', '60s'), ex('cableWoodchop', 4, '12 each', '45s'), ex('vUp', 3, '12', '60s'), ex('hollowHold', 3, '45s', '45s'), ex('plankWalkup', 3, '10', '60s')],
    ],
    5: [
      [ex('kbSwing', 3, '15', '60s'), ex('jumpRopeBasic', 3, '60s', '30s'), ex('dbThruster', 3, '10', '60s'), ex('mountainClimber', 3, '30s', '45s'), ex('jumpingJack', 3, '30s', '30s')],
      [ex('kbSwing', 4, '15', '60s'), ex('jumpRopeBasic', 4, '60s', '30s'), ex('dbThruster', 3, '12', '60s'), ex('burpee', 3, '8', '60s'), ex('skaterHop', 3, '30s', '45s')],
      [ex('kbSwing', 5, '15', '60s'), ex('doubleUnders', 4, '30s', '60s'), ex('dbThruster', 4, '12', '60s'), ex('burpee', 4, '10', '60s'), ex('tuckJump', 3, '8', '60s')],
    ],
  },
};

export const TRAINING_MODE_LABELS: Record<TrainingMode, string> = {
  home: 'Home · bodyweight',
  dumbbells: 'Home · dumbbells',
  gym: 'Full gym',
};

function tiersFor(slot: number, mode: TrainingMode): WorkoutExercise[][] {
  const template = SPLIT[slot];
  if (mode === 'home' || template.isRestDay) return template.tiers;
  return MODE_TIERS[mode][slot] ?? template.tiers;
}

const TIER_PHASES = ['Phases 1–2', 'Phases 3–4', 'Phases 5–6'];

export interface ExerciseUsage {
  dayLabel: string;
  phases: string;
  prescription: string;
}

/** Where an exercise appears in the weekly split (every training mode), with sets/reps per phase tier. */
export function getExerciseUsage(exerciseKey: string): ExerciseUsage[] {
  const usage: ExerciseUsage[] = [];
  for (const mode of ['home', 'dumbbells', 'gym'] as TrainingMode[]) {
    for (const template of Object.values(SPLIT)) {
      tiersFor(template.slot, mode).forEach((tier, tierIndex) => {
        for (const slot of tier) {
          if (slot.exerciseKey !== exerciseKey) continue;
          usage.push({
            dayLabel: mode === 'home' ? template.label : `${template.label} (${TRAINING_MODE_LABELS[mode]})`,
            phases: TIER_PHASES[tierIndex],
            prescription: `${slot.sets} × ${slot.reps ?? `${slot.timeSeconds}s`}`,
          });
        }
      });
    }
  }
  return usage;
}

/**
 * Resolves everything about a given day of the 365-day program: which
 * split it falls on, which phase (and therefore which exercise tier)
 * applies, and the fully-built workout for that day in the chosen mode.
 */
export function resolveWorkout(dayNumber: number, programStartDate: Date, mode: TrainingMode = 'home'): ResolvedWorkout {
  const day = Math.min(Math.max(dayNumber, 1), PROGRAM_LENGTH_DAYS);
  const weekNumber = Math.ceil(day / 7);
  const slot = ((day - 1) % 7) + 1;
  const template = SPLIT[slot];
  const phase = getPhase(weekNumber);
  const tierIndex = tierForPhase(phase.id);
  const intensity = tierIndex === 0 ? 'beginner' : tierIndex === 1 ? 'intermediate' : 'advanced';
  const date = addDays(programStartDate, day - 1);

  return {
    dayNumber: day,
    date,
    weekNumber,
    phase: phase.id,
    split: template.split,
    label: template.label,
    isRestDay: template.isRestDay,
    intensity,
    focus: template.focus,
    duration: template.baseDuration,
    kcalEstimate: template.kcalEstimate,
    warmup: template.warmup,
    cooldown: template.cooldown,
    exercises: template.isRestDay ? [] : tiersFor(slot, mode)[tierIndex],
    checklist: template.checklist,
    restNote: template.restNote,
    motivation: quoteForDay(day),
  };
}

export function formatWorkoutDate(workout: ResolvedWorkout): string {
  return formatLongDate(workout.date);
}
