import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }
    
    const targetItem = await prisma.item.findUnique({ where: { id } });
    if (targetItem?.title === '꽝') {
      return NextResponse.json({ error: '꽝 상품은 절대 지워지지 않습니다.' }, { status: 400 });
    }
    
    // 상품 완전 삭제가 아닌 Soft Delete 처리 (status = 'DELETED')
    // 이를 통해 기존 당첨 기록(History)이 해당 상품 정보를 계속 참조할 수 있게 됨.
    await prisma.item.update({ 
      where: { id },
      data: { status: 'DELETED' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
