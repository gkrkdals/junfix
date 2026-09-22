import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  createSitePhoto,
  deleteSitePhoto,
  listSitePhotos,
  reorderSitePhotos,
  updateSitePhoto,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const all = new URL(request.url).searchParams.get('all') === '1';
    if (all) {
      const denied = await requireAdmin();
      if (denied) return denied;
    }
    return NextResponse.json(await listSitePhotos({ activeOnly: !all }));
  } catch (error) {
    console.error('[site-photos] GET 실패:', error);
    return NextResponse.json({ error: '사진 목록 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    if (!body?.url) {
      return NextResponse.json({ error: '사진 URL 이 없습니다.' }, { status: 400 });
    }
    const photo = await createSitePhoto(body);
    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error('[site-photos] POST 실패:', error);
    return NextResponse.json({ error: '사진 등록 실패' }, { status: 500 });
  }
}

/** { id, ...patch } 또는 { order: [id, ...] } */
export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();

    if (Array.isArray(body?.order)) {
      const ids = body.order.map(Number).filter((n: number) => Number.isInteger(n) && n > 0);
      await reorderSitePhotos(ids);
      return NextResponse.json({ success: true, photos: await listSitePhotos() });
    }

    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }
    const photo = await updateSitePhoto(id, body);
    if (!photo) {
      return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error('[site-photos] PUT 실패:', error);
    return NextResponse.json({ error: '사진 수정 실패' }, { status: 500 });
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
    await deleteSitePhoto(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[site-photos] DELETE 실패:', error);
    return NextResponse.json({ error: '사진 삭제 실패' }, { status: 500 });
  }
}
