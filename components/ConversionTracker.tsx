'use client';

// 전환 측정을 한 곳에서 처리한다.
// 버튼/링크에 data-track="call_click" 같은 속성만 붙이면 클릭 시
//   - GA4 이벤트 (call_click, sms_click, kakao_click, blog_click, inquiry_submit)
//   - Google Ads 전환 (googleAdsSendTo 가 있을 때)
//   - 네이버 애널리틱스 이벤트 (wcs)
// 가 전송된다. 폼 제출은 trackConversion('inquiry_submit') 를 직접 호출한다.

import { useEffect } from 'react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';

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

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    wcs?: { event: (name: string, value?: string) => void };
    __junpiksAdsSendTo?: string;
  }
}

export function trackConversion(event: ConversionEvent, label?: string) {
  if (typeof window === 'undefined') return;

  try {
    if (window.gtag) {
      window.gtag('event', event, { event_category: 'lead', event_label: label ?? '' });
      const sendTo = window.__junpiksAdsSendTo;
      if (sendTo) {
        window.gtag('event', 'conversion', { send_to: sendTo, event_label: event });
      }
    } else if (window.dataLayer) {
      // GTM 만 쓰는 경우: dataLayer 로 넘겨 태그에서 처리
      window.dataLayer.push({ event, event_label: label ?? '' });
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

  useEffect(() => {
    window.__junpiksAdsSendTo = settings.googleAdsSendTo.trim() || undefined;
  }, [settings.googleAdsSendTo]);

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
