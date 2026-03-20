import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { icon, title, description } = await request.json();
    
    if (!icon || !title) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newItem = await prisma.item.create({
      data: {
        icon,
        title,
        description: description || '',
        status: 'APPROVED',
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
