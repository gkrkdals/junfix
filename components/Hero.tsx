'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

const HIGHLIGHTS = ['하수구·싱크대 막힘', '변기 막힘·교체', '배관 고압세척', '누수탐지', '수전·세면대', '에어컨 설치'];
const DEFAULT_CHARACTER = '/images/junfix_character.png';

/**
 * 메인 배너. 배경 #E1EAF0, 캐릭터 이미지(관리자 업로드 > 기본 캐릭터).
 * - PC: 오른쪽에 캐릭터가 하단 정보 띠 위에 서 있는 구도
 * - 모바일: 문구·버튼 아래에 캐릭터를 두어 첫 화면에는 버튼까지 보이고, 스크롤하면 캐릭터가 띠 위에 서 있다
 */
export default function Hero() {
  const s = useSiteSettings();
  const image = s.heroImageUrl || DEFAULT_CHARACTER;

  return (
    <section className="relative overflow-hidden bg-[#E1EAF0]">
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/60 blur-3xl" />

      <div className="container-x relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-end lg:gap-8">
          {/* 문구 */}
          <div className="lg:col-span-7 pt-6 sm:pt-12 lg:py-16 space-y-3.5 sm:space-y-6">
            {/* 배너 전용 로고(워드마크 + 업종 + 준픽스). 관리자 로고를 올리면 그 이미지로 대체 */}
            {/* 모바일에서는 로고와 슬로건을 가운데, PC 에서는 왼쪽 정렬 */}
            <div className={`relative mx-auto lg:mx-0 w-[220px] sm:w-[300px] lg:w-[340px] ${s.logoImageUrl ? 'aspect-[919/162]' : 'aspect-[1393/720]'}`}>
              <Image src={s.logoImageUrl || '/images/junfix_logo_full.png'} alt={s.siteName} fill className="object-contain object-center lg:object-left" priority sizes="340px" />
            </div>

            <div className="text-center lg:text-left">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-navy text-white text-xs sm:text-sm font-bold">
                젊은 기술, 정직한 <span className="text-brand-light">서비스</span>
              </span>
            </div>

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

          {/* 캐릭터: 하단 정보 띠 위에 서 있도록 아래 여백 없이 붙인다 */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end mt-4 sm:mt-6 lg:mt-0">
            <div className="relative w-[210px] h-[220px] sm:w-[300px] sm:h-[320px] lg:w-[400px] lg:h-[440px]">
              <Image src={image} alt={`${s.siteName} 기술자`} fill className="object-contain object-bottom" priority sizes="(max-width: 640px) 210px, (max-width: 1024px) 300px, 400px" />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 띠 */}
      <div className="relative bg-navy text-white">
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
