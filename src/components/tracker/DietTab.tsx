'use client';

import { useTrackerStore } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import { NUTRITION_PLAN, GROCERY_LIST, hasTimePassed } from '@/lib/tracker-data';
import {
  Droplet,
  Apple,
  UtensilsCrossed,
  Flame,
  Dumbbell,
  Moon,
  CircleCheck,
  Circle,
  Lock,
  ShoppingCart,
  ArrowLeft,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  droplet: <Droplet className="w-3.5 h-3.5 text-blue-400" />,
  apple: <Apple className="w-3.5 h-3.5 text-red-400" />,
  utensils: <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />,
  flame: <Flame className="w-3.5 h-3.5 text-orange-500" />,
  dumbbell: <Dumbbell className="w-3.5 h-3.5 text-slate-300" />,
  moon: <Moon className="w-3.5 h-3.5 text-indigo-300" />,
};

export function DietTab() {
  const state = useTrackerStore();
  const { playSuccess, playClick } = useSound({ soundEnabled: state.soundEnabled });

  // Calculate totals
  let totalPro = 0,
    totalCal = 0,
    totalWater = 0;
  NUTRITION_PLAN.forEach((n) => {
    n.items.forEach((i) => {
      if (state.consumedDiet.has(i.id)) {
        totalPro += i.pro;
        totalCal += i.cal;
        totalWater += i.water;
      }
    });
  });

  // Grocery List View
  if (state.showGrocery) {
    return (
      <div>
        <button
          onClick={() => {
            playClick();
            state.toggleGrocery(false);
          }}
          className="text-emerald-400 text-sm font-bold flex items-center gap-2 mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Timed Nutrition
        </button>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-emerald-500" /> Weekly Grocery List
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GROCERY_LIST.map((sec) => (
              <div
                key={sec.category}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
              >
                <h3 className="font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">
                  {sec.category}
                </h3>
                <ul className="space-y-2">
                  {sec.items.map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Intake Summary */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Live Intake
          </h3>
          <div className="flex gap-4 sm:gap-6">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-red-400">
                {totalPro}
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1">/110g</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">
                Protein
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-orange-400">
                {totalCal}
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1">/1800</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">
                Calories
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-blue-400">
                {totalWater}
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1">/3.3L</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">
                Water
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            playClick();
            state.toggleGrocery(true);
          }}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" /> Grocery
        </button>
      </div>

      {/* Nutrition Timeline */}
      <div className="relative border-l-2 border-slate-800/80 ml-2 sm:ml-4 space-y-6 pb-2">
        {NUTRITION_PLAN.map((n) => {
          const isLocked = state.strictMode && !hasTimePassed(n.time);
          return (
            <div
              key={n.id}
              className={`relative pl-4 sm:pl-6 ${isLocked ? 'opacity-40 grayscale' : ''}`}
            >
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-slate-900 border-2 border-slate-700 rounded-full" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] sm:text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">
                  {n.time}{' '}
                  {isLocked && <Lock className="w-2.5 h-2.5 ml-1 inline" />}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  {ICON_MAP[n.icon]} {n.title}
                </h3>
                {n.target && (
                  <span className="text-[9px] sm:text-[10px] font-bold bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 hidden sm:inline-block ml-auto">
                    {n.target}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {n.items.map((item) => {
                  const isDone = state.consumedDiet.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!isLocked) {
                          state.toggleDiet(item.id);
                          if (!isDone) playSuccess();
                          else playClick();
                        }
                      }}
                      disabled={isLocked}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-colors border ${
                        isDone
                          ? 'bg-emerald-900/20 border-emerald-900/50'
                          : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CircleCheck className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600" />
                        )}
                        <div className="text-left flex flex-col">
                          <span
                            className={`text-xs sm:text-sm font-bold ${isDone ? 'text-slate-400' : 'text-slate-200'}`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.qty}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold">
                        {item.water > 0 && (
                          <span className="text-blue-400">{item.water}ml</span>
                        )}
                        {item.cal > 0 && (
                          <span className="text-orange-400 w-10 text-right">{item.cal}kc</span>
                        )}
                        {item.pro > 0 && (
                          <span className="text-red-400 w-8 text-right">{item.pro}g</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
