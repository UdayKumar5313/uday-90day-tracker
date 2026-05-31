'use client';

import { useTrackerStore } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import {
  TIMETABLE,
  NUTRITION_PLAN,
  DAYS_OF_WEEK,
  getDynamicWorkouts,
  hasTimePassed,
} from '@/lib/tracker-data';
import {
  Sun,
  Apple,
  UtensilsCrossed,
  Footprints,
  Droplet,
  Flame,
  Dumbbell,
  Moon,
  BedDouble,
  CircleCheck,
  Circle,
  Lock,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  sun: <Sun className="w-3.5 h-3.5 text-yellow-400" />,
  apple: <Apple className="w-3.5 h-3.5 text-red-400" />,
  utensils: <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />,
  footprints: <Footprints className="w-3.5 h-3.5 text-emerald-400" />,
  droplet: <Droplet className="w-3.5 h-3.5 text-blue-400" />,
  flame: <Flame className="w-3.5 h-3.5 text-orange-500" />,
  dumbbell: <Dumbbell className="w-3.5 h-3.5 text-slate-300" />,
  moon: <Moon className="w-3.5 h-3.5 text-indigo-300" />,
  bed: <BedDouble className="w-3.5 h-3.5 text-indigo-400" />,
};

function isTaskDone(
  task: (typeof TIMETABLE)[0],
  state: ReturnType<typeof useTrackerStore.getState>
) {
  if (task.linked === 'workout') {
    const todayWorkout = getDynamicWorkouts(state.currentWeek)[DAYS_OF_WEEK[new Date().getDay()]];
    if (
      todayWorkout.focus === 'Rest' ||
      todayWorkout.focus === 'Cardio' ||
      todayWorkout.focus === 'Walking/Cardio'
    ) {
      return state.completedTasks.has(task.id);
    }
    let totalSets = 0,
      doneSets = 0;
    todayWorkout.routine.forEach((ex) => {
      if (typeof ex.sets === 'number') {
        for (let i = 0; i < ex.sets; i++) {
          totalSets++;
          if (state.completedSets.has(`${ex.id}_${i}`)) doneSets++;
        }
      }
    });
    return totalSets > 0 && totalSets === doneSets;
  } else if (task.linked) {
    const group = NUTRITION_PLAN.find((n) => n.id === task.linked);
    if (!group) return false;
    return group.items.every((item) => state.consumedDiet.has(item.id));
  }
  return state.completedTasks.has(task.id);
}

