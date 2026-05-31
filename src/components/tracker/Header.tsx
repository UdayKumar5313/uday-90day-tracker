'use client';

import { useTrackerStore, type TabId } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  PieChart,
  Map,
  Volume2,
  VolumeX,
  Lock,
  LockOpen,
  Target,
  Zap,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  TIMETABLE,
  NUTRITION_PLAN,
  DAYS_OF_WEEK,
  getDynamicWorkouts,
} from '@/lib/tracker-data';

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
  todayWorkout.routine.forEach(
    (ex) => (totalSets += typeof ex.sets === 'number' ? ex.sets : 0)
  );
  const workoutScore =
    totalSets > 0
      ? (state.completedSets.size / totalSets) * 30
      : state.completedTasks.has('t9')
        ? 30
        : 0;

  const stepScore = Math.min((state.steps / 8000) * 15, 15);
  return Math.min(100, taskScore + dietScore + workoutScore + stepScore);
}

export function Header() {
  const completedTasks = useTrackerStore((s) => s.completedTasks);
  const consumedDiet = useTrackerStore((s) => s.consumedDiet);
  const completedSets = useTrackerStore((s) => s.completedSets);
  const currentWeek = useTrackerStore((s) => s.currentWeek);
  const steps = useTrackerStore((s) => s.steps);
  const strictMode = useTrackerStore((s) => s.strictMode);
  const soundEnabled = useTrackerStore((s) => s.soundEnabled);
  const toggleStrictMode = useTrackerStore((s) => s.toggleStrictMode);
  const toggleSound = useTrackerStore((s) => s.toggleSound);
  const { playClick } = useSound({ soundEnabled });
  const score = Math.round(calculateScore({ completedTasks, consumedDiet, completedSets, currentWeek, steps } as ReturnType<typeof useTrackerStore.getState>));

  const handleToggleStrict = () => {
    playClick();
    toggleStrictMode();
  };
  const handleToggleSound = () => {
    toggleSound();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Uday Kumar
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
              90-Day Transformation
            </p>
          </div>
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 text-emerald-400 border-slate-700'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleToggleStrict}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                strictMode
                  ? 'bg-blue-900/20 text-blue-400 border-blue-900/50'
                  : 'bg-orange-900/20 text-orange-400 border-orange-900/50'
              }`}
            >
              {strictMode ? (
                <Lock className="w-3 h-3" />
              ) : (
                <LockOpen className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className={`p-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-slate-800 text-emerald-400 border-slate-700'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3 h-3" />
              ) : (
                <VolumeX className="w-3 h-3" />
              )}{' '}
              Sound
            </button>
            <button
              onClick={handleToggleStrict}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                strictMode
                  ? 'bg-blue-900/20 text-blue-400 border-blue-900/50'
                  : 'bg-orange-900/20 text-orange-400 border-orange-900/50'
              }`}
            >
              {strictMode ? (
                <Lock className="w-3 h-3" />
              ) : (
                <LockOpen className="w-3 h-3" />
              )}{' '}
              {strictMode ? 'Strict Mode' : 'Flexible Mode'}
            </button>
          </div>
          <div className="text-right flex flex-col items-end w-full sm:w-auto">
            <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Score: {score}%
            </div>
            <Progress value={score} className="w-full sm:w-24 h-1.5 mt-1.5" />
          </div>
        </div>
      </div>
    </header>
  );
}

const NAV_ITEMS: { id: TabId; icon: React.ReactNode; label: string }[] = [
  { id: 'daily', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { id: 'diet', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Diet/Water' },
  { id: 'workout', icon: <Dumbbell className="w-5 h-5" />, label: 'Train' },
  { id: 'stats', icon: <PieChart className="w-5 h-5" />, label: 'Stats' },
  { id: 'guide', icon: <Map className="w-5 h-5" />, label: 'Guide' },
];

export function Navigation() {
  const activeTab = useTrackerStore((s) => s.activeTab);
  const setActiveTab = useTrackerStore((s) => s.setActiveTab);
  const soundEnabled = useTrackerStore((s) => s.soundEnabled);
  const { playClick } = useSound({ soundEnabled });

  return (
    <>
      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around p-2 z-50 md:hidden pb-safe">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              playClick();
              setActiveTab(item.id);
            }}
            className={`flex flex-col items-center justify-center w-14 py-2 px-1 rounded-xl transition-all ${
              activeTab === item.id
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className={`${activeTab === item.id ? '' : 'opacity-80'}`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-semibold tracking-wide mt-1">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      {/* Desktop Nav */}
      <div className="hidden md:flex justify-center gap-2 fixed bottom-8 left-0 right-0 z-50 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-2xl p-2 flex shadow-2xl gap-2 pointer-events-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center w-[72px] py-2 px-1 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold tracking-wide mt-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
