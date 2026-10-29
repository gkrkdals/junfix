// 네이버 광고 공통키 (프리미엄 로그 분석, 준픽스.com). 관리자 > 기본 정보 값이 우선, 없으면 이 값.
const DEFAULT_NAVER_ADS_ACCOUNT_ID = 's_6879106dd14';

export function resolveNaverAdsAccountId(fromSettings: string): string {
  return fromSettings.trim() || DEFAULT_NAVER_ADS_ACCOUNT_ID;
}
