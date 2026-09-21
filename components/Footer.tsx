'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Clock, MapPin, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#040d21] text-slate-400 text-xs border-t border-slate-800">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start tracking-tight">
              <span className="text-2xl font-black text-white">JUNFI</span>
              <span className="text-2xl font-black text-[#00b4d8]">X</span>
              <span className="ml-2 text-slate-300 font-bold text-xs tracking-wider">
                TOTAL HOME SERVICE
              </span>
            </div>
            <p className="mt-1 text-slate-400 text-xs">
              하수구 · 싱크대 · 변기 막힘 · 배관 고압세척 · 누수탐지 · 에어컨 전문 설비
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://blog.naver.com/junfix_official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <span className="bg-[#03c75a] text-white px-1 py-0.2 rounded text-[9px] font-black">N</span>
              <span>네이버 블로그</span>
            </a>
            <a
              href="https://open.kakao.com/me/junfix"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-bold transition"
            >
              <span>카카오톡 1:1 상담</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-400">
          <div>
            <h5 className="text-white font-bold mb-2">업체 정보</h5>
            <p>상호명 : 준픽스 (JUNFIX)</p>
            <p>대표자 : 염준혁</p>
            <p>사업자등록번호 : 123-45-67890</p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-2">고객센터 & 긴급출동</h5>
            <p className="text-white font-bold text-sm">📞 010-2703-1491</p>
            <p>운영시간 : 평일·주말·공휴일 24시간 연중무휴</p>
            <p>이메일 : contact@junfix.com</p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-2">출장 가능 지역</h5>
            <p>경기·수도권 전지역 출장 가능</p>
            <p>서울 / 수원 / 성남 / 부천 / 안양 / 안산 / 용인 / 고양 / 인천 / 하남 등</p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-2">관리자 전용</h5>
            <p className="text-slate-500 mb-2">시공사례 및 가격표, 상담 접수 내역 관리</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
            >
              <Lock className="w-3 h-3 text-[#00b4d8]" />
              준픽스 관리자 시스템 로그인
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 JUNFIX TOTAL HOME SERVICE. All Rights Reserved.</p>
          <p>젊은 기술, 정직한 서비스 · 막힘은 해결하고 일상은 흐르게</p>
        </div>
      </div>
    </footer>
  );
}
