'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, Menu, X, ShieldCheck, Clock, Award } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Utility Bar */}
      <div className="bg-[#071739] text-white py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#00b4d8]">
              <Clock className="w-3.5 h-3.5" /> 24시 긴급상담 & 긴급출동
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-slate-200">
              경기·수도권 전지역 30분~1시간 내 도착
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://blog.naver.com/junfix_official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <span className="bg-[#03c75a] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">N</span>
              공식 블로그
            </a>
            <Link href="/admin" className="text-slate-300 hover:text-white text-[11px] underline">
              관리자
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <div className="flex items-center tracking-tight">
                <span className="text-2xl sm:text-3xl font-black text-[#071739]">JUNFI</span>
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-[#0077b6]">
                  X
                </span>
                <span className="ml-2 px-1.5 py-0.5 bg-[#00b4d8]/15 text-[#0077b6] text-[10px] font-bold rounded-md">
                  설비전문
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-widest text-slate-500 font-semibold -mt-1">
                TOTAL HOME SERVICE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-base font-semibold text-slate-700">
            <Link href="#about" className="hover:text-[#0077b6] transition">준픽스 소개</Link>
            <Link href="#services" className="hover:text-[#0077b6] transition">서비스 안내</Link>
            <Link href="#cases" className="hover:text-[#0077b6] transition">시공사례</Link>
            <Link href="#pricing" className="hover:text-[#0077b6] transition">작업비용</Link>
            <Link href="#aircon" className="text-[#0077b6] hover:text-[#00b4d8] transition">에어컨 서비스</Link>
            <Link href="#reviews" className="hover:text-[#0077b6] transition">고객후기</Link>
            <Link href="#contact" className="hover:text-[#0077b6] transition">상담문의</Link>
          </nav>

          {/* Call-to-action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:010-2703-1491"
              data-track="call-click"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-105 transition transform active:scale-95"
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>010-2703-1491</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="tel:010-2703-1491"
              data-track="call-click"
              className="p-2 rounded-full bg-[#00b4d8] text-white sm:hidden"
              aria-label="전화걸기"
            >
              <Phone className="w-4 h-4 fill-white" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-3 font-medium text-slate-800 shadow-xl">
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base border-b border-slate-100"
          >
            준픽스 소개 & 강점
          </Link>
          <Link
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base border-b border-slate-100"
          >
            서비스 안내 (하수구/싱크대/변기/누수)
          </Link>
          <Link
            href="#aircon"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-[#0077b6] font-bold border-b border-slate-100"
          >
            에어컨 설치 및 수리
          </Link>
          <Link
            href="#cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base border-b border-slate-100"
          >
            실제 시공사례 (Before/After)
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base border-b border-slate-100"
          >
            작업비용 안내표
          </Link>
          <Link
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base border-b border-slate-100"
          >
            고객 후기
          </Link>
          <Link
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-[#0077b6] font-bold"
          >
            간편 견적 & 출동신청
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="tel:010-2703-1491"
              data-track="call-click"
              className="w-full text-center py-3 rounded-xl bg-[#071739] text-white font-bold text-base flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-5 h-5 text-[#00b4d8]" />
              010-2703-1491 전화걸기
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
