import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type HevyReadinessMetric = {
  label: string;
  value: string;
  trend: string;
};

export type HevyReadiness = {
  score: number;
  badgeLabel: string;
  summary: string;
  metrics: HevyReadinessMetric[];
  fatigue: { label: string; value: string };
  focus: { label: string; value: string };
};

export type HevyProfile = {
  id: string;
  name: string;
  planLabel: string;
  readiness: HevyReadiness;
  streakDays: number;
  nextWorkoutId?: string;
};

export type HevyPreferences = {
  unitWeight: 'lb' | 'kg';
  unitLength: 'in' | 'cm';
  theme: 'system' | 'dark' | 'light';
  defaultRestTimerSeconds: number;
};

export type HevyWorkoutExercise = {
  id: string;
  name: string;
  scheme: string;
};

export type HevyWorkout = {
  id: string;
  name: string;
  dayLabel: string;
  scheduledFor: string;
  durationMinutes: number;
  focus: string;
  volume: number;
  intensity: string;
  status: 'scheduled' | 'completed';
  exercises: HevyWorkoutExercise[];
};

export type HevyRoutine = {
  id: string;
  name: string;
  durationWeeks: number;
  focus: string;
};

export type HevyMeasurement = {
  id: string;
  date: string;
  weight: number;
};

export type HevyQuickStat = {
  id: string;
  label: string;
  value: string;
  delta: string;
};

export type HevyTrainingFocusBlock = {
  id: string;
  label: string;
  completion: number;
};

export type HevyWorkoutDraft = {
  id: string;
  name: string;
  notes?: string;
  exerciseIds: string[];
};

export type HevyRestTimer = {
  id: string;
  durationSeconds: number;
  startedAt: number;
  remainingSeconds: number;
  status: 'idle' | 'running' | 'finished';
};

interface HevyStoreData {
  profiles: Record<string, HevyProfile>;
  activeProfileId: string;
  preferences: HevyPreferences;
  workouts: HevyWorkout[];
  routines: HevyRoutine[];
  measurements: HevyMeasurement[];
  quickStats: HevyQuickStat[];
  trainingFocus: HevyTrainingFocusBlock[];
  draftWorkout: HevyWorkoutDraft | null;
  restTimer: HevyRestTimer | null;
}

interface HevyStoreActions {
  setActiveProfile: (id: string) => void;
  updateProfile: (payload: Partial<HevyProfile>) => void;
  updatePreference: <K extends keyof HevyPreferences>(
    key: K,
    value: HevyPreferences[K],
  ) => void;
  logWorkout: (entry: HevyWorkout) => void;
  recordMeasurement: (entry: HevyMeasurement) => void;
  seedData: (payload: Partial<HevyStoreData>) => void;
  saveDraftWorkout: (draft: HevyWorkoutDraft) => void;
  clearDraftWorkout: () => void;
  startRestTimer: (durationSeconds: number) => void;
  cancelRestTimer: () => void;
  setRestTimerRemaining: (remainingSeconds: number) => void;
  completeRestTimer: () => void;
}

export type HevyStore = HevyStoreData & HevyStoreActions;

const defaultProfile: HevyProfile = {
  id: 'athlete-demo',
  name: 'Avery Parker',
  planLabel: 'Week 6 · PPL',
  readiness: {
    score: 82,
    badgeLabel: 'Primed',
    summary: 'Solid sleep + low stress. Heavy pulls encouraged.',
    metrics: [
      { label: 'Sleep', value: '7h 42m', trend: '+36m vs avg' },
      { label: 'Recovery', value: 'HRV · 112', trend: 'Neutral' },
      { label: 'Stress', value: 'Low', trend: 'Breath score · 86' },
    ],
    fatigue: { label: 'Fatigue', value: '28%' },
    focus: { label: 'Goal focus', value: 'Pull emphasis' },
  },
  streakDays: 12,
  nextWorkoutId: 'wk-pull-01',
};

const defaultWorkouts: HevyWorkout[] = [
  {
    id: 'wk-pull-01',
    name: 'Pull · Week 3',
    dayLabel: 'Today · 6:00 PM',
    scheduledFor: new Date().toISOString(),
    durationMinutes: 70,
    focus: 'Back & Posterior Chain',
    volume: 14280,
    intensity: 'RPE 8.2',
    status: 'scheduled',
    exercises: [
      { id: 'deadlift', name: 'Conventional Deadlift', scheme: '4 × 5 · 315 lb' },
      { id: 'pullups', name: 'Weighted Pull-ups', scheme: '4 × 8 · +45 lb' },
      { id: 'row', name: 'Single-arm Row', scheme: '3 × 10 · 80 lb' },
    ],
  },
  {
    id: 'wk-push-01',
    name: 'Push · Week 3',
    dayLabel: 'Yesterday · 5:30 PM',
    scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    durationMinutes: 68,
    focus: 'Chest & Shoulders',
    volume: 12860,
    intensity: 'RPE 8.0',
    status: 'completed',
    exercises: [
      { id: 'bench', name: 'Incline Bench Press', scheme: '4 × 6 · 185 lb' },
      { id: 'dips', name: 'Weighted Dips', scheme: '3 × 10 · +35 lb' },
      { id: 'ohp', name: 'Seated Shoulder Press', scheme: '3 × 8 · 60 lb' },
    ],
  },
];

const defaultQuickStats: HevyQuickStat[] = [
  { id: 'weeklyVolume', label: 'Weekly volume', value: '42,180 lb', delta: '+8%' },
  { id: 'sessions', label: 'Sessions', value: '4 / 5', delta: 'One left' },
  { id: 'intensity', label: 'Avg intensity', value: 'RPE 8.2', delta: 'Heavy push' },
  { id: 'streak', label: 'Streak', value: '12 days', delta: 'Keep it going' },
];

