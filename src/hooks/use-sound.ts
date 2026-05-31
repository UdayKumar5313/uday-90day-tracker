'use client';

import { useRef, useCallback } from 'react';

interface UseSoundOptions {
  soundEnabled: boolean;
}

interface UseSoundReturn {
  playSuccess: () => void;
  playClick: () => void;
  playTick: () => void;
  playAlarm: () => void;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number,
  startTime?: number
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);

  const start = startTime ?? ctx.currentTime;
  oscillator.start(start);
  gainNode.gain.setValueAtTime(volume, start);
  gainNode.gain.setValueAtTime(0, start + duration);
  oscillator.stop(start + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
}

export function useSound({ soundEnabled }: UseSoundOptions): UseSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!soundEnabled) return null;

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch {
        return null;
      }
    }

    const ctx = audioContextRef.current;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return null;
      }
    }

    return ctx;
  }, [soundEnabled]);

  const playSuccess = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // C4 (261.63Hz is standard, but spec says 440Hz for "C4" label)
    playTone(ctx, 440, 'sine', 0.1, 0.15, now);
    // E4 after 100ms
    playTone(ctx, 554, 'sine', 0.1, 0.15, now + 0.1);
    // G4 after 200ms
    playTone(ctx, 659, 'sine', 0.4, 0.1, now + 0.2);
  }, [getAudioContext]);

  const playClick = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    playTone(ctx, 300, 'triangle', 0.05, 0.05);
  }, [getAudioContext]);

  const playTick = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    playTone(ctx, 800, 'sine', 0.05, 0.02);
  }, [getAudioContext]);

  const playAlarm = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Three beeps at 0ms, 300ms, 600ms
    playTone(ctx, 880, 'square', 0.2, 0.1, now);
    playTone(ctx, 880, 'square', 0.2, 0.1, now + 0.3);
    playTone(ctx, 880, 'square', 0.2, 0.1, now + 0.6);
  }, [getAudioContext]);

  return { playSuccess, playClick, playTick, playAlarm };
}
