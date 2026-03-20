import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete all history records first to satisfy foreign key constraints
    await prisma.history.deleteMany({});
    // Delete all items except '꽝'
    await prisma.item.deleteMany({
      where: {
        title: { not: '꽝' }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset items' }, { status: 500 });
  }
}
