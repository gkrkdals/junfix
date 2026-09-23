// 시공사례 <-> 서비스 연결 규칙. 클라이언트에서도 쓴다.

import type { CaseStudy, ServiceItem } from '@/lib/types';

/** 서비스 id 로 연결됐거나, 서비스명/카테고리가 서로 포함 관계이면 관련 사례로 본다. */
export function casesForService(service: ServiceItem, cases: CaseStudy[]): CaseStudy[] {
  const title = service.title.replace(/\s/g, '');
  return cases.filter((c) => {
    if (c.serviceId === service.id) return true;
    const cat = c.serviceCategory.replace(/\s/g, '');
    if (!cat) return false;
    return title.includes(cat) || cat.includes(title);
  });
}

/** 전·후 사진이 모두 있는 대표 사례. 없으면 null. */
export function featuredCase(cases: CaseStudy[]): CaseStudy | null {
  const withPhotos = cases.filter((c) => c.beforeImageUrl && c.afterImageUrl);
  return withPhotos.find((c) => c.isFeatured) ?? withPhotos[0] ?? null;
}

export function hasPhotos(c: CaseStudy): boolean {
  return Boolean(c.beforeImages.length || c.afterImages.length || c.processImages.length);
}

/** 작업 전/후 사진을 같은 순서끼리 묶는다. 한쪽이 짧으면 빈칸(null). */
export function beforeAfterPairs(c: CaseStudy): { before: string | null; after: string | null }[] {
  const n = Math.max(c.beforeImages.length, c.afterImages.length);
  return Array.from({ length: n }, (_, i) => ({ before: c.beforeImages[i] ?? null, after: c.afterImages[i] ?? null }));
}
