'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';
import { BrandLogo } from '@/components/Navbar';

const HIGHLIGHTS = ['하수구·싱크대 막힘', '변기 막힘·교체', '배관 고압세척', '누수탐지', '수전·세면대', '에어컨 설치'];

/** 네이버 블로그 시안 톤의 메인 배너: 밝은 배경, 로고 + 핵심 문구 + 주요 서비스 + 상담 연결 */
export default function Hero() {
  const s = useSiteSettings();
  const hasImage = Boolean(s.heroImageUrl);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-100 to-white">
      {/* 배경 장식: 연한 파란 원 */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="container-x relative py-6 sm:py-16 lg:py-20">
        <div className={`grid grid-cols-1 gap-8 items-center ${hasImage ? 'lg:grid-cols-12' : ''}`}>
          <div className={`space-y-3.5 sm:space-y-6 ${hasImage ? 'lg:col-span-7' : 'max-w-2xl'}`}>
            <div>
              <BrandLogo className="h-8 sm:h-12" />
              <div className="mt-0.5 text-[10px] sm:text-[11px] tracking-[0.25em] font-semibold text-muted">TOTAL HOME SERVICE</div>
            </div>

            <span className="inline-block px-3.5 py-1.5 rounded-full bg-navy text-white text-xs sm:text-sm font-bold">
              젊은 기술, 정직한 <span className="text-brand-light">서비스</span>
            </span>

            <h1 className="text-[25px] sm:text-[40px] lg:text-[44px] font-black leading-[1.2] text-navy">
              {s.tagline}
              <br />
              <span className="text-brand">준픽스 종합설비</span>
            </h1>

            <p className="text-[15px] sm:text-lg text-ink font-medium">
              작은 문제도 <span className="text-brand font-bold">끝까지 책임집니다.</span>
            </p>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-w-lg">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="chip">
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
              <a href={telHref(s.phoneNumber)} data-track="call_click" className="btn-primary px-6 py-3 sm:py-3.5 text-base sm:text-lg">
                <Phone className="w-5 h-5" />
                {s.phoneNumber}
              </a>
              {s.kakaoTalkUrl && (
                <a href={s.kakaoTalkUrl} target="_blank" rel="noopener noreferrer" data-track="kakao_click" className="btn-kakao px-6 py-3 sm:py-3.5 text-base">
                  <MessageCircle className="w-5 h-5" />
                  카카오톡 상담
                </a>
              )}
            </div>
          </div>

          {hasImage && (
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-white shadow-lg border border-white">
                <Image src={s.heroImageUrl} alt={`${s.siteName} 대표 이미지`} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 480px" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 정보 띠 */}
      <div className="bg-navy text-white">
        <div className="container-x py-2.5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8 text-sm">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-light" />
            {s.businessHours}
          </span>
          <a href={telHref(s.phoneNumber)} data-track="call_click" className="flex items-center gap-2 font-bold">
            <Phone className="w-4 h-4 text-brand-light" />
            {s.phoneNumber}
          </a>
          {s.kakaoTalkUrl && (
            <a href={s.kakaoTalkUrl} target="_blank" rel="noopener noreferrer" data-track="kakao_click" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#FEE500]" />
              카카오톡 상담문의
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
