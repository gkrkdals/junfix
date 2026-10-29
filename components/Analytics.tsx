// 관리자 설정에 ID 가 들어 있을 때만 측정 스크립트를 넣는다.
//  - GA4 (G-XXXX)          : gaMeasurementId
//  - Google Tag Manager    : gtmId (GTM-XXXX)
//  - 네이버 애널리틱스       : naverAnalyticsId (wcs)
//  - 네이버 광고 전환        : naverAdsAccountId (s_XXXX, 네이버공통키. 비면 lib/naver 기본값) -> wcs.inflow 로 광고 유입 쿠키 저장
//                            (전환 전송은 ConversionTracker 의 wcs.trans)
//  - Google Ads 전환        : googleAdsSendTo / googleAdsInquirySendTo / googleAdsMessageSendTo
//                            (AW-XXXX/label) -> gtag config 에 AW 계정 추가

import Script from 'next/script';
import type { SiteSettings } from '@/lib/types';
import { resolveNaverAdsAccountId } from '@/lib/naver';

function adsAccountFrom(sendTo: string): string {
  const m = sendTo.trim().match(/^(AW-[0-9A-Za-z]+)/);
  return m ? m[1] : '';
}

export default function Analytics({ settings }: { settings: SiteSettings }) {
  const ga = settings.gaMeasurementId.trim();
  const gtm = settings.gtmId.trim();
  const naver = settings.naverAnalyticsId.trim();
  const naverAds = resolveNaverAdsAccountId(settings.naverAdsAccountId);
  const ads =
    [settings.googleAdsSendTo, settings.googleAdsInquirySendTo, settings.googleAdsMessageSendTo]
      .map(adsAccountFrom)
      .find(Boolean) ?? '';

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

      {(naver || naverAds) && (
        // wcslog.js 로드가 끝난 뒤에 실행해야 하므로 스크립트를 직접 붙이고 onload 에서 초기화한다.
        // 애널리틱스 ID 와 광고 공통키는 서로 다른 값이라 각각 PV 를 보낸다. 마지막 wa 는 광고 공통키로 남겨
        // 이후 wcs.trans 전환이 광고 계정으로 가게 한다.
        <Script id="naver-wcs-init" strategy="afterInteractive">
          {`(function(){
var analyticsId = ${JSON.stringify(naver)};
var adsId = ${JSON.stringify(naverAds)};
var s = document.createElement('script');
s.src = 'https://wcs.naver.net/wcslog.js';
s.async = true;
s.onload = function(){
  if (!window.wcs) return;
  if (!window.wcs_add) window.wcs_add = {};
  if (analyticsId) { window.wcs_add['wa'] = analyticsId; window.wcs_do(); }
  if (adsId) {
    window.wcs_add['wa'] = adsId;
    window.wcs.inflow(location.hostname.replace(/^www\\./, ''));
    window.wcs_do();
  }
};
document.head.appendChild(s);
})();`}
        </Script>
      )}
    </>
  );
}
