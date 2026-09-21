import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: '로그아웃 완료' });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
