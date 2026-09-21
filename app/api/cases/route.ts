import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  createCaseStudy,
  deleteCaseStudy,
  listCaseStudies,
  updateCaseStudy,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await listCaseStudies());
  } catch (error) {
    console.error('[cases] GET 실패:', error);
    return NextResponse.json({ error: '시공사례 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    if (!body?.title) {
      return NextResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
    }

    const caseStudy = await createCaseStudy(body);
    return NextResponse.json({ success: true, caseStudy });
  } catch (error) {
    console.error('[cases] POST 실패:', error);
    return NextResponse.json({ error: '시공사례 등록 실패' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }

    const caseStudy = await updateCaseStudy(id, body);
    if (!caseStudy) {
      return NextResponse.json({ error: '시공사례를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, caseStudy });
  } catch (error) {
    console.error('[cases] PUT 실패:', error);
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

    await deleteCaseStudy(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[cases] DELETE 실패:', error);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
