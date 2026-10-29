'use client';

// 전환 측정을 한 곳에서 처리한다.
// 버튼/링크에 data-track="call_click" 같은 속성만 붙이면 클릭 시
//   - GA4 이벤트 (call_click, sms_click, kakao_click, blog_click, inquiry_submit)
//   - Google Ads 전환 (이벤트별 send_to 가 있을 때. 블로그 클릭은 문의가 아니므로 보내지 않는다)
//   - 네이버 애널리틱스 이벤트 (wcs)
//   - 네이버 광고 전환 (naverAdsAccountId, 비면 lib/naver 기본값, wcs.trans. 블로그 클릭은 마찬가지로 제외)
// 가 전송된다. 폼 제출은 trackConversion('inquiry_submit') 를 직접 호출한다.

import { useEffect } from 'react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { resolveNaverAdsAccountId } from '@/lib/naver';

export type ConversionEvent =
  | 'call_click'
  | 'sms_click'
  | 'kakao_click'
  | 'blog_click'
  | 'inquiry_submit';

// 기존 하이픈 표기(call-click)도 받아준다.
function normalize(name: string): ConversionEvent | null {
  const key = name.trim().replace(/-/g, '_');
  switch (key) {
    case 'call_click':
    case 'sms_click':
    case 'kakao_click':
    case 'blog_click':
    case 'inquiry_submit':
      return key;
    default:
      return null;
  }
}

// 네이버 광고 보고서에 잡히는 전환 유형만 쓴다. call/inquiry 유형은 보고서에 안 나오므로
// 전화·문자/카톡은 사용자정의 전환으로 보낸다.
//   신청완료(lead)       : 상담 신청 폼 제출
//   사용자정의1(custom001): 전화 클릭
//   사용자정의2(custom002): 문자·카카오톡 클릭
const NAVER_CONV_TYPE: Partial<Record<ConversionEvent, string>> = {
  inquiry_submit: 'lead',
  call_click: 'custom001',
  sms_click: 'custom002',
  kakao_click: 'custom002',
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    wcs?: {
      event: (name: string, value?: string) => void;
      trans: (conv: { type: string }) => void;
    };
    wcs_add?: Record<string, string>;
    __junpiksAdsSendTo?: Partial<Record<ConversionEvent, string>>;
    __junpiksNaverAdsAccount?: string;
  }
}

export function trackConversion(event: ConversionEvent, label?: string) {
  if (typeof window === 'undefined') return;

  try {
    if (window.gtag) {
      window.gtag('event', event, { event_category: 'lead', event_label: label ?? '' });
      const sendTo = window.__junpiksAdsSendTo?.[event];
      if (sendTo) {
        window.gtag('event', 'conversion', { send_to: sendTo, event_label: event });
      }
    } else if (window.dataLayer) {
      // GTM 만 쓰는 경우: dataLayer 로 넘겨 태그에서 처리
      window.dataLayer.push({ event, event_label: label ?? '' });
    }
  } catch {
    // 측정 실패가 사용자 흐름을 막으면 안 된다
  }

  // 네이버는 구글과 따로 보낸다 (한쪽 실패가 다른 쪽 전송을 막지 않도록)
  try {
    const naverType = NAVER_CONV_TYPE[event];
    const naverAccount = window.__junpiksNaverAdsAccount;
    if (window.wcs && naverType && naverAccount) {
      // 네이버 애널리틱스 ID 로 바뀌어 있을 수 있으니 전송 직전에 광고 공통키로 맞춘다
      window.wcs_add = window.wcs_add || {};
      window.wcs_add['wa'] = naverAccount;
      window.wcs.trans({ type: naverType });
    }
    if (window.wcs) {
      window.wcs.event(event, label);
    }
  } catch {
    // 측정 실패가 사용자 흐름을 막으면 안 된다
  }
}

export default function ConversionTracker() {
  const settings = useSiteSettings();

  const { googleAdsSendTo, googleAdsInquirySendTo, googleAdsMessageSendTo } = settings;
  useEffect(() => {
    const call = googleAdsSendTo.trim();
    const inquiry = googleAdsInquirySendTo.trim();
    const message = googleAdsMessageSendTo.trim();
    window.__junpiksAdsSendTo = {
      ...(call && { call_click: call }),
      ...(inquiry && { inquiry_submit: inquiry }),
      ...(message && { sms_click: message, kakao_click: message }),
    };
  }, [googleAdsSendTo, googleAdsInquirySendTo, googleAdsMessageSendTo]);

  const { naverAdsAccountId } = settings;
  useEffect(() => {
    window.__junpiksNaverAdsAccount = resolveNaverAdsAccountId(naverAdsAccountId);
  }, [naverAdsAccountId]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
      if (!target) return;
      const event = normalize(target.dataset.track || '');
      if (!event) return;
      trackConversion(event, target.dataset.trackLabel);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
