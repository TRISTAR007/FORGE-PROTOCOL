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
import {
  EMPTY_PROGRESS,
  getSettings,
  type AvatarConfig,
  type Measurements,
  type NutritionProfile,
  type ProgressData,
  type ProgressPhoto,
  type QuestDay,
  type RoutineLog,
  type SessionLog,
  type StatId,
  type StrengthTests,
  type TrainingPlan,
  type UserSettings,
} from '@/lib/types';
import { applyQuestProgress, withQuestDay } from '@/lib/program/quests';
import { todayKey } from '@/lib/utils';
import { withDayStatus } from '@/lib/program/training-stats';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type Updater = (prev: ProgressData) => ProgressData;

interface ProgressContextValue {
  progress: ProgressData;
  settings: UserSettings;
  setPlan: (plan: TrainingPlan) => void;
  ensureQuestDay: (dateKey: string, day: QuestDay) => void;
  addQuestProgress: (dateKey: string, questId: string, amount: number | 'complete') => void;
  allocateStat: (stat: StatId) => void;
  resetStats: () => void;
  updateAvatar: (patch: Partial<AvatarConfig>) => void;
  recordBossAttempt: (arcId: string, score: number, defeated: boolean) => void;
  logSession: (log: SessionLog) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  toggleFavoriteExercise: (key: string) => void;
  addProtein: (dateKey: string, grams: number) => void;
  updateNutritionProfile: (patch: NutritionProfile) => void;
  setMealSwap: (mealTitle: string, optionIndex: number) => void;
  resetShoppingList: () => void;
  addProgressPhoto: (photo: ProgressPhoto) => void;
  removeProgressPhoto: (id: string) => void;
  logRoutine: (log: RoutineLog) => void;
  startArc: (arcId: string) => void;
  toggleArcDay: (arcId: string, arcDay: number) => void;
  leaveArc: (arcId: string) => void;
  toggleChecklistItem: (dayNumber: number, index: number) => void;
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
/**
 * Save status lives in its own context: it flips on every save, and keeping it
 * out of the main value means only the little sync badge re-renders, not every
 * screen that reads progress.
 */
const SaveStatusContext = createContext<SaveStatus>('idle');
const BACKUP_DEBOUNCE_MS = 400;

const SAVE_DEBOUNCE_MS = 500;
const RETRY_START_MS = 1000;
const RETRY_MAX_MS = 30000;

function normalize(raw: unknown): ProgressData {
  return { ...EMPTY_PROGRESS, ...((raw as Partial<ProgressData> | null) ?? {}) };
}

/**
 * Owns the user's progress document and keeps it synced to Supabase.
 *
 * Sync guarantees:
 *  - Changes are debounced, but flushed immediately when the tab is
 *    hidden / closed or the connection comes back.
 *  - Unsaved changes are mirrored to localStorage, so a crash or closed
 *    tab doesn't lose them — they're replayed on the next load.
 *  - Failed saves retry with exponential backoff.
 *  - Writes are conditional on the row's `updated_at` (optimistic
 *    concurrency). If another device saved in the meantime, the latest
 *    server copy is fetched and this device's unsaved changes are
 *    re-applied on top of it, instead of overwriting the other device.
 */
export function ProgressProvider({
  userId,
  initialData,
  initialUpdatedAt,
  children,
}: {
  userId: string;
  initialData: ProgressData;
  initialUpdatedAt: string | null;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState<ProgressData>(() => normalize(initialData));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const supabase = useMemo(() => createClient(), []);
  const backupKey = `forge:unsaved-progress:${userId}`;

  const latest = useRef<ProgressData>(progress);
  /** Server `updated_at` our local copy is based on. */
  const baseVersion = useRef<string | null>(initialUpdatedAt);
  /** Mutations not yet confirmed by the server, in order — replayed on conflict. */
  const pending = useRef<Updater[]>([]);
  const inFlight = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelay = useRef(RETRY_START_MS);
  const saveRef = useRef<() => Promise<void>>(async () => {});

  const writeBackup = useCallback(() => {
    try {
      localStorage.setItem(backupKey, JSON.stringify({ base: baseVersion.current, data: latest.current }));
    } catch {
      // Storage full / blocked (private mode) — cloud sync still works.
    }
  }, [backupKey]);

  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem(backupKey);
    } catch {
      // ignore
    }
  }, [backupKey]);

  const save = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    saveTimer.current = null;
    retryTimer.current = null;
    if (inFlight.current || pending.current.length === 0) return;

    inFlight.current = true;
    setSaveStatus('saving');
    const sentCount = pending.current.length;
    const snapshot = latest.current;
    let failed = false;

    try {
      let query = supabase.from('user_progress').update({ data: snapshot }).eq('user_id', userId);
      if (baseVersion.current) query = query.eq('updated_at', baseVersion.current);
      const { data: rows, error } = await query.select('updated_at');
      if (error) throw error;

      if (rows && rows.length > 0) {
        baseVersion.current = rows[0].updated_at as string;
        pending.current = pending.current.slice(sentCount);
      } else {
        // Nothing matched: the row changed elsewhere (or is missing).
        const { data: remote, error: fetchError } = await supabase
          .from('user_progress')
          .select('data, updated_at')
          .eq('user_id', userId)
          .maybeSingle();
        if (fetchError) throw fetchError;

        if (!remote) {
          const { data: created, error: insertError } = await supabase
            .from('user_progress')
            .upsert({ user_id: userId, data: snapshot }, { onConflict: 'user_id' })
            .select('updated_at')
            .single();
          if (insertError) throw insertError;
          baseVersion.current = created.updated_at as string;
          pending.current = pending.current.slice(sentCount);
        } else {
          // Rebase: re-apply every unsaved local change onto the newer
          // server copy, then loop around to save the merged result.
          baseVersion.current = remote.updated_at as string;
          const rebased = pending.current.reduce((acc, fn) => fn(acc), normalize(remote.data));
          latest.current = rebased;
          setProgress(rebased);
        }
      }
      retryDelay.current = RETRY_START_MS;
    } catch {
      failed = true;
    } finally {
      inFlight.current = false;
    }

    if (failed) {
      setSaveStatus('error');
      writeBackup();
      retryTimer.current = setTimeout(() => void saveRef.current(), retryDelay.current);
      retryDelay.current = Math.min(retryDelay.current * 2, RETRY_MAX_MS);
      return;
    }

    if (pending.current.length > 0) {
      writeBackup();
      void saveRef.current();
    } else {
      clearBackup();
      setSaveStatus('saved');
    }
  }, [supabase, userId, writeBackup, clearBackup]);

  const writeBackupRef = useRef(writeBackup);
  useEffect(() => {
    saveRef.current = save;
    writeBackupRef.current = writeBackup;
  }, [save, writeBackup]);

  const mutate = useCallback(
    (updater: Updater) => {
      const next = updater(latest.current);
      if (next === latest.current) return;
      latest.current = next;
      setProgress(next);
      pending.current.push(updater);
      // Serializing the whole document on every tap was a main-thread hitch;
      // batch it, and flush on hide (below) so nothing is lost.
      if (backupTimer.current) clearTimeout(backupTimer.current);
      backupTimer.current = setTimeout(writeBackup, BACKUP_DEBOUNCE_MS);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void saveRef.current(), SAVE_DEBOUNCE_MS);
    },
    [writeBackup]
  );

  // Replay changes left unsaved by a previous visit (closed tab, crash,
  // offline). Only applied if the server copy hasn't moved on since —
  // otherwise the server's newer data wins.
  useEffect(() => {
    let stored: { base: string | null; data: unknown } | null = null;
    try {
      stored = JSON.parse(localStorage.getItem(backupKey) ?? 'null');
    } catch {
      stored = null;
    }
    if (!stored?.data) return;
    if (stored.base !== initialUpdatedAt) {
      clearBackup();
      return;
    }
    const restored = normalize(stored.data);
    mutate(() => restored);
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush right away when the page is hidden/closed or we come back online.
  useEffect(() => {
    const flush = () => {
      if (backupTimer.current && pending.current.length > 0) {
        clearTimeout(backupTimer.current);
        backupTimer.current = null;
        writeBackupRef.current();
      }
      void saveRef.current();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    window.addEventListener('online', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('online', flush);
      flush();
    };
  }, []);

  const toggleChecklistItem = useCallback(
    (dayNumber: number, index: number) => {
      mutate((prev) => {
        const key = String(dayNumber);
        const current = prev.checklistCompleted[key] ?? [];
        const nextList = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
        return withDayStatus({ ...prev, checklistCompleted: { ...prev.checklistCompleted, [key]: nextList } }, dayNumber);
      });
    },
    [mutate]
  );

  const toggleExerciseCheck = useCallback(
    (dayNumber: number, index: number) => {
      mutate((prev) => {
        const key = String(dayNumber);
        const current = prev.exerciseChecks[key] ?? [];
        const nextList = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
        return withDayStatus({ ...prev, exerciseChecks: { ...prev.exerciseChecks, [key]: nextList } }, dayNumber);
      });
    },
    [mutate]
  );

  /** Called when a guided session finishes — checks every exercise and logs the day. */
  const completeAllExercises = useCallback(
    (dayNumber: number, count: number) => {
      mutate((prev) =>
        withDayStatus(
          {
            ...prev,
            exerciseChecks: {
              ...prev.exerciseChecks,
              [String(dayNumber)]: Array.from({ length: count }, (_, i) => i),
            },
          },
          dayNumber
        )
      );
    },
    [mutate]
  );

  const setWater = useCallback(
    (dateKey: string, amount: number) => {
      mutate((prev) => ({
        ...prev,
        waterIntake: { ...prev.waterIntake, [dateKey]: Math.max(0, Math.min(20, amount)) },
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
        const next = current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId];
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

  const logSession = useCallback(
    (log: SessionLog) => {
      mutate((prev) => ({
        ...prev,
        sessionLogs: [...prev.sessionLogs.filter((l) => l.dayNumber !== log.dayNumber), log].sort(
          (a, b) => a.dayNumber - b.dayNumber
        ),
      }));
    },
    [mutate]
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      mutate((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    },
    [mutate]
  );

  const toggleFavoriteExercise = useCallback(
    (key: string) => {
      mutate((prev) => ({
        ...prev,
        favoriteExercises: prev.favoriteExercises.includes(key)
          ? prev.favoriteExercises.filter((k) => k !== key)
          : [...prev.favoriteExercises, key],
      }));
    },
    [mutate]
  );

  const addProtein = useCallback(
    (dateKey: string, grams: number) => {
      mutate((prev) => ({
        ...prev,
        proteinLog: { ...prev.proteinLog, [dateKey]: Math.max(0, Math.round((prev.proteinLog[dateKey] ?? 0) + grams)) },
      }));
    },
    [mutate]
  );

  const updateNutritionProfile = useCallback(
    (patch: NutritionProfile) => {
      mutate((prev) => ({ ...prev, nutritionProfile: { ...prev.nutritionProfile, ...patch } }));
    },
    [mutate]
  );

  const setMealSwap = useCallback(
    (mealTitle: string, optionIndex: number) => {
      mutate((prev) => ({ ...prev, mealSwaps: { ...prev.mealSwaps, [mealTitle]: optionIndex } }));
    },
    [mutate]
  );

  const resetShoppingList = useCallback(() => {
    mutate((prev) => (Object.keys(prev.shoppingListChecked).length === 0 ? prev : { ...prev, shoppingListChecked: {} }));
  }, [mutate]);

  const addProgressPhoto = useCallback(
    (photo: ProgressPhoto) => {
      mutate((prev) => ({ ...prev, progressPhotos: [...prev.progressPhotos.filter((p) => p.id !== photo.id), photo] }));
    },
    [mutate]
  );

  const removeProgressPhoto = useCallback(
    (id: string) => {
      mutate((prev) => ({ ...prev, progressPhotos: prev.progressPhotos.filter((p) => p.id !== id) }));
    },
    [mutate]
  );

  const logRoutine = useCallback(
    (log: RoutineLog) => {
      // Capped so the synced document stays small; XP only needs the count.
      mutate((prev) => ({ ...prev, routineLogs: [...prev.routineLogs, log].slice(-300) }));
    },
    [mutate]
  );

  const startArc = useCallback(
    (arcId: string) => {
      mutate((prev) => ({ ...prev, arcs: { ...prev.arcs, [arcId]: { startedOn: todayKey(), doneDays: [] } } }));
    },
    [mutate]
  );

  const toggleArcDay = useCallback(
    (arcId: string, arcDay: number) => {
      mutate((prev) => {
        const arc = prev.arcs[arcId];
        if (!arc) return prev;
        const done = arc.doneDays.includes(arcDay)
          ? arc.doneDays.filter((d) => d !== arcDay)
          : [...arc.doneDays, arcDay].sort((a, b) => a - b);
        return { ...prev, arcs: { ...prev.arcs, [arcId]: { ...arc, doneDays: done } } };
      });
    },
    [mutate]
  );

  const leaveArc = useCallback(
    (arcId: string) => {
      mutate((prev) => {
        if (!prev.arcs[arcId]) return prev;
        const arcs = { ...prev.arcs };
        delete arcs[arcId];
        return { ...prev, arcs };
      });
    },
    [mutate]
  );

  const setPlan = useCallback(
    (plan: TrainingPlan) => {
      mutate((prev) => ({ ...prev, plan }));
    },
    [mutate]
  );

  const ensureQuestDay = useCallback(
    (dateKey: string, day: QuestDay) => {
      mutate((prev) => withQuestDay(prev, dateKey, day));
    },
    [mutate]
  );

  const addQuestProgress = useCallback(
    (dateKey: string, questId: string, amount: number | 'complete') => {
      mutate((prev) => applyQuestProgress(prev, dateKey, questId, amount));
    },
    [mutate]
  );

  const allocateStat = useCallback(
    (stat: StatId) => {
      mutate((prev) => ({ ...prev, statAlloc: { ...prev.statAlloc, [stat]: (prev.statAlloc[stat] ?? 0) + 1 } }));
    },
    [mutate]
  );

  const resetStats = useCallback(() => {
    mutate((prev) => (Object.keys(prev.statAlloc).length === 0 ? prev : { ...prev, statAlloc: {} }));
  }, [mutate]);

  const updateAvatar = useCallback(
    (patch: Partial<AvatarConfig>) => {
      mutate((prev) => ({ ...prev, avatar: { ...prev.avatar, ...patch } }));
    },
    [mutate]
  );

  const recordBossAttempt = useCallback(
    (arcId: string, score: number, defeated: boolean) => {
      mutate((prev) => {
        const current = prev.bosses[arcId];
        const next = { ...current, best: Math.max(current?.best ?? 0, score) };
        if (defeated && !current?.defeatedOn) next.defeatedOn = todayKey();
        return { ...prev, bosses: { ...prev.bosses, [arcId]: next } };
      });
    },
    [mutate]
  );

  const settings = useMemo(() => getSettings(progress), [progress]);

  // Memoized so consumers only re-render when progress actually changes.
  const value = useMemo<ProgressContextValue>(() => ({
    progress,
    settings,
    setPlan,
    ensureQuestDay,
    addQuestProgress,
    allocateStat,
    resetStats,
    updateAvatar,
    recordBossAttempt,
    logSession,
    updateSettings,
    toggleFavoriteExercise,
    addProtein,
    updateNutritionProfile,
    setMealSwap,
    resetShoppingList,
    addProgressPhoto,
    removeProgressPhoto,
    logRoutine,
    startArc,
    toggleArcDay,
    leaveArc,
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
  }), [
    progress, settings, setPlan, ensureQuestDay, addQuestProgress, allocateStat, resetStats, updateAvatar,
    recordBossAttempt, logSession, updateSettings, toggleFavoriteExercise, addProtein, updateNutritionProfile,
    setMealSwap, resetShoppingList, addProgressPhoto, removeProgressPhoto, logRoutine, startArc, toggleArcDay,
    leaveArc, toggleChecklistItem, toggleExerciseCheck, completeAllExercises, setWater, toggleHabitDay,
    toggleDailyTask, saveMeasurements, recordStrengthTest, toggleShoppingItem, completeOnboarding,
    markMilestoneCelebrated,
  ]);

  return (
    <SaveStatusContext.Provider value={saveStatus}>
      <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
    </SaveStatusContext.Provider>
  );
}

export function useSaveStatus() {
  return useContext(SaveStatusContext);
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
