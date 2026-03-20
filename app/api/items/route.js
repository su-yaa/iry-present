import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { status: 'APPROVED' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { icon, title, description } = await request.json();
    
    if (!icon || !title || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newItem = await prisma.item.create({
      data: {
        icon,
        title,
        description,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to suggest item' }, { status: 500 });
  }
}
