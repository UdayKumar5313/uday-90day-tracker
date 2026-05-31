import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const state = await db.trackerState.findUnique({ where: { id: 'main' } });
    if (!state) {
      return NextResponse.json({
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
      });
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
    return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save state:', error);
    return NextResponse.json({ error: 'Failed to save state' }, { status: 500 });
  }
}
