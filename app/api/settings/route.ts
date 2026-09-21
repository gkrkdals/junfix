import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getSiteSettings());
  } catch (error) {
    console.error('[settings] GET 실패:', error);
    return NextResponse.json({ error: '설정 조회 실패' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    const settings = await updateSiteSettings(body);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[settings] PUT 실패:', error);
    return NextResponse.json({ error: '설정 저장 실패' }, { status: 500 });
  }
}
