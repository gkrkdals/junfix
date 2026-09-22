'use client';

import React from 'react';
import { Phone, MessageSquare, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { smsHref, telHref } from '@/lib/contact';

/** 모바일 화면 하단에 항상 보이는 상담 버튼 (문자 / 카카오톡 / 전화) */
export default function FloatingActionBar() {
  const s = useSiteSettings();
  const smsBody = `안녕하세요, ${s.siteName} 상담 문의드립니다. (지역/증상: )`;
  const hasKakao = Boolean(s.kakaoTalkUrl);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <div className={`grid gap-2 max-w-md mx-auto ${hasKakao ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <a
          href={smsHref(s.phoneNumber, smsBody)}
          data-track="sms_click"
          className="flex flex-col items-center justify-center py-2 rounded-xl bg-slate-100 text-slate-800 active:scale-95 transition"
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">문자 문의</span>
        </a>

        {hasKakao && (
          <a
            href={s.kakaoTalkUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="kakao_click"
            className="flex flex-col items-center justify-center py-2 rounded-xl bg-[#FEE500] text-[#191919] active:scale-95 transition"
          >
            <MessageCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-bold">카카오톡 상담</span>
          </a>
        )}

        <a
          href={telHref(s.phoneNumber)}
          data-track="call_click"
          className="flex flex-col items-center justify-center py-2 rounded-xl bg-[#0077b6] text-white active:scale-95 transition"
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">전화하기</span>
        </a>
      </div>
    </div>
  );
}