export function DashboardTab() {
  const state = useTrackerStore();
  const { playSuccess, playClick } = useSound({
    soundEnabled: state.soundEnabled,
  });

  // Calculate live totals
  let totalPro = 0,
    totalWater = 0,
    totalCal = 0;
  NUTRITION_PLAN.forEach((n) => {
    n.items.forEach((i) => {
      if (state.consumedDiet.has(i.id)) {
        totalPro += i.pro;
        totalWater += i.water;
        totalCal += i.cal;
      }
    });
  });

  // Sleep calculation
  const [bH, bM] = state.sleepBed.split(':').map(Number);
  let [wH, wM] = state.sleepWake.split(':').map(Number);
  if (wH < bH) wH += 24;
  const totalMins = (wH * 60 + wM) - (bH * 60 + bM);
  const sHrs = Math.floor(totalMins / 60);
  const sMins = totalMins % 60;
  const sleepOk = totalMins / 60 >= 7;

  const handleToggleTask = (taskId: string) => {
    const task = TIMETABLE.find((t) => t.id === taskId);
    if (!task) return;
    const currentlyDone = isTaskDone(task, state);

    if (task.linked === 'workout') {
      const todayWorkout = getDynamicWorkouts(state.currentWeek)[DAYS_OF_WEEK[new Date().getDay()]];
      if (
        todayWorkout.focus !== 'Rest' &&
        todayWorkout.focus !== 'Cardio' &&
        todayWorkout.focus !== 'Walking/Cardio'
      ) {
        todayWorkout.routine.forEach((ex) => {
          if (typeof ex.sets === 'number') {
            for (let i = 0; i < ex.sets; i++) {
              const setId = `${ex.id}_${i}`;
              if (currentlyDone) state.toggleSet(setId);
              else state.toggleSet(setId);
            }
          }
        });
      } else {
        state.toggleTask(taskId);
      }
    } else if (task.linked) {
      const group = NUTRITION_PLAN.find((n) => n.id === task.linked);
      if (group) {
        group.items.forEach((item) => {
          const shouldConsume = !currentlyDone;
          const isConsumed = state.consumedDiet.has(item.id);
          if (shouldConsume && !isConsumed) state.toggleDiet(item.id);
          else if (!shouldConsume && isConsumed) state.toggleDiet(item.id);
        });
      }
    } else {
      state.toggleTask(taskId);
    }

    if (!currentlyDone) playSuccess();
    else playClick();
  };

  return (
    <div className="space-y-6">
      {/* Live Daily Targets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Live Daily Targets
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl">
            <div className="text-[9px] uppercase font-bold text-orange-400 mb-1">Calories</div>
            <div className="text-xl font-black text-white">
              {totalCal}
              <span className="text-[10px] text-slate-500 ml-1">/1800</span>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl">
            <div className="text-[9px] uppercase font-bold text-red-400 mb-1">Protein</div>
            <div className="text-xl font-black text-white">
              {totalPro}g
              <span className="text-[10px] text-slate-500 ml-1">/110g</span>
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min((totalPro / 110) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl">
            <div className="text-[9px] uppercase font-bold text-blue-400 mb-1">Water</div>
            <div className="text-xl font-black text-white">
              {totalWater}ml
              <span className="text-[10px] text-slate-500 ml-1">/3.3L</span>
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min((totalWater / 3300) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl flex flex-col justify-center">
            <div className="text-[9px] uppercase font-bold text-emerald-400 mb-1">Steps</div>
            <input
              type="number"
              value={state.steps}
              onChange={(e) => state.setSteps(parseInt(e.target.value) || 0)}
              className="bg-transparent text-white text-xl font-black outline-none w-full p-0"
            />
            <div className="w-full h-1 bg-slate-900 rounded-full mt-1">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min((state.steps / 8000) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl col-span-2 md:col-span-1">
            <div className="text-[9px] uppercase font-bold text-indigo-400 mb-1">Sleep Logs</div>
            <div className={`text-xl font-black ${sleepOk ? 'text-white' : 'text-red-400'}`}>
              {sHrs}h {sMins}m
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
              <div
                className={`h-full ${sleepOk ? 'bg-indigo-500' : 'bg-red-500'} transition-all duration-500`}
                style={{ width: `${Math.min(((totalMins / 60) / 7) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Energy + Sleep */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Morning Readiness
          </h3>
          <div className="flex justify-between gap-2 h-full items-end">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  playClick();
                  state.setEnergy(lvl);
                }}
                className={`flex-1 py-2 rounded-lg text-lg border transition-all ${
                  state.energyLevel === lvl
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                {lvl === 1 ? '😫' : lvl === 2 ? '🥱' : lvl === 3 ? '😐' : lvl === 4 ? '🙂' : '🔥'}
              </button>
            ))}
          </div>
        </section>
        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-3">
            <BedDouble className="w-4 h-4 text-indigo-400" /> Sleep Log
          </h3>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-[10px] uppercase text-slate-500 font-bold">Bed Time</label>
              <input
                type="time"
                value={state.sleepBed}
                onChange={(e) => state.setSleepBed(e.target.value)}
                className="w-full bg-slate-800 text-white rounded p-2 text-sm outline-none border border-slate-700"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase text-slate-500 font-bold">Wake Time</label>
              <input
                type="time"
                value={state.sleepWake}
                onChange={(e) => state.setSleepWake(e.target.value)}
                className="w-full bg-slate-800 text-white rounded p-2 text-sm outline-none border border-slate-700"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Daily Timetable */}
      <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
          <CircleCheck className="w-5 h-5 text-emerald-400" /> Daily Timetable
        </h2>
        <div className="relative border-l-2 border-slate-800/80 ml-4 space-y-6 pb-2">
          {TIMETABLE.map((item) => {
            const isDone = isTaskDone(item, state);
            const isLocked = state.strictMode && !hasTimePassed(item.time);
            return (
              <div key={item.id} className="relative pl-6 flex items-start gap-3 group">
                <button
                  onClick={() => !isLocked && handleToggleTask(item.id)}
                  disabled={isLocked}
                  className={`absolute -left-[11px] top-0.5 rounded-full p-1 transition-all z-10 bg-slate-900 border-2 ${
                    isLocked
                      ? 'border-slate-800 text-slate-700 opacity-60'
                      : isDone
                        ? 'border-emerald-500 text-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'border-slate-600 text-slate-600 hover:border-slate-500'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-2.5 h-2.5" />
                  ) : isDone ? (
                    <CircleCheck className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </button>
                <div
                  className={`flex-1 transition-all ${
                    isLocked ? 'opacity-40 grayscale' : isDone ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-md">
                      {item.time}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                      {ICON_MAP[item.icon]} {item.activity}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">{item.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
