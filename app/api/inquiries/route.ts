import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createInquiry, deleteInquiry, listInquiries, updateInquiry } from '@/lib/repository';
import { notifyNewInquiry } from '@/lib/notify';

export const dynamic = 'force-dynamic';

/* --- 간단한 요청 제한 (IP 당 분당 5건). 프로세스 메모리 기반이라 재시작하면 초기화된다. --- */
const WINDOW_MS = 60_000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // 메모리 폭주 방지
  return recent.length > LIMIT;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
}

function field(body: Record<string, unknown>, key: string, max: number): string {
  const value = body[key];
  return (typeof value === 'string' ? value : '').trim().slice(0, max);
}

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

/** 공개 접수 폼 */
export async function POST(request: Request) {
  try {
    if (tooMany(clientIp(request))) {
      return NextResponse.json(
        { success: false, error: '잠시 후 다시 시도해 주세요. 급하시면 전화로 문의해 주세요.' },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // 봇이 채우는 숨은 필드
    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true });
    }

    const phoneNumber = field(body, 'phoneNumber', 30);
    if (phoneNumber.replace(/[^0-9]/g, '').length < 9) {
      return NextResponse.json({ success: false, error: '연락처를 정확히 입력해 주세요.' }, { status: 400 });
    }

    const inquiry = await createInquiry({
      customerName: field(body, 'customerName', 50),
      phoneNumber,
      region: field(body, 'region', 100),
      serviceType: field(body, 'serviceType', 100),
      description: field(body, 'description', 2000),
      preferredTime: field(body, 'preferredTime', 100),
    });

    // 알림은 응답을 막지 않는다. 실패해도 접수는 이미 저장됐다.
    notifyNewInquiry(inquiry).catch((error) => {
      console.error('[inquiries] 알림 메일 전송 실패:', error);
    });

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

export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }

    await deleteInquiry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[inquiries] DELETE 실패:', error);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
