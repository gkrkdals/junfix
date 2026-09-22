'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Menu, X } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

export const MENU = [
  { href: '#services', label: '서비스 안내' },
  { href: '#pricing', label: '작업비용' },
  { href: '#cases', label: '작업 사례' },
  { href: '#reviews', label: '고객후기' },
  { href: '#contact', label: '상담문의' },
];

/** JUNFIX 로고. 관리자가 올린 로고 > 기본 로고 이미지 순. */
export function BrandLogo({ variant = 'navy', className = 'h-7 sm:h-8' }: { variant?: 'navy' | 'white'; className?: string }) {
  const s = useSiteSettings();
  const src = s.logoImageUrl || (variant === 'white' ? '/images/junfix_logo_white.png' : '/images/junfix_logo.png');
  return (
    <span className={`relative block ${className} aspect-[1071/226]`}>
      <Image src={src} alt={s.siteName} fill className="object-contain object-left" priority sizes="200px" />
    </span>
  );
}

export default function Navbar() {
  const s = useSiteSettings();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="container-x">
        <div className="flex justify-between items-center h-14 sm:h-[68px]">
          <Link href="/" aria-label={`${s.siteName} 홈`} className="flex items-center">
            <BrandLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-semibold text-navy">
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand transition">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={telHref(s.phoneNumber)} data-track="call_click" className="hidden sm:inline-flex btn-primary px-4 py-2.5 text-sm">
              <Phone className="w-4 h-4" />
              {s.phoneNumber}
            </a>
            <a href={telHref(s.phoneNumber)} data-track="call_click" className="sm:hidden p-2.5 rounded-full bg-navy text-white" aria-label="전화하기">
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg text-navy hover:bg-slate-100"
              aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={open}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-2 shadow-lg">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-[15px] font-semibold text-navy border-b border-slate-100 last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
