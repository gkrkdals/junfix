import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createInquiry, listInquiries, updateInquiry } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    return NextResponse.json(await listInquiries());
  } catch (error) {
    console.error('[inquiries] GET 실패:', error);
    return NextResponse.json({ error: '접수 내역 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inquiry = await createInquiry(body);
    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('[inquiries] POST 실패:', error);
    return NextResponse.json({ success: false, error: '접수 실패' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }

    const inquiry = await updateInquiry(id, body);
    if (!inquiry) {
      return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('[inquiries] PATCH 실패:', error);
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}
