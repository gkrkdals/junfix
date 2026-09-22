import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/repository';
import { resolveSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = resolveSiteUrl();
  try {
    const settings = await getSiteSettings();
    siteUrl = resolveSiteUrl(settings.siteUrl);
  } catch {
    // 기본값 사용
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
