'use client';

import React from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';

export default function FloatingActionBar() {
  const handleAction = (type: string) => {
    // GA4 & Naver 전환 추적 이벤트 발생
    if (typeof window !== 'undefined') {
      if ((window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: 'JUNFIX_LEAD',
          event_category: 'Lead',
          event_label: type,
        });
      }
      if ((window as any).wcs) {
        (window as any).wcs.event('lead', type);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-2.5">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* SMS Inquiry */}
        <a
          href="sms:01027031491?body=안녕하세요 준픽스, 설비 견적 및 출동 문의드립니다."
          onClick={() => handleAction('sms')}
          data-track="sms-click"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition active:scale-95"
        >
          <MessageSquare className="w-5 h-5 text-slate-700 mb-0.5" />
          <span className="text-[11px] font-bold">문자 상담</span>
        </a>

        {/* KakaoTalk */}
        <a
          href="https://open.kakao.com/me/junfix"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleAction('kakao')}
          data-track="kakao-click"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] transition active:scale-95"
        >
          <span className="w-5 h-5 flex items-center justify-center font-black text-xs mb-0.5">💬</span>
          <span className="text-[11px] font-black">카톡 상담</span>
        </a>

        {/* Direct Call - High Emphasis */}
        <a
          href="tel:010-2703-1491"
          onClick={() => handleAction('call')}
          data-track="call-click"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md transition active:scale-95 animate-call-pulse"
        >
          <Phone className="w-5 h-5 fill-white mb-0.5" />
          <span className="text-[11px] font-black">전화 상담</span>
        </a>
      </div>
    </div>
  );
}
