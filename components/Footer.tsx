'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { splitLines, telHref } from '@/lib/contact';
import { BrandLogo } from '@/components/Navbar';

export default function Footer() {
  const s = useSiteSettings();
  const year = new Date().getFullYear();
  const areas = splitLines(s.serviceAreaList);

  return (
    <footer className="bg-navy-deep text-slate-300 text-[13px]">
      <div className="container-x py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <BrandLogo variant="white" className="h-7" />
            <p className="mt-2 text-slate-400">하수구 · 배관 · 누수 · 종합설비 · 에어컨</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.naverBlogUrl && (
              <a href={s.naverBlogUrl} target="_blank" rel="noopener noreferrer" data-track="blog_click" className="btn bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-[13px]">
                네이버 블로그 <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {s.kakaoTalkUrl && (
              <a href={s.kakaoTalkUrl} target="_blank" rel="noopener noreferrer" data-track="kakao_click" className="btn-kakao px-4 py-2 text-[13px]">
                카카오톡 상담
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <h5 className="text-white font-bold mb-1.5">업체 정보</h5>
            <p>상호명 : {s.siteName}</p>
            {s.representativeName && <p>대표자 : {s.representativeName}</p>}
            {s.businessNumber && <p>사업자등록번호 : {s.businessNumber}</p>}
            {s.address && <p>주소 : {s.address}</p>}
          </div>
          <div className="space-y-1">
            <h5 className="text-white font-bold mb-1.5">상담 문의</h5>
            <p>
              <a href={telHref(s.phoneNumber)} data-track="call_click" className="text-white font-bold text-base">
                {s.phoneNumber}
              </a>
            </p>
            <p>{s.businessHours}</p>
            {s.email && <p>이메일 : {s.email}</p>}
          </div>
          {areas.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-white font-bold mb-1.5">출동 지역</h5>
              <p>{areas.join(' · ')}</p>
            </div>
          )}
        </div>

        <div className="pt-5 border-t border-white/10 text-[12px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {year} {s.siteName}. All rights reserved.</p>
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-slate-300 transition">
            <Lock className="w-3 h-3" /> 관리자
          </Link>
        </div>
      </div>
    </footer>
  );
}