const defaultTrainingFocus: HevyTrainingFocusBlock[] = [
  { id: 'push', label: 'Push', completion: 60 },
  { id: 'pull', label: 'Pull', completion: 40 },
  { id: 'legs', label: 'Legs', completion: 100 },
  { id: 'core', label: 'Core', completion: 80 },
];

const defaultStoreData: HevyStoreData = {
  profiles: {
    [defaultProfile.id]: defaultProfile,
  },
  activeProfileId: defaultProfile.id,
  preferences: {
    unitWeight: 'lb',
    unitLength: 'in',
    theme: 'system',
    defaultRestTimerSeconds: 90,
  },
  workouts: defaultWorkouts,
  routines: [
    {
      id: 'routine-ppl',
      name: 'Push Pull Legs Elite',
      durationWeeks: 8,
      focus: 'Strength & Hypertrophy',
    },
  ],
  measurements: [{ id: 'm-1', date: new Date().toISOString(), weight: 176.2 }],
  quickStats: defaultQuickStats,
  trainingFocus: defaultTrainingFocus,
  draftWorkout: null,
  restTimer: null,
};

const updateQuickStatsFromWorkouts = (store: HevyStoreData) => {
  const totalVolume = store.workouts.reduce((sum, workout) => sum + workout.volume, 0);
  const completedSessions = store.workouts.filter(
    (workout) => workout.status === 'completed',
  ).length;
  const volumeStat = store.quickStats.find((stat) => stat.id === 'weeklyVolume');
  if (volumeStat) {
    volumeStat.value = `${totalVolume.toLocaleString()} lb`;
  }
  const sessionStat = store.quickStats.find((stat) => stat.id === 'sessions');
  if (sessionStat) {
    sessionStat.value = `${completedSessions} / 5`;
  }
  const streakStat = store.quickStats.find((stat) => stat.id === 'streak');
  const activeProfile = store.profiles[store.activeProfileId];
  if (streakStat && activeProfile) {
    streakStat.value = `${activeProfile.streakDays} days`;
  }
};

const createStorage = () =>
  createJSONStorage<HevyStore>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage;
    }
    let memory: Record<string, string> = {};
    const fallback: Storage = {
      getItem: (name: string) => memory[name] ?? null,
      setItem: (name: string, value: string) => {
        memory[name] = value;
      },
      removeItem: (name: string) => {
        delete memory[name];
      },
      clear: () => {
        memory = {};
      },
      key: (index: number) => Object.keys(memory)[index] ?? null,
      get length() {
        return Object.keys(memory).length;
      },
    };
    return fallback;
  });

export const useHevyStore = create<HevyStore>()(
  persist(
    immer((set, get) => ({
      ...defaultStoreData,
      setActiveProfile: (id) => {
        if (!get().profiles[id]) return;
        set({ activeProfileId: id });
      },
      updateProfile: (payload) => {
        set((state) => {
          const current = state.profiles[state.activeProfileId];
          state.profiles[state.activeProfileId] = {
            ...current,
            ...payload,
            readiness: {
              ...current.readiness,
              ...(payload.readiness ?? {}),
              metrics: payload.readiness?.metrics ?? current.readiness.metrics,
              fatigue: payload.readiness?.fatigue ?? current.readiness.fatigue,
              focus: payload.readiness?.focus ?? current.readiness.focus,
            },
          };
          updateQuickStatsFromWorkouts(state);
        });
      },
      updatePreference: (key, value) => {
        set((state) => {
          state.preferences[key] = value;
        });
      },
      logWorkout: (entry) => {
        set((state) => {
          state.workouts = [
            entry,
            ...state.workouts.filter((workout) => workout.id !== entry.id),
          ];
          const profile = state.profiles[state.activeProfileId];
          if (profile) {
            profile.nextWorkoutId = state.workouts.find(
              (workout) => workout.status === 'scheduled',
            )?.id;
            profile.streakDays = profile.streakDays + 1;
          }
          updateQuickStatsFromWorkouts(state);
        });
      },
      recordMeasurement: (entry) => {
        set((state) => {
          state.measurements = [
            entry,
            ...state.measurements.filter((measurement) => measurement.id !== entry.id),
          ];
        });
      },
      seedData: (payload) => {
        set((state) => {
          Object.assign(state, payload);
          updateQuickStatsFromWorkouts(state);
        });
      },
      saveDraftWorkout: (draft) => {
        set((state) => {
          state.draftWorkout = draft;
        });
      },
      clearDraftWorkout: () => {
        set((state) => {
          state.draftWorkout = null;
        });
      },
      startRestTimer: (durationSeconds) => {
        set((state) => {
          state.restTimer = {
            id: `rest-${Date.now()}`,
            durationSeconds,
            startedAt: Date.now(),
            remainingSeconds: durationSeconds,
            status: 'running',
          };
        });
      },
      cancelRestTimer: () => {
        set((state) => {
          state.restTimer = null;
        });
      },
      setRestTimerRemaining: (remainingSeconds) => {
        set((state) => {
          if (!state.restTimer) return;
          state.restTimer.remainingSeconds = remainingSeconds;
        });
      },
      completeRestTimer: () => {
        set((state) => {
          if (!state.restTimer) return;
          state.restTimer.status = 'finished';
        });
      },
    })),
    {
      name: 'hevy-app-state',
      version: 1,
      storage: createStorage(),
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        preferences: state.preferences,
        workouts: state.workouts,
        routines: state.routines,
        measurements: state.measurements,
        quickStats: state.quickStats,
        trainingFocus: state.trainingFocus,
        draftWorkout: state.draftWorkout,
        restTimer: state.restTimer,
      }),
    },
  ),
);
