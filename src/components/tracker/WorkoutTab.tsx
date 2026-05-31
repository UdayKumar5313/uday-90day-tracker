'use client';

import { useTrackerStore } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import { DAYS_OF_WEEK, getDynamicWorkouts, type DayOfWeek } from '@/lib/tracker-data';
import {
  Dumbbell,
  Clock,
  Zap,
  Info,
  Check,
  Circle,
} from 'lucide-react';

export function WorkoutTab() {
  const state = useTrackerStore();
  const { playSuccess, playClick } = useSound({ soundEnabled: state.soundEnabled });

  const dynamicWorkouts = getDynamicWorkouts(state.currentWeek);
  const workout = dynamicWorkouts[state.workoutDay];

  const handleToggleSet = (exId: string, setIdx: number, restSecs: number) => {
    const setId = `${exId}_${setIdx}`;
    const isDone = state.completedSets.has(setId);
    state.toggleSet(setId);
    if (!isDone) {
      playSuccess();
      if (restSecs) state.startRestTimer(restSecs);
    } else {
      playClick();
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-200 text-sm">Progression Phase</h3>
          <p className="text-[10px] text-slate-400">Controls sets, reps, and rest timers.</p>
        </div>
        <select
          value={state.currentWeek}
          onChange={(e) => {
            playClick();
            state.setWeek(parseInt(e.target.value));
          }}
          className="bg-slate-800 text-emerald-400 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none"
        >
          {[1, 3, 5, 7, 9, 11].map((w) => (
            <option key={w} value={w}>
              Weeks {w}-{w + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x gap-2 mb-4 scrollbar-none">
        {Object.keys(dynamicWorkouts).map((day) => (
          <button
            key={day}
            onClick={() => {
              playClick();
              state.setWorkoutDay(day as DayOfWeek);
            }}
            className={`snap-center shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              state.workoutDay === day
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {day.substring(0, 3).toUpperCase()}
          </button>
        ))}
      </div>

      {/* Workout Card */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-800/30">
          <h2 className="text-xl font-black text-white mb-1">
            {state.workoutDay}{' '}
            <span className="text-emerald-400">•</span> {workout.focus}
          </h2>
          <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Duration: {workout.duration}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-orange-400" /> Rest: {workout.restTimer}s
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg mt-4 text-sm text-slate-300 font-medium">
            <Info className="w-4 h-4 text-blue-400 inline mr-1" /> {workout.note}
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {workout.routine.length > 0 ? (
            workout.routine.map((ex) => {
              const numSets = typeof ex.sets === 'number' ? ex.sets : 0;
              return (
                <div
                  key={ex.id}
                  className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                      {ex.name}
                    </h3>
                    <span className="bg-slate-950 text-slate-300 text-[10px] sm:text-xs font-bold px-2 py-1 rounded whitespace-nowrap border border-slate-800">
                      {ex.sets !== '-' ? `${ex.sets} Sets x ` : ''}
                      {ex.reps}
                    </span>
                  </div>
                  {ex.tips && (
                    <p className="text-[11px] sm:text-xs text-slate-400 mb-4 bg-slate-900/50 p-2 rounded">
                      {ex.tips}
                    </p>
                  )}
                  {numSets > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: numSets }).map((_, i) => {
                        const setId = `${ex.id}_${i}`;
                        const isDone = state.completedSets.has(setId);
                        return (
                          <button
                            key={i}
                            onClick={() => handleToggleSet(ex.id, i, workout.restTimer)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all flex-1 min-w-[60px] ${
                              isDone
                                ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5" /> : `Set ${i + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              Rest Day. No tracked sets.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
