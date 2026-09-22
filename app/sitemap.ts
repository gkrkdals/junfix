import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/repository';
import { resolveSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = resolveSiteUrl();
  try {
    const settings = await getSiteSettings();
    siteUrl = resolveSiteUrl(settings.siteUrl);
  } catch {
    // DB 가 잠깐 안 되더라도 사이트맵은 내려준다
  }

  // 원페이지 사이트라 URL 은 하나다. (# 앵커는 검색엔진이 별도 페이지로 보지 않는다)
  return [{ url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
