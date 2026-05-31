'use client';

import { useEffect, useCallback } from 'react';
import { useTrackerStore } from '@/lib/tracker-store';
import { useSync, useLoadState } from '@/hooks/use-sync';
import { useSound } from '@/hooks/use-sound';
import { NUTRITION_PLAN, TIMETABLE, DAYS_OF_WEEK, getDynamicWorkouts } from '@/lib/tracker-data';
import { Header, Navigation } from '@/components/tracker/Header';
import { DashboardTab } from '@/components/tracker/DashboardTab';
import { DietTab } from '@/components/tracker/DietTab';
import { WorkoutTab } from '@/components/tracker/WorkoutTab';
import { StatsTab } from '@/components/tracker/StatsTab';
import { GuideTab } from '@/components/tracker/GuideTab';
import { AIChat } from '@/components/tracker/AIChat';
import { RestTimer } from '@/components/tracker/RestTimer';
import { Bot, Loader2, CloudDownload } from 'lucide-react';

function calculateScore(state: ReturnType<typeof useTrackerStore.getState>) {
  const isolatedTasks = TIMETABLE.filter((t) => !t.linked);
  let doneIsolated = 0;
  isolatedTasks.forEach((t) => {
    if (state.completedTasks.has(t.id)) doneIsolated++;
  });
  const taskScore = (doneIsolated / isolatedTasks.length) * 10;

  let totalDietItems = 0;
  NUTRITION_PLAN.forEach((n) => (totalDietItems += n.items.length));
  const dietScore = (state.consumedDiet.size / totalDietItems) * 45;

  const todayWorkout = getDynamicWorkouts(state.currentWeek)[DAYS_OF_WEEK[new Date().getDay()]];
  let totalSets = 0;
  todayWorkout.routine.forEach((ex) => (totalSets += typeof ex.sets === 'number' ? ex.sets : 0));
  const workoutScore =
    totalSets > 0
      ? (state.completedSets.size / totalSets) * 30
      : state.completedTasks.has('t9')
        ? 30
        : 0;

  const stepScore = Math.min((state.steps / 8000) * 15, 15);
  return Math.min(100, taskScore + dietScore + workoutScore + stepScore);
}

export default function Home() {
  const state = useTrackerStore();
  const { syncToServer } = useSync({
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
    history: state.history,
  });
  const { data, isLoading: isServerLoading } = useLoadState();
  const { playClick } = useSound({ soundEnabled: state.soundEnabled });

  // Load state from server on first load
  useEffect(() => {
    if (data && state.isLoading) {
      state.loadFromServer(data);
    }
  }, [data, state.isLoading]);

  // Auto-sync when state changes (after initial load)
  useEffect(() => {
    if (!state.isLoading) {
      // Update history
      const todayStr = new Date().toISOString().split('T')[0];
      const score = calculateScore(state);
      state.updateHistory(todayStr, {
        score,
        weight: state.weight,
        energyLevel: state.energyLevel,
        steps: state.steps,
      });
      syncToServer();
    }
  }, [
    state.completedTasks,
    state.consumedDiet,
    state.completedSets,
    state.energyLevel,
    state.steps,
    state.weight,
    state.currentWeek,
    state.strictMode,
    state.sleepBed,
    state.sleepWake,
  ]);

  // Loading screen
  if (state.isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center">
        <CloudDownload className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Syncing with Cloud...</h2>
        <p className="text-slate-500 text-sm mt-2">Fetching Uday&apos;s 90-Day Data</p>
        {isServerLoading && (
          <Loader2 className="w-5 h-5 text-emerald-400 mt-4 animate-spin" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 selection:bg-emerald-500/30 relative pb-24 md:pb-0">
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-6 flex-1 w-full animate-in fade-in duration-300">
        {state.activeTab === 'daily' && <DashboardTab />}
        {state.activeTab === 'diet' && <DietTab />}
        {state.activeTab === 'workout' && <WorkoutTab />}
        {state.activeTab === 'stats' && <StatsTab />}
        {state.activeTab === 'guide' && <GuideTab />}
      </main>
      <Navigation />
      <RestTimer />
      <AIChat />

      {/* Floating AI Button */}
      <button
        onClick={() => {
          playClick();
          state.toggleAI();
        }}
        className="fixed bottom-[80px] md:bottom-8 right-4 md:right-6 bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center z-40 transition-transform hover:scale-105 active:scale-95"
      >
        <Bot className="w-7 h-7" />
      </button>
    </div>
  );
}
