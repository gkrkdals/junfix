import type { Metadata } from 'next';
import './globals.css';
import { SiteSettingsProvider } from '@/components/SiteSettingsProvider';
import Analytics from '@/components/Analytics';
import ConversionTracker from '@/components/ConversionTracker';
import { getSiteSettings } from '@/lib/repository';
import { resolveSiteUrl } from '@/lib/site-url';
import { splitLines } from '@/lib/contact';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function loadSettings(): Promise<SiteSettings> {
  return getSiteSettings();
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const siteUrl = resolveSiteUrl(s.siteUrl);
  const title = `${s.siteName} | 하수구·싱크대·변기 막힘, 누수, 배관설비`;
  const description =
    `하수구·싱크대·변기 막힘, 변기 교체, 배관 고압세척, 누수탐지, 배관공사, 에어컨 설치 전문 설비업체 ${s.siteName}. 현장에 직접 출동합니다. ` +
    `상담 ${s.phoneNumber}`;
  const ogImage = s.heroImageUrl || '/images/junfix_main_poster.jpg';

  const verification: Metadata['verification'] = {};
  if (s.googleSiteVerification) verification.google = s.googleSiteVerification;
  if (s.naverSiteVerification) verification.other = { 'naver-site-verification': s.naverSiteVerification };

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      '준픽스',
      '하수구막힘',
      '싱크대막힘',
      '변기막힘',
      '변기교체',
      '고압세척',
      '누수탐지',
      '배관공사',
      '에어컨설치',
      '설비업체',
    ],
    openGraph: {
      title: `${s.siteName} - ${s.tagline}`,
      description,
      url: siteUrl,
      siteName: s.siteName,
      images: [{ url: ogImage, alt: `${s.siteName} 대표 이미지` }],
      locale: 'ko_KR',
      type: 'website',
    },
    verification,
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await loadSettings();
  const siteUrl = resolveSiteUrl(settings.siteUrl);
  const areas = splitLines(settings.serviceAreaList);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PlumbingService',
    name: settings.siteName,
    url: siteUrl,
    image: `${siteUrl}${settings.heroImageUrl || '/images/junfix_main_poster.jpg'}`,
    telephone: settings.phoneNumber,
    description: settings.tagline,
    ...(areas.length ? { areaServed: areas } : {}),
    address: { '@type': 'PostalAddress', addressCountry: 'KR' },
    openingHours: 'Mo-Su 00:00-24:00',
    ...(settings.naverBlogUrl ? { sameAs: [settings.naverBlogUrl] } : {}),
  };

  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Pretendard: 한글 가독성용 웹폰트 (동적 서브셋이라 필요한 글자만 내려받는다) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-ink font-sans">
        <SiteSettingsProvider settings={settings}>
          <Analytics settings={settings} />
          <ConversionTracker />
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
