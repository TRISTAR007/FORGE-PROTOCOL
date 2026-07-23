import type { WorkoutExercise } from '@/lib/types';

export interface SessionStep {
  type: 'work' | 'rest';
  exerciseKey: string;
  exerciseIndex: number;
  setNumber: number;
  totalSets: number;
  reps: string;
  isTimed: boolean;
  seconds: number;
  label: string;
}

function parseSeconds(text: string): number | null {
  const match = text.match(/(\d+)(?:-(\d+))?\s*s/i);
  if (!match) return null;
  const low = Number(match[1]);
  const high = match[2] ? Number(match[2]) : low;
  return high;
}

const DEFAULT_WORK_SECONDS = 45; // fallback thinking time for rep-based sets before allowing "Done"

/**
 * Flattens a workout's exercises into an ordered sequence of work/rest
 * steps — one work step per set, with a rest step after each set
 * (skipped after the very last set of the whole session).
 */
export function buildSessionSteps(exercises: WorkoutExercise[]): SessionStep[] {
  const steps: SessionStep[] = [];

  exercises.forEach((exercise, exerciseIndex) => {
    const repsText = exercise.reps ?? (exercise.timeSeconds ? `${exercise.timeSeconds}s` : '');
    const timedSeconds = exercise.timeSeconds ?? parseSeconds(repsText);
    const restSeconds = parseSeconds(exercise.rest) ?? 45;

    for (let set = 1; set <= exercise.sets; set++) {
      steps.push({
        type: 'work',
        exerciseKey: exercise.exerciseKey,
        exerciseIndex,
        setNumber: set,
        totalSets: exercise.sets,
        reps: repsText,
        isTimed: timedSeconds != null,
        seconds: timedSeconds ?? DEFAULT_WORK_SECONDS,
        label: 'Work',
      });

      const isLastSetOfLastExercise = exerciseIndex === exercises.length - 1 && set === exercise.sets;
      if (!isLastSetOfLastExercise && restSeconds > 0) {
        steps.push({
          type: 'rest',
          exerciseKey: exercise.exerciseKey,
          exerciseIndex,
          setNumber: set,
          totalSets: exercise.sets,
          reps: repsText,
          isTimed: true,
          seconds: restSeconds,
          label: 'Rest',
        });
      }
    }
  });

  return steps;
}
