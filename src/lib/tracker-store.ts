'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DAYS_OF_WEEK, type DayOfWeek, type HistoryMap, type PhotoCheckin } from './tracker-data';

export type TabId = 'daily' | 'diet' | 'workout' | 'stats' | 'guide';

export interface AIMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface TrackerState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Core tracking state
  completedTasks: Set<string>;
  consumedDiet: Set<string>;
  completedSets: Set<string>;
  
  // Daily metrics
  energyLevel: number;
  sleepBed: string;
  sleepWake: string;
  steps: number;
  weight: number;
  
  // Program config
  currentWeek: number;
  strictMode: boolean;
  workoutDay: DayOfWeek;
  
  // History
  history: HistoryMap;
  
  // Photos
  photos: PhotoCheckin[];
  
  // UI State
  showGrocery: boolean;
  soundEnabled: boolean;
  isAIOpen: boolean;
  aiMessages: AIMessage[];
  
  // Rest Timer
  restTimerSeconds: number;
  isTimerRunning: boolean;
  
  // Loading
  isLoading: boolean;

  // Actions
  toggleTask: (taskId: string) => void;
  toggleDiet: (itemId: string) => void;
  toggleSet: (setId: string) => void;
  setEnergy: (level: number) => void;
  setSleepBed: (val: string) => void;
  setSleepWake: (val: string) => void;
  setSteps: (val: number) => void;
  setWeight: (val: number) => void;
  setWeek: (val: number) => void;
  setWorkoutDay: (day: DayOfWeek) => void;
  toggleStrictMode: () => void;
  toggleGrocery: (show: boolean) => void;
  toggleSound: () => void;
  toggleAI: () => void;
  addAIMessage: (msg: AIMessage) => void;
  clearAIHistory: () => void;
  
  // Rest Timer
  startRestTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  
  // History
  updateHistory: (date: string, entry: { score: number; weight: number; energyLevel: number; steps: number }) => void;
  
  // Photos
  addPhoto: (photo: PhotoCheckin) => void;
  
  // Loading
  setIsLoading: (val: boolean) => void;
  
  // Load from server
  loadFromServer: (data: {
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
    history: HistoryMap;
  }) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeTab: 'daily',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Core tracking
      completedTasks: new Set<string>(),
      consumedDiet: new Set<string>(),
      completedSets: new Set<string>(),
      
      // Daily metrics
      energyLevel: 0,
      sleepBed: '22:30',
      sleepWake: '06:30',
      steps: 0,
      weight: 56.2,
      
      // Program config
      currentWeek: 1,
      strictMode: true,
      workoutDay: DAYS_OF_WEEK[new Date().getDay()] as DayOfWeek,
      
      // History
      history: {},
      
      // Photos
      photos: [],
      
      // UI State
      showGrocery: false,
      soundEnabled: true,
      isAIOpen: false,
      aiMessages: [{ role: 'assistant', text: "Hi Uday! I monitor your live checkboxes. Ask me what you've eaten today, or what alternatives you can use for your planned foods!" }],
      
      // Rest Timer
      restTimerSeconds: 0,
      isTimerRunning: false,
      
      // Loading
      isLoading: true,

      // Actions
      toggleTask: (taskId) => set((state) => {
        const newSet = new Set(state.completedTasks);
        if (newSet.has(taskId)) newSet.delete(taskId); else newSet.add(taskId);
        return { completedTasks: newSet };
      }),
      
      toggleDiet: (itemId) => set((state) => {
        const newSet = new Set(state.consumedDiet);
        if (newSet.has(itemId)) newSet.delete(itemId); else newSet.add(itemId);
        return { consumedDiet: newSet };
      }),
      
      toggleSet: (setId) => set((state) => {
        const newSet = new Set(state.completedSets);
        if (newSet.has(setId)) newSet.delete(setId); else newSet.add(setId);
        return { completedSets: newSet };
      }),
      
      setEnergy: (level) => set({ energyLevel: level }),
      setSleepBed: (val) => set({ sleepBed: val }),
      setSleepWake: (val) => set({ sleepWake: val }),
      setSteps: (val) => set({ steps: val }),
      setWeight: (val) => set({ weight: val }),
      setWeek: (val) => set({ currentWeek: val }),
      setWorkoutDay: (day) => set({ workoutDay: day }),
      toggleStrictMode: () => set((state) => ({ strictMode: !state.strictMode })),
      toggleGrocery: (show) => set({ showGrocery: show }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleAI: () => set((state) => ({ isAIOpen: !state.isAIOpen })),
      addAIMessage: (msg) => set((state) => ({ aiMessages: [...state.aiMessages, msg] })),
      clearAIHistory: () => set({ aiMessages: [{ role: 'assistant', text: "Hi Uday! I monitor your live checkboxes. Ask me what you've eaten today, or what alternatives you can use for your planned foods!" }] }),
      
      // Rest Timer
      startRestTimer: (seconds) => set({ restTimerSeconds: seconds, isTimerRunning: true }),
      tickTimer: () => set((state) => {
        if (state.restTimerSeconds <= 1) {
          return { restTimerSeconds: 0, isTimerRunning: false };
        }
        return { restTimerSeconds: state.restTimerSeconds - 1 };
      }),
      stopTimer: () => set({ restTimerSeconds: 0, isTimerRunning: false }),
      
      // History
      updateHistory: (date, entry) => set((state) => ({
        history: { ...state.history, [date]: entry }
      })),
      
      // Photos
      addPhoto: (photo) => set((state) => {
        const existingIndex = state.photos.findIndex(p => p.date === photo.date);
        let newPhotos;
        if (existingIndex >= 0) {
          newPhotos = [...state.photos];
          newPhotos[existingIndex] = photo;
        } else {
          newPhotos = [...state.photos, photo];
        }
        newPhotos.sort((a, b) => a.timestamp - b.timestamp);
        return { photos: newPhotos };
      }),
      
      setIsLoading: (val) => set({ isLoading: val }),
      
      loadFromServer: (data) => set({
        completedTasks: new Set(data.completedTasks),
        consumedDiet: new Set(data.consumedDiet),
        completedSets: new Set(data.completedSets),
        energyLevel: data.energyLevel,
        sleepBed: data.sleepBed,
        sleepWake: data.sleepWake,
        steps: data.steps,
        weight: data.weight,
        currentWeek: data.currentWeek,
        strictMode: data.strictMode,
        history: data.history,
        isLoading: false,
      }),
    }),
    {
      name: 'uday-90day-tracker',
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert arrays back to Sets
          if (parsed?.state?.completedTasks) {
            parsed.state.completedTasks = new Set(parsed.state.completedTasks);
          }
          if (parsed?.state?.consumedDiet) {
            parsed.state.consumedDiet = new Set(parsed.state.consumedDiet);
          }
          if (parsed?.state?.completedSets) {
            parsed.state.completedSets = new Set(parsed.state.completedSets);
          }
          return parsed;
        },
        setItem: (name, value) => {
          // Convert Sets to arrays for serialization
          const state = { ...value };
          if (state.state?.completedTasks instanceof Set) {
            state.state.completedTasks = Array.from(state.state.completedTasks);
          }
          if (state.state?.consumedDiet instanceof Set) {
            state.state.consumedDiet = Array.from(state.state.consumedDiet);
          }
          if (state.state?.completedSets instanceof Set) {
            state.state.completedSets = Array.from(state.state.completedSets);
          }
          localStorage.setItem(name, JSON.stringify(state));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        completedTasks: state.completedTasks,
        consumedDiet: state.consumedDiet,
        completedSets: state.completedSets,
        energyLevel: state.energyLevel,
        sleepBed: state.sleepBed,
        sleepWake: state.sleepWake,
        steps: state.steps,
        weight: state.weight,
        currentWeek: state.currentWeek,
        strictMode: state.strictMode,
        workoutDay: state.workoutDay,
        history: state.history,
        photos: state.photos,
        soundEnabled: state.soundEnabled,
        aiMessages: state.aiMessages,
      }),
    }
  )
);
