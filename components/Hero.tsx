'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, CheckCircle2, Zap, Shield, ThumbsUp, Wrench, Droplets, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#071739] via-[#0a2558] to-[#040d21] text-white py-12 sm:py-20 lg:py-24">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00b4d8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00b4d8]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 text-[#90e0ef] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#00b4d8]" /> 24시 수도권 긴급출동 대기
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs sm:text-sm font-medium">
                100% 직영 시공 · 하도급 없음
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <p className="text-xl sm:text-2xl font-bold text-[#00b4d8] tracking-wide">
                막힘은 해결하고, 일상은 흐르게!
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
                배관·하수구·누수 설비 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00b4d8]">
                  젊은 기술, 정직한 서비스
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 pt-2 leading-relaxed">
                식당·상가·빌라·아파트 배관 막힘부터 미세 누수, 변기 교체까지!
                최신 장비와 투명한 사전 견적으로 작은 문제도 그냥 지나치지 않고 끝까지 책임집니다.
              </p>
            </div>

            {/* Core Features Badges (from Poster) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl text-center">
                <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#00b4d8]/20 flex items-center justify-center text-[#00b4d8]">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">빠른 출동</div>
                <div className="text-[10px] text-slate-300">30분~1시간 내</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl text-center">
                <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#00b4d8]/20 flex items-center justify-center text-[#00b4d8]">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">합리적인 비용</div>
                <div className="text-[10px] text-slate-300">작업 전 사전고지</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl text-center">
                <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#00b4d8]/20 flex items-center justify-center text-[#00b4d8]">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">꼼꼼한 시공</div>
                <div className="text-[10px] text-slate-300">확실한 사후관리</div>
              </div>
            </div>

            {/* Direct Call & Lead Action */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="tel:010-2703-1491"
                data-track="call-click"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-extrabold text-lg sm:text-xl shadow-xl hover:shadow-cyan-500/25 hover:brightness-110 transition active:scale-95 animate-call-pulse"
              >
                <Phone className="w-6 h-6 fill-white" />
                <span>010-2703-1491 상담하기</span>
              </a>
              <a
                href="#contact"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base transition border border-white/20"
              >
                <span>간편 견적 접수</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Guarantee Note */}
            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4d8]" /> 못 뚫으면 비용 0원
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4d8]" /> 첨단 내시경 실시간 확인
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00b4d8]" /> 카드결제·세금계산서 가능
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic with User's Asset Poster */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-3 shadow-2xl border-4 border-[#00b4d8]/40 overflow-hidden transform hover:-translate-y-1 transition duration-300">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner">
                <Image
                  src="/images/junfix_main_poster.jpg"
                  alt="준픽스 공식 홍보 포스터"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Float Banner inside card */}
              <div className="mt-3 bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#00b4d8] font-bold">경기·수도권 전지역 출동</div>
                  <div className="text-sm font-black">평일·주말 24시간 상담 대기</div>
                </div>
                <a
                  href="tel:010-2703-1491"
                  className="px-3 py-1.5 rounded-lg bg-[#00b4d8] text-white text-xs font-bold hover:bg-[#0096c7] transition"
                >
                  지금 통화
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
