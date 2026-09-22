'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { splitLines, telHref } from '@/lib/contact';

export default function Footer() {
  const s = useSiteSettings();
  const year = new Date().getFullYear();
  const areas = splitLines(s.serviceAreaList);

  return (
    <footer className="bg-[#040d21] text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">JUNFI</span>
              <span className="text-2xl font-black text-[#00b4d8] -ml-2">X</span>
              <span className="text-slate-400 font-semibold text-[11px] tracking-widest">TOTAL HOME SERVICE</span>
            </div>
            <p className="mt-1">하수구 · 싱크대 · 변기 막힘 · 배관 고압세척 · 누수탐지 · 배관공사 · 에어컨 설치</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {s.naverBlogUrl && (
              <a
                href={s.naverBlogUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="blog_click"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <span className="bg-[#03c75a] text-white px-1 rounded text-[9px] font-black">N</span>
                네이버 블로그
              </a>
            )}
            {s.kakaoTalkUrl && (
              <a
                href={s.kakaoTalkUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="kakao_click"
                className="px-4 py-2 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-bold transition"
              >
                카카오톡 상담
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <div className="space-y-1">
            <h5 className="text-white font-bold mb-2">업체 정보</h5>
            <p>상호명 : {s.siteName}</p>
            {s.representativeName && <p>대표자 : {s.representativeName}</p>}
            {s.businessNumber && <p>사업자등록번호 : {s.businessNumber}</p>}
            {s.address && <p>주소 : {s.address}</p>}
          </div>

          <div className="space-y-1">
            <h5 className="text-white font-bold mb-2">상담 문의</h5>
            <p>
              <a href={telHref(s.phoneNumber)} data-track="call_click" className="text-white font-bold text-sm">
                {s.phoneNumber}
              </a>
            </p>
            <p>{s.businessHours}</p>
            {s.email && <p>이메일 : {s.email}</p>}
          </div>

          {areas.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-white font-bold mb-2">출동 지역</h5>
              <p>{areas.join(' · ')}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {year} {s.siteName}. All rights reserved.</p>
          <Link href="/admin" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition">
            <Lock className="w-3 h-3" /> 관리자
          </Link>
        </div>
      </div>
    </footer>
  );
}
