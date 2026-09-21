// API 라우트용 인증 가드.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export async function getAdminId(): Promise<number | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** 인증되지 않았으면 401 응답을, 통과하면 null 을 반환한다. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const adminId = await getAdminId();
  if (adminId === null) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 });
  }
  return null;
}
