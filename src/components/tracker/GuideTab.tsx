'use client';

import {
  Award,
  CircleCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

export function GuideTab() {
  return (
    <div className="space-y-6">
      {/* Golden Rule */}
      <section className="bg-gradient-to-br from-red-950 to-slate-900 p-6 rounded-2xl border border-red-900/50 relative overflow-hidden shadow-lg">
        <Award className="w-24 h-24 absolute -top-4 -right-4 opacity-10 text-white" />
        <h2 className="text-xl font-black text-red-500 mb-3 uppercase tracking-wide relative z-10">
          The Golden Rule
        </h2>
        <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-5 relative z-10 font-medium">
          Missing one day doesn&apos;t matter. Missing weeks does. Consistency for 6–12 months is
          what will get you close to that edited physique.
        </p>
        <div className="space-y-2.5 relative z-10 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
          <p className="font-bold text-white text-[10px] sm:text-sm uppercase tracking-wider mb-2 sm:mb-3">
            NEVER MISS:
          </p>
          {['Protein target (100 g)', 'Workout', 'Sleep', 'Water'].map((rule) => (
            <div
              key={rule}
              className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-300"
            >
              <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" /> {rule}
            </div>
          ))}
        </div>
      </section>

      {/* Expected Results */}
      <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
          <TrendingUp className="w-5 h-5 text-blue-400" /> Expected Results
        </h2>
        <div className="relative border-l-2 border-slate-700 ml-3 space-y-6 pb-2">
          {[
            { t: '30 Days', c: 'Better energy, tighter waist' },
            { t: '60 Days', c: 'Visible chest and shoulder improvement' },
            { t: '90 Days', c: 'Noticeable transformation' },
            { t: '180 Days', c: 'Close to the physique in the edited image' },
            { t: '365 Days', c: 'Lean athletic physique if consistent' },
          ].map((res) => (
            <div key={res.t} className="relative pl-6">
              <div className="absolute -left-[7px] top-1 w-3 h-3 bg-blue-500 rounded-full border-[3px] border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <div className="font-black text-white text-base mb-1">{res.t}</div>
              <div className="text-sm font-medium text-slate-400">{res.c}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Progression Plan */}
      <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
          <ArrowUpRight className="w-5 h-5 text-emerald-400" /> Progression Plan
        </h2>
        <div className="space-y-3">
          {[
            { w: 'Week 1–2', g: 'Learn exercises' },
            { w: 'Week 3–4', g: 'Add 2 reps per set' },
            { w: 'Week 5–6', g: 'Add backpack weight' },
            { w: 'Week 7–8', g: 'Increase sets' },
            { w: 'Week 9–10', g: 'Reduce rest times' },
            { w: 'Week 11–12', g: 'Maximum effort' },
          ].map((item) => (
            <div
              key={item.w}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 sm:p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl"
            >
              <div className="font-black text-emerald-400 text-xs sm:text-sm shrink-0 sm:w-24">
                {item.w}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">{item.g}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
