import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  createService,
  deleteService,
  listServices,
  reorderServices,
  updateService,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';

/** 공개: 노출 중인 서비스만. 관리자: ?all=1 로 전체. */
export async function GET(request: Request) {
  try {
    const all = new URL(request.url).searchParams.get('all') === '1';
    if (all) {
      const denied = await requireAdmin();
      if (denied) return denied;
    }
    return NextResponse.json(await listServices({ activeOnly: !all }));
  } catch (error) {
    console.error('[services] GET 실패:', error);
    return NextResponse.json({ error: '서비스 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    if (!body?.title?.trim?.()) {
      return NextResponse.json({ error: '서비스명은 필수입니다.' }, { status: 400 });
    }

    const service = await createService(body);
    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('[services] POST 실패:', error);
    return NextResponse.json({ error: '서비스 등록 실패' }, { status: 500 });
  }
}

/** { id, ...patch } 단건 수정 또는 { order: [id, id, ...] } 순서 저장 */
export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();

    if (Array.isArray(body?.order)) {
      const ids = body.order.map(Number).filter((n: number) => Number.isInteger(n) && n > 0);
      await reorderServices(ids);
      return NextResponse.json({ success: true, services: await listServices() });
    }

    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }

    const service = await updateService(id, body);
    if (!service) {
      return NextResponse.json({ error: '서비스를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('[services] PUT 실패:', error);
    return NextResponse.json({ error: '서비스 수정 실패' }, { status: 500 });
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

    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[services] DELETE 실패:', error);
    return NextResponse.json({ error: '서비스 삭제 실패' }, { status: 500 });
  }
}
