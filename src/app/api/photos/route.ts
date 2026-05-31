import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const photos = await db.photoCheckin.findMany({ orderBy: { timestamp: 'asc' } });
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Failed to load photos:', error);
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { date, timestamp, front, side, waist } = data;
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 });
  }
}
