import { NextRequest, NextResponse } from 'next/server';

// Default state when database is not available
const DEFAULT_STATE = {
  completedTasks: [],
  consumedDiet: [],
  completedSets: [],
  energyLevel: 0,
  sleepBed: '22:30',
  sleepWake: '06:30',
  steps: 0,
  weight: 56.2,
  currentWeek: 1,
  strictMode: true,
  history: {},
};

// Check if database is available (SQLite won't work on Vercel's read-only filesystem)
async function getDb() {
  try {
    const { db } = await import('@/lib/db');
    return db;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      // No database available - return defaults (app uses localStorage)
      return NextResponse.json(DEFAULT_STATE);
    }

    const state = await db.trackerState.findUnique({ where: { id: 'main' } });
    if (!state) {
      return NextResponse.json(DEFAULT_STATE);
    }

    return NextResponse.json({
      completedTasks: JSON.parse(state.completedTasks),
      consumedDiet: JSON.parse(state.consumedDiet),
      completedSets: JSON.parse(state.completedSets),
      energyLevel: state.energyLevel,
      sleepBed: state.sleepBed,
      sleepWake: state.sleepWake,
      steps: state.steps,
      weight: state.weight,
      currentWeek: state.currentWeek,
      strictMode: state.strictMode,
      history: JSON.parse(state.history),
    });
  } catch (error) {
    console.error('Failed to load state:', error);
    // Gracefully return defaults so the app still works
    return NextResponse.json(DEFAULT_STATE);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    if (!db) {
      // No database available - acknowledge but don't persist server-side
      // The app uses localStorage as primary storage anyway
      return NextResponse.json({ success: true, storage: 'client-only' });
    }

    await db.trackerState.upsert({
      where: { id: 'main' },
      update: {
        completedTasks: JSON.stringify(data.completedTasks || []),
        consumedDiet: JSON.stringify(data.consumedDiet || []),
        completedSets: JSON.stringify(data.completedSets || []),
        energyLevel: data.energyLevel ?? 0,
        sleepBed: data.sleepBed ?? '22:30',
        sleepWake: data.sleepWake ?? '06:30',
        steps: data.steps ?? 0,
        weight: data.weight ?? 56.2,
        currentWeek: data.currentWeek ?? 1,
        strictMode: data.strictMode ?? true,
        history: JSON.stringify(data.history || {}),
      },
      create: {
        id: 'main',
        completedTasks: JSON.stringify(data.completedTasks || []),
        consumedDiet: JSON.stringify(data.consumedDiet || []),
        completedSets: JSON.stringify(data.completedSets || []),
        energyLevel: data.energyLevel ?? 0,
        sleepBed: data.sleepBed ?? '22:30',
        sleepWake: data.sleepWake ?? '06:30',
        steps: data.steps ?? 0,
        weight: data.weight ?? 56.2,
        currentWeek: data.currentWeek ?? 1,
        strictMode: data.strictMode ?? true,
        history: JSON.stringify(data.history || {}),
      },
    });

    return NextResponse.json({ success: true, storage: 'database' });
  } catch (error) {
    console.error('Failed to save state:', error);
    // Don't fail the client - localStorage is the primary storage
    return NextResponse.json({ success: true, storage: 'client-only-fallback' });
  }
}
