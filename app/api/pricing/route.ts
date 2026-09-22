import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listPricing, syncPricing } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const all = new URL(request.url).searchParams.get('all') === '1';
    if (all) {
      const denied = await requireAdmin();
      if (denied) return denied;
    }
    return NextResponse.json(await listPricing({ activeOnly: !all }));
  } catch (error) {
    console.error('[pricing] GET 실패:', error);
    return NextResponse.json({ error: '가격 정보 조회 실패' }, { status: 500 });
  }
}

/**
 * 가격표 전체 목록을 받아 동기화한다.
 * 관리자 화면의 행 추가/삭제/순서 변경이 모두 여기로 들어온다.
 * 목록에 없는 기존 행은 삭제되므로 반드시 전체 목록을 보내야 한다.
 */
export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: '가격표 전체 목록(배열)을 보내야 합니다.' }, { status: 400 });
    }

    const pricing = await syncPricing(body);
    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('[pricing] PUT 실패:', error);
    return NextResponse.json({ error: '가격 정보 저장 실패' }, { status: 500 });
  }
}
