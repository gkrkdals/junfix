// 관리자 세션 쿠키.
//
// 기존 구현은 'authenticated_junpiks' 라는 고정 문자열을 쿠키에 넣었기 때문에
// 값만 알면 누구나 위조할 수 있었다. 여기서는 서버 비밀키로 HMAC 서명한
// "<adminId>.<만료시각>.<서명>" 토큰을 사용한다.

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'junpiks_admin_auth';
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7일

function resolveSecret(): string {
  const fromEnv = process.env.ADMIN_SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;

  // 비밀키가 없으면 프로세스마다 임의 값을 쓴다.
  // 위조는 막을 수 있지만 재시작/다중 인스턴스에서 세션이 풀린다.
  if (!globalThis.__junpiksSessionSecret) {
    globalThis.__junpiksSessionSecret = randomBytes(32).toString('hex');
    console.warn(
      '[session] ADMIN_SESSION_SECRET 이 설정되지 않았습니다. ' +
        '임시 키를 사용하므로 재배포/재시작 시 관리자 세션이 모두 로그아웃됩니다.'
    );
  }
  return globalThis.__junpiksSessionSecret;
}

declare global {
  // eslint-disable-next-line no-var
  var __junpiksSessionSecret: string | undefined;
}

function sign(payload: string): string {
  return createHmac('sha256', resolveSecret()).update(payload).digest('hex');
}

export function createSessionToken(adminId: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payload = `${adminId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** 유효하면 관리자 id, 아니면 null */
export function verifySessionToken(token: string | undefined | null): number | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [idRaw, expRaw, signature] = parts;
  const expected = sign(`${idRaw}.${expRaw}`);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiresAt = Number(expRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;

  const adminId = Number(idRaw);
  return Number.isInteger(adminId) && adminId > 0 ? adminId : null;
}
