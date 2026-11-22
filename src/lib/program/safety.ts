import type { ExerciseCategory, Limitation, TrainingMode, WorkoutExercise } from '@/lib/types';
import { EXERCISES, exerciseEquipment } from './exercises';

/**
 * Injury-friendly training. The plan questionnaire asks about sore or
 * injured areas; any exercise that loads one of them is swapped for a
 * gentler move from the same family, and quests never pick them.
 *
 * This is a conservative filter, not medical advice — the app also tells
 * people with pain or a medical condition to check with a professional.
 */
const STRESS: Record<Limitation, string[]> = {
  knees: [
    'bodyweightSquat', 'jumpSquat', 'splitSquat', 'bulgarianSplitSquat', 'walkingLunge', 'wallSit', 'squatToReach',
    'stepBackBurpee', 'burpee', 'reverseLunge', 'lateralLunge', 'curtsyLunge', 'stepUp', 'assistedPistol',
    'cossackSquat', 'sumoSquat', 'skaterHop', 'tuckJump', 'starJump', 'fastFeet', 'highKnees', 'buttKicks',
    'jumpRopeBasic', 'doubleUnders', 'deepSquatHold', 'lateralShuffle', 'dbLunge', 'dbStepUp', 'dbThruster',
    'dbGobletSquat', 'bbBackSquat', 'bbFrontSquat', 'legPress', 'legExtension', 'jumpingJack',
  ],
  back: [
    'bbDeadlift', 'bbRomanianDeadlift', 'dbRomanianDeadlift', 'kbDeadlift', 'kbSwing', 'kbClean', 'bbBackSquat',
    'bbFrontSquat', 'bbRow', 'bbOverheadPress', 'legRaise', 'vUp', 'russianTwist', 'bicycleCrunch', 'crunch',
    'flutterKicks', 'reverseCrunch', 'burpee', 'stepBackBurpee', 'tuckJump', 'jumpSquat', 'doubleUnders',
    'cableWoodchop', 'legPress', 'hamstringWalkout', 'supermanHold', 'hangingKneeRaise', 'dbThruster',
  ],
  shoulders: [
    'pikePushup', 'pseudoPlanchePushup', 'archerPushup', 'explosivePushup', 'declinePushup', 'hinduPushup',
    'diamondPushup', 'chairDip', 'dbShoulderPress', 'dbArnoldPress', 'bbOverheadPress', 'kbPress', 'pullUp',
    'chinUp', 'negativePullUp', 'deadHang', 'hangingKneeRaise', 'kbGetUp', 'kbHalo', 'bbBenchPress',
    'plankWalkup', 'burpee', 'dbThruster', 'dbLateralRaise', 'scapularPullUp',
  ],
  wrists: [
    'kneePushup', 'standardPushup', 'diamondPushup', 'pikePushup', 'wideGripPushup', 'declinePushup',
    'archerPushup', 'explosivePushup', 'pseudoPlanchePushup', 'hinduPushup', 'scapularPushup', 'shoulderTap',
    'mountainClimber', 'bearHold', 'plankWalkup', 'burpee', 'stepBackBurpee', 'inchworm', 'chairDip',
    'dbRenegadeRow', 'hamstringWalkout', 'sidePlankHipDip',
  ],
  lowImpact: [
    'jumpingJack', 'burpee', 'skaterHop', 'tuckJump', 'starJump', 'jumpSquat', 'highKnees', 'buttKicks',
    'fastFeet', 'jumpRopeBasic', 'doubleUnders', 'explosivePushup', 'kbSwing', 'kbClean', 'mountainClimber',
  ],
};

const STRESS_SETS: Record<Limitation, Set<string>> = Object.fromEntries(
  Object.entries(STRESS).map(([k, keys]) => [k, new Set(keys)])
) as Record<Limitation, Set<string>>;

/** Gentle stand-ins per exercise family, best first. */
const ALTERNATIVES: Record<ExerciseCategory, string[]> = {
  push: ['inclinePushup', 'wallPushup', 'bandChestPress', 'dbFloorPress', 'chestPressMachine'],
  pull: ['bandRow', 'towelRow', 'doorframeRow', 'bandPullApart', 'seatedCableRow', 'tableRow'],
  legs: ['gluteBridge', 'singleLegGluteBridge', 'calfRaise', 'legCurl', 'bandLateralWalk'],
  core: ['deadBug', 'birdDog', 'plank', 'sidePlank', 'heelTaps'],
  cardio: ['shadowBoxing', 'armCircles', 'lateralShuffle', 'jumpingJack'],
  mobility: ['catCow', 'openBook', 'childPose', 'wallAngel', 'armCircles'],
  full: ['shadowBoxing', 'birdDog', 'gluteBridge', 'deadBug'],
};

/** Equipment each training mode can use (bodyweight is always available). */
const MODE_EQUIPMENT: Record<TrainingMode, Set<string>> = {
  home: new Set(['none']),
  dumbbells: new Set(['none', 'band', 'jump-rope', 'dumbbell', 'kettlebell', 'bench']),
  gym: new Set(['none', 'band', 'jump-rope', 'dumbbell', 'kettlebell', 'bench', 'barbell', 'pullup-bar', 'cable', 'machine']),
};

export const LIMITATIONS: Limitation[] = ['knees', 'back', 'shoulders', 'wrists', 'lowImpact'];

export function isStressful(key: string, limitations: readonly Limitation[]): boolean {
  return limitations.some((l) => STRESS_SETS[l]?.has(key));
}

function usableIn(key: string, mode: TrainingMode): boolean {
  const ex = EXERCISES[key];
  if (!ex) return false;
  const allowed = MODE_EQUIPMENT[mode];
  return exerciseEquipment(ex).every((eq) => allowed.has(eq));
}

/** The safest stand-in for `key`, or `key` itself when it's already fine. */
export function safeExerciseKey(
  key: string,
  limitations: readonly Limitation[],
  mode: TrainingMode = 'home',
  /** Moves already in the workout — prefer something different so a day isn't three of the same swap. */
  avoid: ReadonlySet<string> = new Set()
): string {
  if (limitations.length === 0 || !isStressful(key, limitations)) return key;
  const category = EXERCISES[key]?.category ?? 'full';
  const pool = [...ALTERNATIVES[category], ...ALTERNATIVES.core, ...ALTERNATIVES.mobility];
  const ok = (k: string) => k !== key && !isStressful(k, limitations) && usableIn(k, mode);
  return pool.find((k) => ok(k) && !avoid.has(k)) ?? pool.find(ok) ?? 'deadBug';
}

/** Applies safe swaps to a list of workout exercises (keeps sets/reps/rest). */
export function safeExercises(
  list: WorkoutExercise[],
  limitations: readonly Limitation[] | undefined,
  mode: TrainingMode = 'home'
): WorkoutExercise[] {
  if (!limitations || limitations.length === 0) return list;
  const used = new Set(list.map((we) => we.exerciseKey));
  return list.map((we) => {
    const key = safeExerciseKey(we.exerciseKey, limitations, mode, used);
    used.add(key);
    return key === we.exerciseKey ? we : { ...we, exerciseKey: key, swappedFrom: we.exerciseKey };
  });
}
