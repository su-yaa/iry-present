import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const history = await prisma.history.findMany({
      include: { item: true },
      orderBy: { drawnAt: 'desc' }
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
