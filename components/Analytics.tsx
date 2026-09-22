// 관리자 설정에 ID 가 들어 있을 때만 측정 스크립트를 넣는다.
//  - GA4 (G-XXXX)          : gaMeasurementId
//  - Google Tag Manager    : gtmId (GTM-XXXX)
//  - 네이버 애널리틱스       : naverAnalyticsId (wcs)
//  - Google Ads 전환        : googleAdsSendTo (AW-XXXX/label) -> gtag config 에 AW 계정 추가

import Script from 'next/script';
import type { SiteSettings } from '@/lib/types';

function adsAccountFrom(sendTo: string): string {
  const m = sendTo.trim().match(/^(AW-[0-9A-Za-z]+)/);
  return m ? m[1] : '';
}

export default function Analytics({ settings }: { settings: SiteSettings }) {
  const ga = settings.gaMeasurementId.trim();
  const gtm = settings.gtmId.trim();
  const naver = settings.naverAnalyticsId.trim();
  const ads = adsAccountFrom(settings.googleAdsSendTo);

  const gtagIds = [ga, ads].filter(Boolean);

  return (
    <>
      {gtagIds.length > 0 && (
        <>
          <Script
            id="gtag-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gtagIds.map((id) => `gtag('config', '${id}');`).join('\n')}`}
          </Script>
        </>
      )}

      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {naver && (
        <>
          <Script id="naver-wcs-src" src="https://wcs.naver.net/wcslog.js" strategy="afterInteractive" />
          <Script id="naver-wcs-init" strategy="afterInteractive">
            {`if (window.wcs_add === undefined) window.wcs_add = {};
window.wcs_add['wa'] = '${naver}';
if (window.wcs) { window.wcs_do(); }`}
          </Script>
        </>
      )}
    </>
  );
}
