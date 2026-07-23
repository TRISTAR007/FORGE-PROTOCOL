export interface ExerciseBlockItem {
  name: string;
  cause?: string;
  fix?: string;
  daily?: string;
}

export interface ResourceTab {
  id: string;
  label: string;
  title: string;
}

export const RESOURCE_TABS: ResourceTab[] = [
  { id: 'posture', label: 'Posture', title: 'Posture Correction System' },
  { id: 'mobility', label: 'Mobility', title: 'Mobility Routines' },
  { id: 'recovery', label: 'Recovery', title: 'Recovery & Sleep' },
  { id: 'science', label: 'Science', title: 'Training Science' },
  { id: 'skin', label: 'Skin & Glow', title: 'Skin Routine — No Products Needed' },
];

export const POSTURE_ISSUES: ExerciseBlockItem[] = [
  {
    name: 'Rounded Shoulders',
    cause: 'Weak upper back, tight chest',
    fix: 'Face pulls, band pull-aparts, chest stretches',
    daily: 'Wall angels — 3 sets of 10',
  },
  {
    name: 'Forward Head Posture',
    cause: 'Phone/computer use, weak neck',
    fix: 'Chin tucks, neck extensions, upper back strengthening',
    daily: 'Chin tucks — 3 sets of 15',
  },
  {
    name: 'Anterior Pelvic Tilt',
    cause: 'Tight hip flexors, weak glutes/core',
    fix: 'Hip flexor stretches, glute bridges, core work',
    daily: 'Glute bridges — 3 sets of 15',
  },
];

export const POSTURE_HABITS = [
  'Stand tall — ears over shoulders, shoulders over hips',
  'Sit with your back supported, feet flat',
  'Phone at eye level, not looking down',
  'Sleep on your back or side with a proper pillow',
  'Take breaks every 30 minutes',
  'Practice diaphragmatic breathing',
];

export interface MobilityRoutine {
  title: string;
  duration: string;
  steps: string[];
}

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    title: 'Morning Mobility',
    duration: '10 minutes',
    steps: [
      'Neck circles — 10 each direction',
      'Arm circles — 20 forward, 20 back',
      'Cat-cow stretch — 10 reps',
      "World's greatest stretch — 5 each side",
      'Leg swings — 10 each leg',
      'Ankle circles — 10 each direction',
      'Thoracic rotations — 10 each side',
    ],
  },
  {
    title: 'Pre-Workout Mobility',
    duration: '5 minutes',
    steps: [
      'Jumping jacks — 30 seconds',
      'High knees — 30 seconds',
      'Arm swings — 20 reps',
      'Leg swings — 10 each leg',
      'Bodyweight squats — 10 reps',
      'Push-up to downward dog — 5 reps',
    ],
  },
  {
    title: 'Evening Mobility',
    duration: '15 minutes',
    steps: [
      "Child's pose — 1 minute",
      'Pigeon pose — 2 minutes each side',
      'Couch stretch — 2 minutes each side',
      'Hamstring stretch — 2 minutes each leg',
      'Chest opener — 2 minutes',
      'Spinal twist — 2 minutes each side',
      'Deep breathing — 3 minutes',
    ],
  },
];

export const SLEEP_PROTOCOL = [
  'Target: 7-9 hours per night',
  'Consistent bedtime',
  'No screens 1 hour before bed',
  'Cool, dark room',
  'No caffeine after 2 PM',
];

export const RECOVERY_TECHNIQUES: ExerciseBlockItem[] = [
  { name: 'Active Recovery', fix: 'Light walking, mobility work, stretching on rest days' },
  { name: 'Cold Exposure', fix: 'Cold showers (optional) — 2-3 minutes to reduce inflammation' },
  { name: 'Breathing', fix: '4-7-8 breathing: inhale 4s, hold 7s, exhale 8s — reduces stress' },
];

export const PROGRESSIVE_OVERLOAD = [
  'Increase reps before increasing difficulty',
  'Master form before progressing',
  'Add tempo variations (slow eccentrics)',
  'Reduce rest periods',
  'Add isometric holds',
];

export const HYPERTROPHY_FACTORS: ExerciseBlockItem[] = [
  { name: 'Mechanical Tension', fix: 'Lifting challenging bodyweight loads creates the tension that triggers growth' },
  { name: 'Metabolic Stress', fix: 'The "burn" from high reps creates cellular swelling and growth signaling' },
  { name: 'Muscle Damage', fix: 'Micro-tears from training repair back stronger (this is DOMS)' },
];

export const SKIN_ROUTINE = [
  { time: 'Morning', text: 'Splash cold water, rub gently, air dry.' },
  { time: 'Evening', text: 'Warm water rinse, air dry, sleep.' },
];

export const SKIN_TRUTHS = [
  { icon: '😴', text: 'Sleep 7–8 hours — does more than any product' },
  { icon: '💧', text: 'Water — 2L+ daily' },
  { icon: '💪', text: 'Sweat from training' },
  { icon: '⏰', text: 'Time — give it weeks, not days' },
];
