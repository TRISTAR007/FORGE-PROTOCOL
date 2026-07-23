import type { DayTemplate, Phase, ResolvedWorkout, SplitDay, WorkoutExercise } from '@/lib/types';
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
 * Resolves everything about a given day of the 365-day program: which
 * split it falls on, which phase (and therefore which exercise tier)
 * applies, and the fully-built workout for that day.
 */
export function resolveWorkout(dayNumber: number, programStartDate: Date): ResolvedWorkout {
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
    exercises: template.isRestDay ? [] : template.tiers[tierIndex],
    checklist: template.checklist,
    restNote: template.restNote,
    motivation: quoteForDay(day),
  };
}

export function formatWorkoutDate(workout: ResolvedWorkout): string {
  return formatLongDate(workout.date);
}
