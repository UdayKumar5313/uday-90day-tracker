import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json([]);
    }
    const photos = await db.photoCheckin.findMany({ orderBy: { timestamp: 'asc' } });
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Failed to load photos:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { date, timestamp, front, side, waist } = data;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      // No database - photos stored in client localStorage only
      return NextResponse.json({ date, timestamp, front, side, waist, storage: 'client-only' });
    }

    const photo = await db.photoCheckin.upsert({
      where: { date },
      update: {
        timestamp: timestamp ?? Date.now(),
        front: front ?? null,
        side: side ?? null,
        waist: waist ?? null,
      },
      create: {
        date,
        timestamp: timestamp ?? Date.now(),
        front: front ?? null,
        side: side ?? null,
        waist: waist ?? null,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Failed to save photo:', error);
    // Graceful fallback
    return NextResponse.json({ success: true, storage: 'client-only-fallback' });
  }
}
