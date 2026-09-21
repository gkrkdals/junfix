import type { Metadata } from 'next';
import './globals.css';
import FloatingActionBar from '@/components/FloatingActionBar';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://junfix.com'),
  title: '준픽스 (JUNFIX) | 하수구·싱크대·변기 막힘·누수·배관설비 24시 긴급출동',
  description: '막힘은 해결하고 일상은 흐르게! 경기·수도권 전지역 30분~1시간 내 직접 출동. 하수구, 싱크대, 변기 막힘 및 교체, 배관 고압세척, 누수탐지, 에어컨 전문 설비업체 준픽스. 전화 010-2703-1491',
  keywords: '준픽스, 준픽스 설비, 하수구막힘, 싱크대막힘, 변기막힘, 변기교체, 고압세척, 누수탐지, 배관스케일링, 에어컨설치, 에어컨가스충전, 수도권설비업체',
  openGraph: {
    title: '준픽스 (JUNFIX) - 막힘은 해결하고 일상은 흐르게',
    description: '젊은 기술, 정직한 서비스! 100% 직영 출동, 투명한 사전 견적, 못 뚫으면 0원 원칙. 010-2703-1491',
    url: 'https://junfix.com',
    siteName: '준픽스 공식 홈페이지',
    images: [
      {
        url: '/images/junfix_main_poster.jpg',
        width: 1024,
        height: 1024,
        alt: '준픽스 메인 포스터',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="naver-site-verification" content="준픽스-네이버-사이트인증-등록예정" />
        <meta name="google-site-verification" content="준픽스-구글-사이트인증-등록예정" />
        {/* Schema.org 구조화 데이터 (LocalBusiness) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'PlumbingService',
              'name': '준픽스 (JUNFIX)',
              'image': 'https://junfix.com/images/junfix_main_poster.jpg',
              'telephone': '010-2703-1491',
              'priceRange': '₩50,000 ~',
              'address': {
                '@type': 'PostalAddress',
                'addressLocality': '경기·수도권 전지역',
                'addressCountry': 'KR'
              },
              'openingHoursSpecification': {
                '@type': 'OpeningHoursSpecification',
                'dayOfWeek': [
                  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                ],
                'opens': '00:00',
                'closes': '23:59'
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0">
        {children}
        <FloatingActionBar />
      </body>
    </html>
  );
}
