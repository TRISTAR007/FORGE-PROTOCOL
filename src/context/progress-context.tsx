'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { EMPTY_PROGRESS, type Measurements, type ProgressData, type StrengthTests } from '@/lib/types';
import { todayKey } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ProgressContextValue {
  progress: ProgressData;
  saveStatus: SaveStatus;
  toggleChecklistItem: (dayNumber: number, index: number, checklistLength: number) => void;
  toggleExerciseCheck: (dayNumber: number, index: number) => void;
  completeAllExercises: (dayNumber: number, count: number) => void;
  setWater: (dateKey: string, amount: number) => void;
  toggleHabitDay: (dateKey: string) => void;
  toggleDailyTask: (dateKey: string, taskId: string) => void;
  saveMeasurements: (measurements: Measurements) => void;
  recordStrengthTest: (tests: StrengthTests) => void;
  toggleShoppingItem: (item: string) => void;
  completeOnboarding: (measurements?: Measurements) => void;
  markMilestoneCelebrated: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  userId,
  initialData,
  children,
}: {
  userId: string;
  initialData: ProgressData;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState<ProgressData>({ ...EMPTY_PROGRESS, ...initialData });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const supabase = useMemo(() => createClient(), []);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(progress);
  latest.current = progress;

  const persist = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('user_progress')
        .upsert({ user_id: userId, data: latest.current }, { onConflict: 'user_id' });
      setSaveStatus(error ? 'error' : 'saved');
    }, 500);
  }, [supabase, userId]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const mutate = useCallback(
    (updater: (prev: ProgressData) => ProgressData) => {
      setProgress((prev) => {
        const next = updater(prev);
        return next;
      });
      persist();
    },
    [persist]
  );

  const toggleChecklistItem = useCallback(
    (dayNumber: number, index: number, checklistLength: number) => {
      mutate((prev) => {
        const key = String(dayNumber);
        const current = prev.checklistCompleted[key] ?? [];
        const has = current.includes(index);
        const nextList = has ? current.filter((i) => i !== index) : [...current, index];

        const completedDays = new Set(prev.completedDays);
        if (nextList.length === checklistLength && checklistLength > 0) {
          completedDays.add(dayNumber);
        } else {
          completedDays.delete(dayNumber);
        }

        return {
          ...prev,
          checklistCompleted: { ...prev.checklistCompleted, [key]: nextList },
          completedDays: Array.from(completedDays).sort((a, b) => a - b),
        };
      });
    },
    [mutate]
  );

  const toggleExerciseCheck = useCallback(
    (dayNumber: number, index: number) => {
      mutate((prev) => {
        const key = String(dayNumber);
        const current = prev.exerciseChecks[key] ?? [];
        const has = current.includes(index);
        const nextList = has ? current.filter((i) => i !== index) : [...current, index];
        return { ...prev, exerciseChecks: { ...prev.exerciseChecks, [key]: nextList } };
      });
    },
    [mutate]
  );

  const completeAllExercises = useCallback(
    (dayNumber: number, count: number) => {
      mutate((prev) => ({
        ...prev,
        exerciseChecks: {
          ...prev.exerciseChecks,
          [String(dayNumber)]: Array.from({ length: count }, (_, i) => i),
        },
      }));
    },
    [mutate]
  );

  const setWater = useCallback(
    (dateKey: string, amount: number) => {
      mutate((prev) => ({
        ...prev,
        waterIntake: { ...prev.waterIntake, [dateKey]: Math.max(0, Math.min(12, amount)) },
      }));
    },
    [mutate]
  );

  const toggleHabitDay = useCallback(
    (dateKey: string) => {
      mutate((prev) => {
        const habits = { ...prev.habits };
        if (habits[dateKey]) delete habits[dateKey];
        else habits[dateKey] = true;
        return { ...prev, habits };
      });
    },
    [mutate]
  );

  const toggleDailyTask = useCallback(
    (dateKey: string, taskId: string) => {
      mutate((prev) => {
        const current = prev.dailyTasks[dateKey] ?? [];
        const has = current.includes(taskId);
        const next = has ? current.filter((id) => id !== taskId) : [...current, taskId];
        return { ...prev, dailyTasks: { ...prev.dailyTasks, [dateKey]: next } };
      });
    },
    [mutate]
  );

  const saveMeasurements = useCallback(
    (measurements: Measurements) => {
      mutate((prev) => {
        const date = todayKey();
        const entry = { date, ...measurements };
        const history = [...prev.measurementHistory.filter((e) => e.date !== date), entry];
        return {
          ...prev,
          measurements: { ...prev.measurements, ...measurements, updatedAt: new Date().toISOString() },
          measurementHistory: history,
        };
      });
    },
    [mutate]
  );

  const recordStrengthTest = useCallback(
    (tests: StrengthTests) => {
      mutate((prev) => {
        const date = todayKey();
        const entry = { date, ...tests };
        const history = [...prev.strengthHistory.filter((e) => e.date !== date), entry];
        return {
          ...prev,
          strengthTests: { ...prev.strengthTests, ...tests, updatedAt: new Date().toISOString() },
          strengthHistory: history,
        };
      });
    },
    [mutate]
  );

  const toggleShoppingItem = useCallback(
    (item: string) => {
      mutate((prev) => ({
        ...prev,
        shoppingListChecked: { ...prev.shoppingListChecked, [item]: !prev.shoppingListChecked[item] },
      }));
    },
    [mutate]
  );

  const completeOnboarding = useCallback(
    (measurements?: Measurements) => {
      mutate((prev) => {
        if (!measurements || Object.keys(measurements).length === 0) {
          return { ...prev, onboardingCompleted: true };
        }
        const date = todayKey();
        const entry = { date, ...measurements };
        const history = [...prev.measurementHistory.filter((e) => e.date !== date), entry];
        return {
          ...prev,
          onboardingCompleted: true,
          measurements: { ...prev.measurements, ...measurements, updatedAt: new Date().toISOString() },
          measurementHistory: history,
        };
      });
    },
    [mutate]
  );

  const markMilestoneCelebrated = useCallback(
    (id: string) => {
      mutate((prev) => {
        if (prev.celebratedMilestones.includes(id)) return prev;
        return { ...prev, celebratedMilestones: [...prev.celebratedMilestones, id] };
      });
    },
    [mutate]
  );

  const value: ProgressContextValue = {
    progress,
    saveStatus,
    toggleChecklistItem,
    toggleExerciseCheck,
    completeAllExercises,
    setWater,
    toggleHabitDay,
    toggleDailyTask,
    saveMeasurements,
    recordStrengthTest,
    toggleShoppingItem,
    completeOnboarding,
    markMilestoneCelebrated,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
