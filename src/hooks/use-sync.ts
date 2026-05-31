'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TrackerSyncState {
  completedTasks: Set<string>;
  consumedDiet: Set<string>;
  completedSets: Set<string>;
  energyLevel: number;
  sleepBed: string;
  sleepWake: string;
  steps: number;
  weight: number;
  currentWeek: number;
  strictMode: boolean;
  history: Record<string, { score: number; weight: number; energyLevel: number; steps: number }>;
}

interface SerializedTrackerState {
  completedTasks: string[];
  consumedDiet: string[];
  completedSets: string[];
  energyLevel: number;
  sleepBed: string;
  sleepWake: string;
  steps: number;
  weight: number;
  currentWeek: number;
  strictMode: boolean;
  history: Record<string, { score: number; weight: number; energyLevel: number; steps: number }>;
}

function serializeState(state: TrackerSyncState): SerializedTrackerState {
  return {
    completedTasks: Array.from(state.completedTasks),
    consumedDiet: Array.from(state.consumedDiet),
    completedSets: Array.from(state.completedSets),
    energyLevel: state.energyLevel,
    sleepBed: state.sleepBed,
    sleepWake: state.sleepWake,
    steps: state.steps,
    weight: state.weight,
    currentWeek: state.currentWeek,
    strictMode: state.strictMode,
    history: state.history,
  };
}

export function useSync(state: TrackerSyncState): {
  syncToServer: () => void;
  isSyncing: boolean;
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<TrackerSyncState>(state);

  // Keep the ref in sync with the latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const syncToServer = useCallback(() => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const serialized = serializeState(stateRef.current);
        const response = await fetch('/api/tracker', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serialized),
        });

        if (!response.ok) {
          console.error('Sync failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Sync error:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { syncToServer, isSyncing };
}

export interface LoadedTrackerState {
  completedTasks: string[];
  consumedDiet: string[];
  completedSets: string[];
  energyLevel: number;
  sleepBed: string;
  sleepWake: string;
  steps: number;
  weight: number;
  currentWeek: number;
  strictMode: boolean;
  history: Record<string, { score: number; weight: number; energyLevel: number; steps: number }>;
}

export function useLoadState(): {
  data: LoadedTrackerState | null;
  isLoading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<LoadedTrackerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/tracker', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to load state: ${response.status}`);
        }

        const json = await response.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
