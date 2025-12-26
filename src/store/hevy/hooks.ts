'use client';

import * as React from 'react';
import { useStore } from 'zustand';

import type { HevyStore } from './store';
import { hevyStore } from './store';

export const useHevyStore = <T>(selector: (state: HevyStore) => T) =>
  useStore(hevyStore, selector);

export const useHevyProfile = () =>
  useHevyStore((state) => state.profiles[state.activeProfileId]);

export const useHevyPreferences = () => useHevyStore((state) => state.preferences);

export const useHevyDashboard = () => {
  const profile = useHevyStore((state) => state.profiles[state.activeProfileId]);
  const workouts = useHevyStore((state) => state.workouts);
  const quickStats = useHevyStore((state) => state.quickStats);
  const trainingFocus = useHevyStore((state) => state.trainingFocus);

  const nextWorkout = React.useMemo(() => {
    const nextWorkoutId = profile?.nextWorkoutId;
    return (
      (nextWorkoutId && workouts.find((workout) => workout.id === nextWorkoutId)) ??
      workouts.find((workout) => workout.status === 'scheduled') ??
      workouts[0]
    );
  }, [profile?.nextWorkoutId, workouts]);

  return React.useMemo(
    () => ({
      profile,
      readiness: profile?.readiness,
      nextWorkout,
      quickStats,
      trainingFocus,
    }),
    [profile, nextWorkout, quickStats, trainingFocus],
  );
};

export const useHevyActions = () => {
  const setActiveProfile = useHevyStore((state) => state.setActiveProfile);
  const updateProfile = useHevyStore((state) => state.updateProfile);
  const updatePreference = useHevyStore((state) => state.updatePreference);
  const logWorkout = useHevyStore((state) => state.logWorkout);
  const recordMeasurement = useHevyStore((state) => state.recordMeasurement);
  const seedData = useHevyStore((state) => state.seedData);
  const saveDraftWorkout = useHevyStore((state) => state.saveDraftWorkout);
  const clearDraftWorkout = useHevyStore((state) => state.clearDraftWorkout);
  const startRestTimer = useHevyStore((state) => state.startRestTimer);
  const cancelRestTimer = useHevyStore((state) => state.cancelRestTimer);
  const setRestTimerRemaining = useHevyStore((state) => state.setRestTimerRemaining);
  const completeRestTimer = useHevyStore((state) => state.completeRestTimer);

  return React.useMemo(
    () => ({
      setActiveProfile,
      updateProfile,
      updatePreference,
      logWorkout,
      recordMeasurement,
      seedData,
      saveDraftWorkout,
      clearDraftWorkout,
      startRestTimer,
      cancelRestTimer,
      setRestTimerRemaining,
      completeRestTimer,
    }),
    [
      setActiveProfile,
      updateProfile,
      updatePreference,
      logWorkout,
      recordMeasurement,
      seedData,
      saveDraftWorkout,
      clearDraftWorkout,
      startRestTimer,
      cancelRestTimer,
      setRestTimerRemaining,
      completeRestTimer,
    ],
  );
};
