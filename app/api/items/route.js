import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let items = await prisma.item.findMany({
      where: { status: 'APPROVED' },
    });
    
    // 꽝 상품 보장
    if (!items.find(i => i.title === '꽝')) {
      const dud = await prisma.item.create({
        data: { icon: '💣', title: '꽝', description: '아쉽지만 다음 기회에...', status: 'APPROVED' }
      });
      items.push(dud);
    }
    
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
