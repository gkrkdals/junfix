// 공개 사이트 주소. sitemap/robots/OG 에 쓰인다.
// 우선순위: 관리자 설정(siteUrl) > SITE_URL 환경변수 > 로컬 기본값

export function resolveSiteUrl(fromSettings?: string): string {
  const candidate = (fromSettings || process.env.SITE_URL || '').trim();
  if (candidate) return candidate.replace(/\/+$/, '');
  return 'http://localhost:3000';
}
