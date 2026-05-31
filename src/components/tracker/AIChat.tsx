'use client';

import { useState, useRef, useEffect } from 'react';
import { useTrackerStore } from '@/lib/tracker-store';
import { useSound } from '@/hooks/use-sound';
import {
  NUTRITION_PLAN,
  TIMETABLE,
  DAYS_OF_WEEK,
  getDynamicWorkouts,
} from '@/lib/tracker-data';
import {
  Bot,
  X,
  Send,
  Loader2,
} from 'lucide-react';

export function AIChat() {
  const state = useTrackerStore();
  const { playSuccess } = useSound({ soundEnabled: state.soundEnabled });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [state.aiMessages]);

  if (!state.isAIOpen) return null;

  const buildSystemPrompt = () => {
    const now = new Date();
    const todayName = DAYS_OF_WEEK[now.getDay()];
    const currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let consumedItems: string[] = [];
    let pendingItems: string[] = [];
    let totalProEaten = 0;

    NUTRITION_PLAN.forEach((n) => {
      n.items.forEach((i) => {
        if (state.consumedDiet.has(i.id)) {
          consumedItems.push(`${i.name} (${i.pro}g pro)`);
          totalProEaten += i.pro;
        } else {
          if (i.pro > 0 || i.cal > 0) pendingItems.push(`${i.name} (${i.pro}g pro, ${i.cal} kcal)`);
        }
      });
    });

    const todayWorkoutObj = getDynamicWorkouts(state.currentWeek)[todayName];
    const workoutSummary =
      todayWorkoutObj.focus === 'Rest'
        ? 'Rest / Recovery Day'
        : `${todayWorkoutObj.focus} (Exercises: ${todayWorkoutObj.routine.map((r) => r.name).join(', ')})`;

    const daysLogged = Object.keys(state.history).length;
    const daysLeft = 90 - daysLogged;

    return `You are Uday Kumar's highly precise AI diet and fitness assistant. You MUST be 100% accurate based on the following specific data. DO NOT hallucinate.

[USER PROFILE]
Name: Uday Kumar
Stats: 155 cm. Starting weight: 56.2 kg. Current weight: ${state.weight} kg.
Timeline: ${daysLogged} days done. ${daysLeft} days left in the 90-day plan.
Daily Targets: 1700-1800 kcal, 100-110g protein, 3L water, 8000-10000 steps, 7-8h sleep.

[LIVE CONTEXT FOR EXACTLY TODAY: ${todayName}]
Current Local Time: ${currentTime}
Today's Workout: ${workoutSummary}
Current Steps Logged: ${state.steps}
Total Protein Eaten Today: ${totalProEaten}g / 110g

[EXACT LIVE DIET CHECKBOXES FOR TODAY]
Items Consumed Today: ${consumedItems.length > 0 ? consumedItems.join(', ') : 'Nothing eaten yet today.'}
Pending Diet Items To Eat: ${pendingItems.length > 0 ? pendingItems.join(', ') : 'All major food targets hit!'}

[STRICT RULES]
1. If Uday asks what he has eaten today, read ONLY the "Items Consumed Today" list.
2. If Uday asks what is left to eat or what he should eat next, read ONLY from the "Pending Diet Items To Eat" list.
3. If Uday asks for alternatives (e.g., "I don't have X"), find X in the "Pending Diet Items To Eat" list, check its exact protein and calories, and suggest 2-3 precise Indian-friendly alternatives that match those EXACT macros.
4. Pay attention to the "Current Local Time". If Uday greets you with the wrong time of day, politely correct him and answer his query.
5. Be direct, accurate, friendly, and concise. Format with bullet points.`;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    state.addAIMessage({ role: 'user', text });
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      // Filter out the initial welcome message for API (keep only user/assistant pairs)
      const history = state.aiMessages
        .slice(1) // skip initial welcome
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemPrompt,
          history,
        }),
      });

      const data = await res.json();
      const responseText =
        data.response || "Sorry Uday, I'm having trouble connecting right now. Please try again.";

      state.addAIMessage({ role: 'assistant', text: responseText });
      playSuccess();
    } catch (err) {
      console.error('Chat error:', err);
      state.addAIMessage({
        role: 'assistant',
        text: "Sorry Uday, I'm having trouble connecting right now. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] sm:p-4 flex items-end sm:items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col h-[80vh] sm:h-[600px] overflow-hidden relative animate-in fade-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="font-black text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" /> Plan Assistant
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              App-Aware AI
            </p>
          </div>
          <button
            onClick={() => state.toggleAI()}
            className="text-slate-400 hover:text-white p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Box */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-4 bg-slate-950/50 space-y-3"
        >
          {state.aiMessages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-snug ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 rounded-2xl rounded-bl-sm border border-slate-700'
                }`}
              >
                {m.role === 'assistant' && (
                  <Bot className="w-3.5 h-3.5 text-blue-400 inline mr-1 mb-0.5" />
                )}
                <span dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-sm border border-slate-700 px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800 rounded-full border border-slate-700 p-1 pl-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your diet or schedule..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-slate-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
