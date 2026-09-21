import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listPricing, savePricing } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await listPricing());
  } catch (error) {
    console.error('[pricing] GET 실패:', error);
    return NextResponse.json({ error: '가격 정보 조회 실패' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    // 관리자 화면은 가격표 전체 배열을 보내지만, 단일 항목도 허용한다.
    const body = await request.json();
    const pricing = await savePricing(body);
    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('[pricing] PUT 실패:', error);
    return NextResponse.json({ error: '가격 정보 수정 실패' }, { status: 500 });
  }
}
