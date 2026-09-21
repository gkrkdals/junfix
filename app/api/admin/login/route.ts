import { NextResponse } from 'next/server';
import { findAdminByUsername } from '@/lib/repository';
import { verifyPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SEC } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const admin = await findAdminByUsername(username);

    // 계정 유무에 따라 응답 시간이 달라지지 않도록, 없을 때도 검증을 수행한다.
    const stored = admin?.passwordHash ?? 'scrypt:00:00';
    const ok = await verifyPassword(password, stored);

    if (!admin || !ok) {
      return NextResponse.json(
        { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: '로그인 성공' });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: createSessionToken(admin.id),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SEC,
    });
    return response;
  } catch (error) {
    console.error('[admin/login] 실패:', error);
    return NextResponse.json(
      { success: false, message: '로그인 처리 중 오류 발생' },
      { status: 500 }
    );
  }
}
