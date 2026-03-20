import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { id, action } = await request.json(); // action == 'APPROVE' or 'REJECT'
    
    if (action === 'REJECT') {
      await prisma.item.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    await prisma.item.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    return NextResponse.json({ success: true, status: 'APPROVED' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
