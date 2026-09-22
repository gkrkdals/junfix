'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Menu, X, Clock } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

const MENU = [
  { href: '#about', label: '준픽스 소개' },
  { href: '#services', label: '서비스 안내' },
  { href: '#cases', label: '시공사례' },
  { href: '#pricing', label: '작업비용' },
  { href: '#reviews', label: '고객후기' },
  { href: '#contact', label: '상담문의' },
];

export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = useSiteSettings();
  const textSize = size === 'sm' ? 'text-xl' : 'text-2xl sm:text-3xl';

  if (s.logoImageUrl) {
    return (
      <span className={`relative block ${size === 'sm' ? 'h-8 w-32' : 'h-10 w-40 sm:h-12 sm:w-48'}`}>
        <Image src={s.logoImageUrl} alt={s.siteName} fill className="object-contain object-left" priority />
      </span>
    );
  }

  return (
    <span className="flex flex-col leading-none">
      <span className={`flex items-center tracking-tight ${textSize} font-black`}>
        <span className="text-[#071739]">JUNFI</span>
        <span className="text-[#0096c7]">X</span>
      </span>
      <span className="text-[10px] tracking-[0.2em] text-slate-500 font-semibold mt-0.5">
        TOTAL HOME SERVICE
      </span>
    </span>
  );
}

export default function Navbar() {
  const s = useSiteSettings();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* 상단 안내줄 */}
      <div className="bg-[#071739] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-[#00b4d8]" />
            {s.businessHours}
          </span>
          {s.naverBlogUrl && (
            <a
              href={s.naverBlogUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="blog_click"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white"
            >
              <span className="bg-[#03c75a] text-white px-1.5 rounded text-[10px] font-bold leading-4">N</span>
              블로그
            </a>
          )}
        </div>
      </div>

      {/* 메인 메뉴 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" aria-label={`${s.siteName} 홈`} className="flex items-center">
            <BrandLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-semibold text-slate-700">
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#0077b6] transition">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telHref(s.phoneNumber)}
              data-track="call_click"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0077b6] text-white font-bold text-sm hover:bg-[#0096c7] transition"
            >
              <Phone className="w-4 h-4" />
              <span>{s.phoneNumber}</span>
            </a>
            <a
              href={telHref(s.phoneNumber)}
              data-track="call_click"
              className="sm:hidden p-2.5 rounded-full bg-[#0077b6] text-white"
              aria-label="전화하기"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={open}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-5 py-3 shadow-lg">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium text-slate-800 border-b border-slate-100 last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={telHref(s.phoneNumber)}
            data-track="call_click"
            className="mt-3 w-full py-3 rounded-xl bg-[#071739] text-white font-bold text-base flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5 text-[#00b4d8]" />
            {s.phoneNumber} 전화하기
          </a>
        </div>
      )}
    </header>
  );
}
