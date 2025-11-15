'use client';

import { useHevyStore } from './store';

export const useHevyProfile = () =>
  useHevyStore((state) => state.profiles[state.activeProfileId]);

export const useHevyPreferences = () => useHevyStore((state) => state.preferences);

export const useHevyDashboard = () =>
  useHevyStore((state) => {
    const profile = state.profiles[state.activeProfileId];
    const nextWorkoutId = profile?.nextWorkoutId;
    const nextWorkout =
      (nextWorkoutId && state.workouts.find((workout) => workout.id === nextWorkoutId)) ??
      state.workouts.find((workout) => workout.status === 'scheduled') ??
      state.workouts[0];
    return {
      profile,
      readiness: profile?.readiness,
      nextWorkout,
      quickStats: state.quickStats,
      trainingFocus: state.trainingFocus,
    };
  });

export const useHevyActions = () =>
  useHevyStore((state) => ({
    setActiveProfile: state.setActiveProfile,
    updateProfile: state.updateProfile,
    updatePreference: state.updatePreference,
    logWorkout: state.logWorkout,
    recordMeasurement: state.recordMeasurement,
    seedData: state.seedData,
    saveDraftWorkout: state.saveDraftWorkout,
    clearDraftWorkout: state.clearDraftWorkout,
    startRestTimer: state.startRestTimer,
    cancelRestTimer: state.cancelRestTimer,
    setRestTimerRemaining: state.setRestTimerRemaining,
    completeRestTimer: state.completeRestTimer,
  }));
