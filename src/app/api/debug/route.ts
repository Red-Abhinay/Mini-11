import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ DATABASE_URL: process.env.DATABASE_URL || null });
  } catch (err) {
    return NextResponse.json({ error: (err as any).message || 'error' }, { status: 500 });
  }
}
