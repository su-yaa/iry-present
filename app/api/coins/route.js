import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let user = await prisma.user.findUnique({ where: { id: 1 } });
    if (!user) {
      user = await prisma.user.create({ data: { id: 1, coinsBalance: 0 } });
    }
    return NextResponse.json({ coins: user.coinsBalance });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { amount } = await request.json();
    
    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id: 1 },
      update: { coinsBalance: { increment: amount } },
      create: { id: 1, coinsBalance: amount },
    });

    return NextResponse.json({ coins: user.coinsBalance });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coins' }, { status: 500 });
  }
}
