import type { Difficulty, Equipment, Exercise, ExerciseCategory } from '@/lib/types';

/**
 * Extended library: more bodyweight, cardio and mobility moves plus the
 * equipment wing (dumbbells, kettlebells, bands, barbell, pull-up bar,
 * cables and machines). Merged into EXERCISES in ./exercises.
 */
function x(
  key: string,
  name: string,
  category: ExerciseCategory,
  difficulty: Difficulty,
  equipment: Equipment[],
  muscles: string[],
  description: string,
  instructions: string[],
  sets: number,
  reps: string,
  rest: string
): Exercise {
  return { key, name, category, difficulty, equipment, muscles, description, instructions, sets, reps, rest };
}

const BW: Equipment[] = ['none'];

export const EXTENDED_EXERCISES: Record<string, Exercise> = Object.fromEntries(
  [
    // ---- Bodyweight push ------------------------------------------------
    x('wallPushup', 'Wall Push-up', 'push', 'beginner', BW, ['Chest', 'Shoulders', 'Triceps'], 'The gentlest push-up — perfect first step', [
      'Stand an arm’s length from a wall, hands on it at chest height',
      'Keep your body in one straight line',
      'Bend your elbows to bring your chest toward the wall',
      'Push back to straight arms',
    ], 3, '12-20', '45s'),
    x('wideGripPushup', 'Wide-Grip Push-up', 'push', 'intermediate', BW, ['Chest', 'Shoulders'], 'Push-up with hands wider than shoulders for more chest', [
      'Hands about 1.5× shoulder width, fingers slightly turned out',
      'Brace your core and squeeze your glutes',
      'Lower until your chest is a fist’s height from the floor',
      'Press back up without letting the hips sag',
    ], 3, '8-15', '60s'),
    x('declinePushup', 'Decline Push-up', 'push', 'intermediate', BW, ['Upper Chest', 'Shoulders', 'Triceps'], 'Feet elevated push-up for upper chest', [
      'Feet on a chair or step, hands on the floor',
      'Body straight from head to heels',
      'Lower your chest toward the floor with control',
      'Press up powerfully',
    ], 3, '8-12', '75s'),
    x('archerPushup', 'Archer Push-up', 'push', 'advanced', BW, ['Chest', 'Triceps', 'Shoulders'], 'One arm does most of the work — a step toward one-arm push-ups', [
      'Very wide hand position',
      'Shift your weight to one side as you lower',
      'Keep the other arm almost straight as a support',
      'Press up and alternate sides',
    ], 3, '5-8 each', '90s'),
    x('explosivePushup', 'Explosive Push-up', 'push', 'advanced', BW, ['Chest', 'Triceps', 'Power'], 'Push hard enough for your hands to leave the floor', [
      'Start in a strong push-up position',
      'Lower with control',
      'Push up explosively so your hands lift off',
      'Land softly with bent elbows and go straight into the next rep',
    ], 3, '5-8', '90s'),
    x('pseudoPlanchePushup', 'Pseudo Planche Push-up', 'push', 'advanced', BW, ['Shoulders', 'Chest', 'Core'], 'Hands by the hips, body leaning forward — big shoulder demand', [
      'Hands beside your waist, fingers turned out or back',
      'Lean your shoulders forward past your hands',
      'Keep the lean as you lower and press',
      'Stay hollow through the core',
    ], 3, '5-10', '90s'),
    x('hinduPushup', 'Flowing Dive Push-up', 'push', 'intermediate', BW, ['Shoulders', 'Chest', 'Triceps', 'Spine'], 'A swooping push-up that also opens the spine', [
      'Start in a downward-dog shape, hips high',
      'Swoop your chest down and forward close to the floor',
      'Finish in an upward-dog shape with arms straight',
      'Push hips back up to the start',
    ], 3, '8-12', '60s'),
    x('shoulderTap', 'Plank Shoulder Tap', 'core', 'beginner', BW, ['Core', 'Shoulders'], 'Anti-rotation core work from a high plank', [
      'High plank, feet a little wider than hips',
      'Lift one hand to tap the opposite shoulder',
      'Keep hips square — no rocking',
      'Alternate sides slowly',
    ], 3, '20 total', '45s'),

    // ---- Bodyweight / bar pull -------------------------------------------
    x('tableRow', 'Table Row', 'pull', 'beginner', BW, ['Back', 'Biceps', 'Rear Delts'], 'Inverted row under a sturdy table', [
      'Lie under a sturdy table and grip its edge',
      'Body straight, heels on the floor',
      'Pull your chest to the table edge',
      'Lower slowly — test the table is stable first',
    ], 3, '8-12', '60s'),
    x('pullUp', 'Pull-up', 'pull', 'advanced', ['pullup-bar'], ['Lats', 'Back', 'Biceps', 'Grip'], 'The king of back exercises', [
      'Hang with palms facing away, hands just outside shoulders',
      'Pull your shoulder blades down first',
      'Pull until your chin clears the bar',
      'Lower all the way with control',
    ], 3, '4-10', '120s'),
    x('chinUp', 'Chin-up', 'pull', 'intermediate', ['pullup-bar'], ['Lats', 'Biceps', 'Back'], 'Palms-facing-you pull-up — usually a bit easier', [
      'Hang with palms facing you, shoulder width',
      'Drive elbows down toward your ribs',
      'Chin over the bar',
      'Lower slowly to a full hang',
    ], 3, '5-10', '120s'),
    x('negativePullUp', 'Negative Pull-up', 'pull', 'intermediate', ['pullup-bar'], ['Lats', 'Biceps', 'Grip'], 'Slow lowering builds the strength for full pull-ups', [
      'Jump or step up so your chin is over the bar',
      'Lower yourself as slowly as you can — aim for 5 seconds',
      'Reach a full hang',
      'Reset and repeat',
    ], 3, '4-6', '90s'),
    x('deadHang', 'Dead Hang', 'pull', 'beginner', ['pullup-bar'], ['Grip', 'Shoulders', 'Lats'], 'Simply hanging — builds grip and decompresses the spine', [
      'Grip the bar shoulder width',
      'Let your body hang long and relaxed',
      'Keep a light brace in your core',
      'Breathe steadily',
    ], 3, '20-40s', '60s'),
    x('scapularPullUp', 'Scapular Pull-up', 'pull', 'beginner', ['pullup-bar'], ['Lower Traps', 'Lats', 'Shoulders'], 'Small shoulder-blade movement that teaches pull-up starts', [
      'Hang with straight arms',
      'Pull your shoulder blades down and back without bending elbows',
      'Your body rises an inch or two',
      'Lower back to a relaxed hang',
    ], 3, '8-12', '60s'),
    x('hangingKneeRaise', 'Hanging Knee Raise', 'core', 'intermediate', ['pullup-bar'], ['Lower Abs', 'Hip Flexors', 'Grip'], 'Core work from a hang', [
      'Hang from the bar with straight arms',
      'Curl your knees up toward your chest',
      'Tilt your pelvis up at the top',
      'Lower without swinging',
    ], 3, '8-12', '60s'),

    // ---- Bodyweight legs --------------------------------------------------
    x('jumpSquat', 'Jump Squat', 'legs', 'intermediate', BW, ['Quads', 'Glutes', 'Calves', 'Power'], 'Explosive squat that builds power', [
      'Squat down to about parallel',
      'Drive up and jump as high as you can',
      'Land softly through the whole foot',
      'Sink straight into the next squat',
    ], 3, '8-12', '75s'),
    x('sumoSquat', 'Sumo Squat', 'legs', 'beginner', BW, ['Glutes', 'Adductors', 'Quads'], 'Wide-stance squat for glutes and inner thighs', [
      'Feet wide, toes turned out',
      'Sit straight down between your heels',
      'Knees track over your toes',
      'Squeeze glutes to stand',
    ], 3, '12-20', '60s'),
    x('reverseLunge', 'Reverse Lunge', 'legs', 'beginner', BW, ['Quads', 'Glutes'], 'Knee-friendly lunge stepping backwards', [
      'Step one foot back',
      'Lower until both knees are about 90°',
      'Front shin stays fairly vertical',
      'Push through the front heel to return',
    ], 3, '10 each', '60s'),
    x('lateralLunge', 'Lateral Lunge', 'legs', 'intermediate', BW, ['Adductors', 'Glutes', 'Quads'], 'Side lunge for hips and inner thighs', [
      'Take a big step to the side',
      'Sit your hips back over that foot, other leg straight',
      'Keep your chest up',
      'Push back to the middle',
    ], 3, '8 each', '60s'),
    x('curtsyLunge', 'Curtsy Lunge', 'legs', 'intermediate', BW, ['Glutes', 'Quads', 'Adductors'], 'Cross-behind lunge that targets the side glutes', [
      'Step one leg back and across behind the other',
      'Lower with control',
      'Keep hips facing forward',
      'Return and switch sides',
    ], 3, '10 each', '60s'),
    x('singleLegGluteBridge', 'Single-Leg Glute Bridge', 'legs', 'intermediate', BW, ['Glutes', 'Hamstrings'], 'One-leg bridge — double the challenge', [
      'Lie on your back, one foot planted, other leg straight up',
      'Drive through the planted heel to lift your hips',
      'Squeeze the glute at the top for a second',
      'Lower slowly',
    ], 3, '10 each', '60s'),
    x('stepUp', 'Step-up', 'legs', 'beginner', BW, ['Quads', 'Glutes'], 'Step onto a sturdy chair or step', [
      'Place one foot fully on a sturdy step',
      'Drive through that foot to stand tall',
      'Step down with control',
      'Do all reps on one side, then switch',
    ], 3, '10 each', '60s'),
    x('assistedPistol', 'Assisted Pistol Squat', 'legs', 'advanced', BW, ['Quads', 'Glutes', 'Balance'], 'One-leg squat holding a doorframe for support', [
      'Hold a doorframe and stand on one leg',
      'Extend the other leg forward',
      'Squat down as low as you can control',
      'Use the support as little as possible to stand',
    ], 3, '5-8 each', '90s'),
    x('cossackSquat', 'Cossack Squat', 'legs', 'intermediate', BW, ['Adductors', 'Glutes', 'Quads', 'Hips'], 'Deep side squat for mobility and strength', [
      'Very wide stance',
      'Shift into one leg and squat deep, other leg straight with toes up',
      'Keep the working heel down',
      'Shift across to the other side',
    ], 3, '6 each', '60s'),
    x('singleLegCalfRaise', 'Single-Leg Calf Raise', 'legs', 'intermediate', BW, ['Calves'], 'Calf raise on one leg off a step', [
      'Stand on one foot on a step edge, hold a wall',
      'Lower your heel below the step',
      'Rise as high as you can',
      'Pause at the top',
    ], 3, '12-15 each', '45s'),
    x('hamstringWalkout', 'Hamstring Walkout', 'legs', 'intermediate', BW, ['Hamstrings', 'Glutes'], 'Bridge and walk the heels out to load the hamstrings', [
      'Start in a glute bridge',
      'Walk your heels out in small steps while keeping hips up',
      'Go as far as you can control',
      'Walk back in',
    ], 3, '6-8', '60s'),

    // ---- Core ------------------------------------------------------------
    x('hollowHold', 'Hollow Body Hold', 'core', 'intermediate', BW, ['Abs', 'Core'], 'Gymnast core hold', [
      'Lie on your back, lower back pressed into the floor',
      'Lift shoulders and legs off the ground, arms overhead',
      'Make a shallow banana shape',
      'Bend knees to make it easier',
    ], 3, '20-40s', '45s'),
    x('vUp', 'V-up', 'core', 'advanced', BW, ['Abs', 'Hip Flexors'], 'Fold into a V from a lying position', [
      'Lie flat, arms overhead',
      'Lift arms and legs together to meet in the middle',
      'Reach for your toes',
      'Lower with control',
    ], 3, '8-12', '60s'),
    x('russianTwist', 'Russian Twist', 'core', 'beginner', BW, ['Obliques', 'Abs'], 'Seated rotation for the obliques', [
      'Sit with knees bent, lean back slightly',
      'Rotate your chest to one side, then the other',
      'Move from the ribs, not just the arms',
      'Lift feet to make it harder',
    ], 3, '20 total', '45s'),
    x('flutterKicks', 'Flutter Kicks', 'core', 'beginner', BW, ['Lower Abs', 'Hip Flexors'], 'Small alternating kicks with legs low', [
      'Lie on your back, hands under hips',
      'Lift legs a few inches',
      'Kick them up and down in small quick movements',
      'Keep your lower back down',
    ], 3, '30s', '45s'),
    x('reverseCrunch', 'Reverse Crunch', 'core', 'beginner', BW, ['Lower Abs'], 'Curl the hips up instead of the shoulders', [
      'Lie on your back, knees bent at 90°',
      'Curl your hips off the floor toward your chest',
      'Lower slowly',
      'No swinging',
    ], 3, '12-15', '45s'),
    x('bearHold', 'Bear Hold', 'core', 'beginner', BW, ['Core', 'Shoulders', 'Quads'], 'Hover the knees an inch off the ground', [
      'Hands under shoulders, knees under hips',
      'Lift knees an inch off the floor',
      'Back flat, breathe steadily',
      'Hold',
    ], 3, '20-40s', '45s'),
    x('plankWalkup', 'Plank Walk-up', 'core', 'intermediate', BW, ['Core', 'Shoulders', 'Triceps'], 'Move between forearm plank and high plank', [
      'Start in a forearm plank',
      'Press up to a high plank one arm at a time',
      'Lower back to forearms one arm at a time',
      'Keep hips steady',
    ], 3, '10', '60s'),
    x('sidePlankHipDip', 'Side Plank Hip Dip', 'core', 'intermediate', BW, ['Obliques', 'Core'], 'Dip and lift the hip from a side plank', [
      'Side plank on your forearm',
      'Lower your hip toward the floor',
      'Lift it back up past the start',
      'Switch sides',
    ], 3, '10 each', '45s'),
    x('crunch', 'Crunch', 'core', 'beginner', BW, ['Abs'], 'Classic short-range ab curl', [
      'Lie on your back, knees bent',
      'Hands lightly at your temples',
      'Curl your shoulders off the floor',
      'Lower slowly — don’t pull on your neck',
    ], 3, '15-20', '45s'),
    x('heelTaps', 'Heel Taps', 'core', 'beginner', BW, ['Obliques'], 'Side-to-side reaches for the obliques', [
      'Lie on your back, knees bent, shoulders slightly lifted',
      'Reach one hand to tap the same-side heel',
      'Alternate sides',
      'Keep shoulders off the floor',
    ], 3, '20 total', '45s'),

    // ---- Cardio / HIIT ---------------------------------------------------
    x('jumpingJack', 'Jumping Jack', 'cardio', 'beginner', BW, ['Full Body', 'Calves'], 'The classic warm-up and cardio move', [
      'Jump feet out while raising arms overhead',
      'Jump back together, arms down',
      'Stay light on your feet',
      'Keep a steady rhythm',
    ], 3, '30s', '30s'),
    x('burpee', 'Burpee', 'full', 'advanced', BW, ['Full Body'], 'Full burpee with push-up and jump', [
      'Squat and place hands on the floor',
      'Jump feet back to a plank and do a push-up',
      'Jump feet back to your hands',
      'Explode up into a jump',
    ], 3, '8-12', '75s'),
    x('skaterHop', 'Skater Hop', 'cardio', 'intermediate', BW, ['Glutes', 'Legs', 'Balance'], 'Side-to-side bounds like a speed skater', [
      'Leap sideways onto one foot',
      'Swing the other leg behind',
      'Land softly and bound to the other side',
      'Use your arms for rhythm',
    ], 3, '30s', '45s'),
    x('buttKicks', 'Butt Kicks', 'cardio', 'beginner', BW, ['Hamstrings', 'Calves'], 'Run in place kicking heels to glutes', [
      'Jog in place',
      'Kick each heel up toward your glutes',
      'Stay on the balls of your feet',
      'Pump your arms',
    ], 3, '30s', '30s'),
    x('fastFeet', 'Fast Feet', 'cardio', 'beginner', BW, ['Calves', 'Quads'], 'Rapid tiny steps in an athletic stance', [
      'Quarter-squat stance, chest up',
      'Tap your feet as fast as possible',
      'Stay low and light',
      'Breathe',
    ], 3, '20s', '40s'),
    x('tuckJump', 'Tuck Jump', 'cardio', 'advanced', BW, ['Legs', 'Core', 'Power'], 'Jump and pull knees to chest', [
      'Jump straight up',
      'Pull knees toward your chest at the top',
      'Land softly with bent knees',
      'Reset briefly between reps if needed',
    ], 3, '6-10', '75s'),
    x('starJump', 'Star Jump', 'cardio', 'intermediate', BW, ['Full Body', 'Power'], 'Explode into a star shape', [
      'Crouch low',
      'Jump up spreading arms and legs into a star',
      'Bring them back in before landing',
      'Land softly',
    ], 3, '8-12', '60s'),
    x('shadowBoxing', 'Shadow Boxing', 'cardio', 'beginner', BW, ['Shoulders', 'Core', 'Cardio'], 'Punch combinations at an imaginary opponent', [
      'Guard up, light on your feet',
      'Throw jab-cross combos, rotating from the hips',
      'Add hooks and uppercuts as you warm up',
      'Keep moving',
    ], 3, '45s', '30s'),
    x('lateralShuffle', 'Lateral Shuffle', 'cardio', 'beginner', BW, ['Legs', 'Glutes'], 'Quick side-to-side shuffles', [
      'Athletic stance, hips back',
      'Shuffle three steps to one side',
      'Touch the floor, shuffle back',
      'Stay low',
    ], 3, '30s', '30s'),
    x('inchworm', 'Inchworm', 'full', 'beginner', BW, ['Hamstrings', 'Shoulders', 'Core'], 'Walk the hands out to plank and back', [
      'Stand tall, fold forward, hands to the floor',
      'Walk hands out to a high plank',
      'Walk them back toward your feet',
      'Roll up to standing',
    ], 3, '6-8', '45s'),
    x('jumpRopeBasic', 'Jump Rope', 'cardio', 'beginner', ['jump-rope'], ['Calves', 'Cardio', 'Coordination'], 'Basic two-foot skipping', [
      'Elbows close to your sides',
      'Turn the rope with your wrists',
      'Small jumps on the balls of your feet',
      'Relax your shoulders',
    ], 3, '60s', '30s'),
    x('doubleUnders', 'Double-Unders', 'cardio', 'advanced', ['jump-rope'], ['Calves', 'Power', 'Coordination'], 'The rope passes twice per jump', [
      'Jump a little higher than normal',
      'Whip the rope fast with your wrists',
      'Stay tall and tight',
      'Start with singles between doubles',
    ], 3, '30s', '60s'),

    // ---- Mobility --------------------------------------------------------
    x('hipFlexorStretch', 'Kneeling Hip Flexor Stretch', 'mobility', 'beginner', BW, ['Hip Flexors', 'Quads'], 'Opens hips tight from sitting', [
      'Half-kneel with one knee down',
      'Tuck your pelvis under and squeeze that glute',
      'Shift forward gently',
      'Hold, then switch sides',
    ], 1, '45s each', '0s'),
    x('pigeonPose', 'Pigeon Stretch', 'mobility', 'beginner', BW, ['Glutes', 'Hips'], 'Deep outer hip stretch', [
      'From all fours, bring one knee forward behind your wrist',
      'Extend the other leg behind',
      'Square your hips and fold forward',
      'Switch sides',
    ], 1, '60s each', '0s'),
    x('openBook', 'Open Book Rotation', 'mobility', 'beginner', BW, ['Thoracic', 'Chest'], 'Upper-back rotation lying on your side', [
      'Lie on your side, knees bent, arms out in front',
      'Open the top arm across to the other side',
      'Follow it with your eyes',
      'Return slowly — 8 each side',
    ], 1, '8 each', '0s'),
    x('cobraStretch', 'Cobra Stretch', 'mobility', 'beginner', BW, ['Abs', 'Spine'], 'Gentle back extension', [
      'Lie face down, hands under shoulders',
      'Press up gently, hips stay down',
      'Shoulders away from ears',
      'Breathe and hold',
    ], 1, '30s', '0s'),
    x('deepSquatHold', 'Deep Squat Hold', 'mobility', 'beginner', BW, ['Hips', 'Ankles', 'Adductors'], 'Rest at the bottom of a squat', [
      'Feet shoulder width, toes slightly out',
      'Sink as deep as is comfortable, heels down',
      'Elbows gently push knees out',
      'Breathe and relax',
    ], 1, '60s', '0s'),
    x('ninetyNinety', '90/90 Hip Switch', 'mobility', 'intermediate', BW, ['Hips', 'Glutes'], 'Rotate both hips through internal and external rotation', [
      'Sit with both knees bent at 90°, one in front, one to the side',
      'Rotate both knees to the other side',
      'Keep your chest tall',
      'Move slowly',
    ], 1, '10 total', '0s'),
    x('wallAngel', 'Wall Angel', 'mobility', 'beginner', BW, ['Upper Back', 'Shoulders'], 'Posture fixer for rounded shoulders', [
      'Back, head and arms against a wall',
      'Slide arms up overhead keeping contact',
      'Slide back down to a W shape',
      'Go slowly',
    ], 2, '10', '30s'),
    x('armCircles', 'Arm Circles', 'mobility', 'beginner', BW, ['Shoulders'], 'Shoulder warm-up', [
      'Arms out to the sides',
      'Small circles forward, growing bigger',
      'Reverse direction',
      'Stay relaxed',
    ], 1, '30s', '0s'),
    x('legSwings', 'Leg Swings', 'mobility', 'beginner', BW, ['Hips', 'Hamstrings'], 'Dynamic hip warm-up', [
      'Hold a wall for balance',
      'Swing one leg forward and back',
      'Then side to side',
      'Switch legs',
    ], 1, '10 each', '0s'),

    // ---- Dumbbells -------------------------------------------------------
    x('dbFloorPress', 'Dumbbell Floor Press', 'push', 'beginner', ['dumbbell'], ['Chest', 'Triceps'], 'Bench press from the floor — no bench needed', [
      'Lie on your back, knees bent, a dumbbell in each hand',
      'Start with arms straight over your chest',
      'Lower until upper arms touch the floor',
      'Press back up',
    ], 3, '8-12', '75s'),
    x('dbBenchPress', 'Dumbbell Bench Press', 'push', 'intermediate', ['dumbbell', 'bench'], ['Chest', 'Shoulders', 'Triceps'], 'Classic chest builder on a bench', [
      'Lie on a bench, feet planted, dumbbells at chest level',
      'Press up until arms are straight',
      'Lower with elbows about 45° from your body',
      'Keep shoulder blades pulled back',
    ], 4, '8-12', '90s'),
    x('dbShoulderPress', 'Dumbbell Shoulder Press', 'push', 'intermediate', ['dumbbell'], ['Shoulders', 'Triceps'], 'Overhead press for strong shoulders', [
      'Dumbbells at shoulder height, palms forward',
      'Brace your core, ribs down',
      'Press overhead until arms are straight',
      'Lower to shoulder height',
    ], 3, '8-12', '90s'),
    x('dbArnoldPress', 'Arnold-style Press', 'push', 'intermediate', ['dumbbell'], ['Shoulders'], 'Rotating overhead press', [
      'Start with palms facing you at chin height',
      'Rotate palms outward as you press up',
      'Finish with palms forward overhead',
      'Reverse on the way down',
    ], 3, '8-10', '90s'),
    x('dbLateralRaise', 'Lateral Raise', 'push', 'beginner', ['dumbbell'], ['Shoulders'], 'Builds wider-looking shoulders', [
      'Light dumbbells at your sides',
      'Raise arms out to the sides to shoulder height',
      'Slight bend in the elbows',
      'Lower slowly',
    ], 3, '12-15', '60s'),
    x('dbTricepExtension', 'Overhead Triceps Extension', 'push', 'beginner', ['dumbbell'], ['Triceps'], 'Two hands on one dumbbell overhead', [
      'Hold one dumbbell overhead with both hands',
      'Lower it behind your head by bending elbows',
      'Elbows point forward',
      'Extend back up',
    ], 3, '10-15', '60s'),
    x('dbRow', 'One-Arm Dumbbell Row', 'pull', 'beginner', ['dumbbell'], ['Back', 'Lats', 'Biceps'], 'Row with one hand supported', [
      'One hand and knee on a bench or chair, back flat',
      'Dumbbell hanging under your shoulder',
      'Pull it to your hip',
      'Lower all the way',
    ], 3, '10 each', '60s'),
    x('dbRenegadeRow', 'Renegade Row', 'pull', 'advanced', ['dumbbell'], ['Back', 'Core', 'Shoulders'], 'Row from a plank on dumbbells', [
      'High plank on two dumbbells, feet wide',
      'Row one dumbbell to your hip',
      'Keep hips square',
      'Alternate sides',
    ], 3, '8 each', '75s'),
    x('dbBicepCurl', 'Dumbbell Curl', 'pull', 'beginner', ['dumbbell'], ['Biceps'], 'Classic arm builder', [
      'Stand tall, palms forward',
      'Curl the dumbbells up without swinging',
      'Squeeze at the top',
      'Lower slowly',
    ], 3, '10-12', '60s'),
    x('dbHammerCurl', 'Hammer Curl', 'pull', 'beginner', ['dumbbell'], ['Biceps', 'Forearms'], 'Neutral-grip curl for arms and forearms', [
      'Palms face each other',
      'Curl up keeping elbows by your sides',
      'Pause at the top',
      'Lower with control',
    ], 3, '10-12', '60s'),
    x('dbShrug', 'Dumbbell Shrug', 'pull', 'beginner', ['dumbbell'], ['Traps'], 'Upper trap builder', [
      'Heavy dumbbells at your sides',
      'Lift your shoulders straight up toward your ears',
      'Pause',
      'Lower fully',
    ], 3, '12-15', '60s'),
    x('dbGobletSquat', 'Goblet Squat', 'legs', 'beginner', ['dumbbell'], ['Quads', 'Glutes', 'Core'], 'Squat holding a dumbbell at your chest', [
      'Hold a dumbbell vertically at your chest',
      'Squat down between your heels',
      'Elbows inside your knees at the bottom',
      'Drive up tall',
    ], 3, '10-15', '75s'),
    x('dbRomanianDeadlift', 'Dumbbell Romanian Deadlift', 'legs', 'intermediate', ['dumbbell'], ['Hamstrings', 'Glutes', 'Lower Back'], 'Hip hinge for the back of the legs', [
      'Dumbbells in front of your thighs',
      'Push hips back with a slight knee bend',
      'Lower until you feel a strong hamstring stretch, back flat',
      'Squeeze glutes to stand',
    ], 3, '10-12', '90s'),
    x('dbLunge', 'Dumbbell Lunge', 'legs', 'intermediate', ['dumbbell'], ['Quads', 'Glutes'], 'Lunges holding dumbbells', [
      'Dumbbells at your sides',
      'Step forward and lower until both knees are about 90°',
      'Push back to standing',
      'Alternate legs',
    ], 3, '10 each', '75s'),
    x('dbStepUp', 'Dumbbell Step-up', 'legs', 'intermediate', ['dumbbell', 'bench'], ['Quads', 'Glutes'], 'Weighted step-ups', [
      'Hold dumbbells at your sides',
      'Step up onto a sturdy box or bench',
      'Stand tall at the top',
      'Step down with control',
    ], 3, '8 each', '75s'),
    x('dbThruster', 'Dumbbell Thruster', 'full', 'intermediate', ['dumbbell'], ['Full Body', 'Shoulders', 'Quads'], 'Squat into an overhead press', [
      'Dumbbells at shoulders',
      'Squat down',
      'Drive up and press overhead in one motion',
      'Lower to shoulders as you squat again',
    ], 3, '10-12', '90s'),

    // ---- Kettlebell ------------------------------------------------------
    x('kbSwing', 'Kettlebell Swing', 'full', 'intermediate', ['kettlebell'], ['Glutes', 'Hamstrings', 'Core', 'Power'], 'Explosive hip hinge', [
      'Feet shoulder width, kettlebell in both hands',
      'Hike it back between your legs',
      'Snap your hips forward to swing it to chest height',
      'Let it fall and hinge again — arms just guide it',
    ], 4, '15', '60s'),
    x('kbDeadlift', 'Kettlebell Deadlift', 'legs', 'beginner', ['kettlebell'], ['Glutes', 'Hamstrings', 'Back'], 'Learn the hinge with a kettlebell', [
      'Kettlebell between your feet',
      'Hinge down with a flat back and grab the handle',
      'Stand up by driving hips forward',
      'Lower the same way',
    ], 3, '10-12', '75s'),
    x('kbClean', 'Kettlebell Clean', 'full', 'intermediate', ['kettlebell'], ['Full Body', 'Grip'], 'Bring the bell to the rack position', [
      'Start like a one-arm swing',
      'Keep the bell close as you pull it up',
      'Let it roll around your wrist to rest at your shoulder',
      'Lower back into the swing',
    ], 3, '6 each', '75s'),
    x('kbPress', 'Kettlebell Press', 'push', 'intermediate', ['kettlebell'], ['Shoulders', 'Triceps', 'Core'], 'One-arm overhead press from the rack', [
      'Kettlebell resting at your shoulder',
      'Brace and press straight overhead',
      'Bicep finishes by your ear',
      'Lower to the rack',
    ], 3, '6-8 each', '75s'),
    x('kbHalo', 'Kettlebell Halo', 'mobility', 'beginner', ['kettlebell'], ['Shoulders', 'Core'], 'Circle the bell around your head', [
      'Hold the bell upside down by the horns',
      'Circle it around your head, close to your neck',
      'Keep ribs down and core tight',
      'Reverse direction',
    ], 2, '8 each way', '45s'),
    x('kbGetUp', 'Kettlebell Get-up', 'full', 'advanced', ['kettlebell'], ['Full Body', 'Shoulders', 'Core'], 'Stand up from lying, holding a bell overhead', [
      'Lie down holding the bell straight up over one shoulder',
      'Roll to your elbow, then your hand',
      'Lift hips, sweep the leg through to a kneel, then stand',
      'Reverse every step to lie back down — go slowly, start light',
    ], 2, '3 each', '90s'),

    // ---- Resistance bands --------------------------------------------------
    x('bandPullApart', 'Band Pull-Apart', 'pull', 'beginner', ['band'], ['Rear Delts', 'Upper Back'], 'Posture saver for the upper back', [
      'Hold a band at shoulder height, arms straight',
      'Pull it apart until it touches your chest',
      'Squeeze your shoulder blades',
      'Return slowly',
    ], 3, '15-20', '45s'),
    x('bandRow', 'Band Row', 'pull', 'beginner', ['band'], ['Back', 'Biceps'], 'Seated row with a band around your feet', [
      'Sit with legs straight, band around your feet',
      'Pull the handles to your ribs',
      'Squeeze your shoulder blades',
      'Release slowly',
    ], 3, '12-15', '60s'),
    x('bandChestPress', 'Band Chest Press', 'push', 'beginner', ['band'], ['Chest', 'Triceps'], 'Standing press with the band behind you', [
      'Band anchored behind you at chest height (or around your back)',
      'Press your hands forward until arms are straight',
      'Control the return',
      'Stay tall',
    ], 3, '12-15', '60s'),
    x('bandCurl', 'Band Curl', 'pull', 'beginner', ['band'], ['Biceps'], 'Curls standing on the band', [
      'Stand on the band, handles in hands',
      'Curl up keeping elbows still',
      'Squeeze',
      'Lower slowly',
    ], 3, '12-15', '45s'),
    x('bandLateralWalk', 'Band Lateral Walk', 'legs', 'beginner', ['band'], ['Glutes', 'Hips'], 'Side steps with a mini-band', [
      'Mini-band around your knees or ankles',
      'Quarter squat',
      'Step sideways keeping tension in the band',
      'Same number of steps each way',
    ], 3, '12 each way', '45s'),
    x('bandFacePull', 'Band Face Pull', 'pull', 'beginner', ['band'], ['Rear Delts', 'Rotator Cuff'], 'Shoulder health essential', [
      'Band anchored at face height',
      'Pull toward your face, splitting your hands apart',
      'Elbows high, finish with thumbs back',
      'Return slowly',
    ], 3, '15', '45s'),
    x('bandTricepPushdown', 'Band Triceps Pushdown', 'push', 'beginner', ['band'], ['Triceps'], 'Pushdowns with a band anchored above', [
      'Band anchored high (top of a door)',
      'Elbows pinned to your sides',
      'Push down until arms are straight',
      'Let it return slowly',
    ], 3, '12-15', '45s'),

    // ---- Barbell -----------------------------------------------------------
    x('bbBackSquat', 'Barbell Back Squat', 'legs', 'intermediate', ['barbell'], ['Quads', 'Glutes', 'Core'], 'The foundational strength lift', [
      'Bar on your upper back, hands just outside shoulders',
      'Brace hard, then sit down between your heels',
      'Reach at least parallel with knees tracking over toes',
      'Drive up — use safety bars or a spotter',
    ], 4, '5-8', '150s'),
    x('bbFrontSquat', 'Barbell Front Squat', 'legs', 'advanced', ['barbell'], ['Quads', 'Core', 'Upper Back'], 'Bar on the front of the shoulders', [
      'Bar resting on your front shoulders, elbows high',
      'Stay upright as you squat down',
      'Keep elbows up throughout',
      'Drive up tall',
    ], 4, '5-6', '150s'),
    x('bbDeadlift', 'Barbell Deadlift', 'legs', 'intermediate', ['barbell'], ['Glutes', 'Hamstrings', 'Back', 'Grip'], 'Lift the bar from the floor', [
      'Bar over mid-foot, grip just outside your legs',
      'Flat back, chest up, take the slack out of the bar',
      'Push the floor away and stand tall',
      'Lower by hinging the hips back first',
    ], 3, '5', '180s'),
    x('bbRomanianDeadlift', 'Barbell Romanian Deadlift', 'legs', 'intermediate', ['barbell'], ['Hamstrings', 'Glutes'], 'Hinge from standing for hamstrings', [
      'Stand holding the bar at your thighs',
      'Push hips back, bar slides down your legs',
      'Stop at a deep hamstring stretch, back flat',
      'Drive hips forward to stand',
    ], 3, '8-10', '120s'),
    x('bbBenchPress', 'Barbell Bench Press', 'push', 'intermediate', ['barbell', 'bench'], ['Chest', 'Triceps', 'Shoulders'], 'Classic upper-body strength lift', [
      'Eyes under the bar, feet planted, shoulder blades pinched',
      'Lower the bar to your lower chest',
      'Press up and slightly back',
      'Always use a spotter or safety pins',
    ], 4, '5-8', '150s'),
    x('bbOverheadPress', 'Barbell Overhead Press', 'push', 'intermediate', ['barbell'], ['Shoulders', 'Triceps', 'Core'], 'Standing press', [
      'Bar on your front shoulders, grip just outside them',
      'Squeeze glutes and brace',
      'Press straight up, moving your head back then through',
      'Lock out overhead',
    ], 4, '5-8', '150s'),
    x('bbRow', 'Barbell Bent-Over Row', 'pull', 'intermediate', ['barbell'], ['Back', 'Lats', 'Biceps'], 'Heavy row for a thick back', [
      'Hinge to about 45°, back flat',
      'Pull the bar to your lower ribs',
      'Squeeze your shoulder blades',
      'Lower with control',
    ], 4, '6-10', '120s'),
    x('bbHipThrust', 'Barbell Hip Thrust', 'legs', 'intermediate', ['barbell', 'bench'], ['Glutes', 'Hamstrings'], 'Best glute builder', [
      'Upper back on a bench, padded bar across your hips',
      'Drive through your heels to lift hips',
      'Chin tucked, ribs down at the top',
      'Lower with control',
    ], 4, '8-12', '90s'),

    // ---- Cables & machines -------------------------------------------------
    x('latPulldown', 'Lat Pulldown', 'pull', 'beginner', ['machine'], ['Lats', 'Biceps'], 'Machine version of the pull-up', [
      'Grip wider than shoulders, thighs locked under the pad',
      'Pull the bar to your upper chest',
      'Drive elbows down toward your ribs',
      'Let the bar rise slowly',
    ], 3, '10-12', '75s'),
    x('seatedCableRow', 'Seated Cable Row', 'pull', 'beginner', ['cable'], ['Back', 'Biceps'], 'Steady back builder', [
      'Sit tall, feet on the platform, slight knee bend',
      'Pull the handle to your stomach',
      'Squeeze your shoulder blades',
      'Reach forward slowly without rounding',
    ], 3, '10-12', '75s'),
    x('cableFacePull', 'Cable Face Pull', 'pull', 'beginner', ['cable'], ['Rear Delts', 'Rotator Cuff'], 'Rope face pull for healthy shoulders', [
      'Rope at face height',
      'Pull toward your face, splitting the rope',
      'Elbows high',
      'Return slowly',
    ], 3, '15', '45s'),
    x('cableTricepPushdown', 'Cable Triceps Pushdown', 'push', 'beginner', ['cable'], ['Triceps'], 'Isolation for the triceps', [
      'Elbows pinned at your sides',
      'Push the bar or rope down to straight arms',
      'Squeeze',
      'Let it rise to about 90°',
    ], 3, '12-15', '45s'),
    x('cableWoodchop', 'Cable Woodchop', 'core', 'intermediate', ['cable'], ['Obliques', 'Core'], 'Rotational core power', [
      'Cable set high, stand side-on',
      'Pull diagonally down across your body',
      'Rotate through your hips and torso',
      'Control the return',
    ], 3, '10 each', '45s'),
    x('legPress', 'Leg Press', 'legs', 'beginner', ['machine'], ['Quads', 'Glutes'], 'Heavy leg work with back support', [
      'Feet shoulder width on the platform',
      'Lower until knees are about 90°',
      'Keep your lower back on the pad',
      'Press up without locking knees hard',
    ], 4, '10-12', '90s'),
    x('legCurl', 'Leg Curl Machine', 'legs', 'beginner', ['machine'], ['Hamstrings'], 'Hamstring isolation', [
      'Pad just above your heels',
      'Curl your heels toward your glutes',
      'Squeeze',
      'Lower slowly',
    ], 3, '10-15', '60s'),
    x('legExtension', 'Leg Extension Machine', 'legs', 'beginner', ['machine'], ['Quads'], 'Quad isolation', [
      'Pad on the front of your ankles',
      'Extend your legs until straight',
      'Squeeze your quads',
      'Lower slowly',
    ], 3, '12-15', '60s'),
    x('chestPressMachine', 'Chest Press Machine', 'push', 'beginner', ['machine'], ['Chest', 'Triceps'], 'Guided pressing — great for beginners', [
      'Handles at mid-chest height',
      'Press forward until arms are nearly straight',
      'Return slowly',
      'Keep shoulder blades back',
    ], 3, '10-12', '75s'),
  ].map((e) => [e.key, e])
);
