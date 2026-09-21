// 관리자 비밀번호 해시. Node 내장 scrypt 만 사용하므로 추가 의존성이 없다.
// 저장 형식: scrypt:<saltHex>:<hashHex>

import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEYLEN = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(plain, salt, KEYLEN);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    // 해시되지 않은 값이 들어있는 경우(구버전 시드 등)는 인증 실패로 처리한다.
    return false;
  }

  const [, saltHex, hashHex] = parts;
  let expected: Buffer;
  try {
    expected = Buffer.from(hashHex, 'hex');
  } catch {
    return false;
  }
  if (expected.length !== KEYLEN) return false;

  const derived = await scrypt(plain, Buffer.from(saltHex, 'hex'), KEYLEN);
  return timingSafeEqual(derived, expected);
}
