// 전화/문자 링크 헬퍼. 클라이언트·서버 양쪽에서 import 한다.

/** "010-2703-1491" -> "01027031491" */
export function digitsOnly(phone: string): string {
  return (phone || '').replace(/[^0-9+]/g, '');
}

export function telHref(phone: string): string {
  return `tel:${digitsOnly(phone)}`;
}

export function smsHref(phone: string, body?: string): string {
  const number = digitsOnly(phone);
  if (!body) return `sms:${number}`;
  // iOS 는 "&body=", Android 는 "?body=" 를 쓰지만 최근 양쪽 모두 "?body=" 를 처리한다.
  return `sms:${number}?body=${encodeURIComponent(body)}`;
}

/** 줄바꿈 구분 텍스트 -> 목록 */
export function splitLines(value: string | undefined | null): string[] {
  return (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
