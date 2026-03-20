import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await prisma.user.findUnique({ where: { id: 1 } });
    if (!user || user.coinsBalance < 1) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    const items = await prisma.item.findMany({ where: { status: 'APPROVED' } });
    if (items.length === 0) {
      return NextResponse.json({ error: 'No approved items available' }, { status: 400 });
    }

    // deduct coin
    await prisma.user.update({
      where: { id: 1 },
      data: { coinsBalance: { decrement: 1 } }
    });

    const randomItem = items[Math.floor(Math.random() * items.length)];

    await prisma.history.create({
      data: { itemId: randomItem.id }
    });

    return NextResponse.json({ item: randomItem, coinsRemaining: user.coinsBalance - 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to draw' }, { status: 500 });
  }
}
