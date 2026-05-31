'use client';

import { useState, useRef } from 'react';
import { useTrackerStore } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import { DAYS_OF_WEEK, getDynamicWorkouts, NUTRITION_PLAN, TIMETABLE } from '@/lib/tracker-data';
import {
  Weight,
  Camera,
  Check,
  Images,
  Target,
  Upload,
  X,
  Loader2,
} from 'lucide-react';

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

function compressImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        let scale = 1;
        if (img.width > MAX_WIDTH) scale = MAX_WIDTH / img.width;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        } else {
          resolve(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function StatsTab() {
  const state = useTrackerStore();
  const { playSuccess } = useSound({ soundEnabled: state.soundEnabled });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [waistInput, setWaistInput] = useState('');
  const frontRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const isSunday = new Date().getDay() === 0;
  const photoTakenToday = state.photos.some((p) => p.date === todayStr);
  const daysActive = Object.keys(state.history).length;
  const historyKeys = Object.keys(state.history).sort();

  const handleSavePhoto = async () => {
    setIsSaving(true);
    try {
      const frontFile = frontRef.current?.files?.[0];
      const sideFile = sideRef.current?.files?.[0];
      const frontBase64 = await compressImage(frontFile!);
      const sideBase64 = await compressImage(sideFile!);

      const payload = {
        date: todayStr,
        timestamp: Date.now(),
        front: frontBase64,
        side: sideBase64,
        waist: parseFloat(waistInput) || null,
      };

      // Save to server
      await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      state.addPhoto(payload);
      setShowPhotoModal(false);
      playSuccess();
    } catch (e) {
      console.error('Photo save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // 90-Day Map
  const daysArray = Array.from({ length: 90 }, (_, i) => i + 1);
  const gridHtml = daysArray.map((dayNum) => {
    let bgColor = 'bg-slate-800/30';
    let borderColor = 'border-slate-800/50';
    let score = 0;

    if (dayNum <= daysActive && historyKeys[dayNum - 1]) {
      const data = state.history[historyKeys[dayNum - 1]];
      if (data) {
        score = data.score;
        if (score > 85) {
          bgColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
          borderColor = 'border-emerald-400';
        } else if (score > 50) {
          bgColor = 'bg-emerald-600/80';
          borderColor = 'border-emerald-500';
        } else if (score > 10) {
          bgColor = 'bg-emerald-900/60';
          borderColor = 'border-emerald-800';
        }
      }
    }

    return (
      <div
        key={dayNum}
        className={`w-[18px] h-[18px] rounded-[4px] border ${bgColor} ${borderColor} transition-colors group relative`}
      >
        {score > 0 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
            <div className="bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap">
              Day {dayNum} • Score: {Math.round(score)}%
            </div>
          </div>
        )}
      </div>
    );
  });

  // Transformation Gallery
  const galleryHtml = () => {
    if (state.photos.length === 0) return null;
    const day1 = state.photos[0];
    const latest = state.photos[state.photos.length - 1];

    let waistDiffHtml = null;
    if (day1.waist && latest.waist && day1.waist !== latest.waist) {
      const diff = (latest.waist - day1.waist).toFixed(1);
      waistDiffHtml = (
        <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-bold uppercase block mb-1">
            Waist Change
          </span>
          <span
            className={`text-lg font-black ${parseFloat(diff) < 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {diff} cm
          </span>
        </div>
      );
    }

    return (
      <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Images className="w-5 h-5 text-blue-400" /> Transformation Gallery
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              Day 1 ({day1.date})
            </div>
            {day1.front ? (
              <img
                src={day1.front}
                alt="Day 1 front"
                className="w-full rounded-xl border border-slate-700 object-cover aspect-[3/4] bg-slate-950"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-xs text-slate-500">
                No Image
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 mb-2">
              Latest ({latest.date})
            </div>
            {latest.front ? (
              <img
                src={latest.front}
                alt="Latest front"
                className="w-full rounded-xl border border-emerald-900 object-cover aspect-[3/4] bg-slate-950"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-xs text-slate-500">
                No Image
              </div>
            )}
          </div>
        </div>
        {waistDiffHtml}
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {/* Weight Tracking */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-1">
            <Weight className="w-4 h-4 text-orange-400" /> Weight Tracking
          </h3>
          <p className="text-xs text-slate-500">Starting point: 56.2 kg</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={state.weight}
            onChange={(e) => state.setWeight(parseFloat(e.target.value) || 0)}
            className="bg-slate-800 border border-slate-700 text-white text-xl font-black rounded-lg w-24 text-center py-2 outline-none"
          />
          <span className="text-slate-400 font-bold">kg</span>
        </div>
      </div>

      {/* Photo Check-in */}
      {isSunday && !photoTakenToday ? (
        <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/50 p-5 rounded-2xl flex flex-col items-center text-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <div className="bg-blue-500 p-3 rounded-full shrink-0 shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg mb-1">Sunday Check-in Required</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md">
              Take your weekly front & side progress photos and measure your waist to visually
              track your 90-day transformation.
            </p>
          </div>
          <button
            onClick={() => setShowPhotoModal(true)}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
          >
            <Upload className="w-4 h-4 inline mr-2" /> Log Progress Photos
          </button>
        </div>
      ) : photoTakenToday ? (
        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-400 text-sm">Progress Logged Today</h3>
            <p className="text-xs text-slate-400">Great job staying accountable.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Progress Camera</h3>
            <p className="text-[10px] text-slate-400">Required every Sunday.</p>
          </div>
          <button
            onClick={() => setShowPhotoModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg border border-slate-600"
          >
            <Camera className="w-3.5 h-3.5 inline mr-1" /> Open
          </button>
        </div>
      )}

      {/* Transformation Gallery */}
      {galleryHtml()}

      {/* 90-Day Map */}
      <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" /> 90-Day Map
          </h2>
          <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
            {daysActive}/90 Days
          </span>
        </div>
        {daysActive === 0 ? (
          <div className="text-center py-10">
            <Target className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-bold">
              Start checking off tasks today to build your map.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 justify-start">{gridHtml}</div>
        )}
      </section>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" /> Log Progress
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Take front & side pictures and log waist size.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">
                  Front Photo
                </label>
                <input
                  ref={frontRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3 text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900/30 file:text-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">
                  Side Photo
                </label>
                <input
                  ref={sideRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3 text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900/30 file:text-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">
                  Waist Measurement (cm)
                </label>
                <input
                  type="number"
                  value={waistInput}
                  onChange={(e) => setWaistInput(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3 text-base font-bold outline-none"
                />
              </div>
              <button
                onClick={handleSavePhoto}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-4 rounded-xl mt-4 transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> Compressing &
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 inline mr-2" /> Save to Cloud
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
