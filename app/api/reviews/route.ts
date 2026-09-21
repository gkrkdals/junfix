import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createReview, deleteReview, listReviews } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await listReviews());
  } catch (error) {
    console.error('[reviews] GET 실패:', error);
    return NextResponse.json({ error: '후기 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    if (!body?.comment) {
      return NextResponse.json({ error: '후기 내용이 비어 있습니다.' }, { status: 400 });
    }

    const review = await createReview(body);
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('[reviews] POST 실패:', error);
    return NextResponse.json({ error: '후기 등록 실패' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }

    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reviews] DELETE 실패:', error);
    return NextResponse.json({ error: '후기 삭제 실패' }, { status: 500 });
  }
}
