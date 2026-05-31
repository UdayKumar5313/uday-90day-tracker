'use client';

import { useEffect, useRef } from 'react';
import { useTrackerStore } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import { Timer } from 'lucide-react';

export function RestTimer() {
  const state = useTrackerStore();
  const { playTick, playAlarm } = useSound({ soundEnabled: state.soundEnabled });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.isTimerRunning && state.restTimerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        playTick();
        state.tickTimer();
      }, 1000);
    }

    if (!state.isTimerRunning && intervalRef.current) {
      playAlarm();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isTimerRunning]);

  if (!state.isTimerRunning) return null;

  return (
    <div className="fixed bottom-[140px] md:bottom-24 right-4 md:right-6 bg-slate-900 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-full px-6 py-3 flex items-center gap-3 z-40 animate-in slide-in-from-right duration-300">
      <Timer className="w-6 h-6 text-emerald-400 animate-pulse" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
          Rest
        </span>
        <span className="text-xl font-black text-white leading-none">
          {state.restTimerSeconds}s
        </span>
      </div>
    </div>
  );
}
