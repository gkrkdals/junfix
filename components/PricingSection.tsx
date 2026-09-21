'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PricingItem } from '@/lib/types';
import {
  Phone,
  CheckCircle,
  ThumbsUp,
  Coins,
  ShieldCheck,
  Home,
  Info,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';

interface Props {
  pricing: PricingItem[];
}

export default function PricingSection({ pricing }: Props) {
  const [showImageModal, setShowImageModal] = useState(false);

  const fixedItems = pricing.filter((p) => p.category === 'fixed');
  const quoteItems = pricing.filter((p) => p.category === 'quote');

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-100/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[#0077b6] text-xs sm:text-sm font-black tracking-wider uppercase">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
            준픽스 투명 정찰제 작업 가격 안내
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            준픽스는 현장 도착 후 임의로 부당한 추가 요금을 요구하지 않습니다.
            <strong className="text-slate-800"> 반드시 작업 전 원인과 비용을 안내해 드린 뒤 고객 동의 하에만 작업을 진행합니다.</strong>
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowImageModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#00b4d8] text-slate-700 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition"
            >
              <Maximize2 className="w-4 h-4 text-[#00b4d8]" />
              준픽스 공식 가격표 원본 포스터 보기
            </button>
          </div>
        </div>

        {/* The Exact Design Layout matching client's uploaded image */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden max-w-6xl mx-auto">
          {/* Top Banner inside sheet */}
          <div className="bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#071739] text-white p-6 sm:p-8 border-b-4 border-[#00b4d8]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">JUNFI</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#00b4d8]">X</span>
                  <span className="text-xs text-slate-300 font-bold ml-1 tracking-widest">
                    TOTAL HOME SERVICE
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-[#90e0ef] font-semibold mt-1">
                  하수구 · 배관설비 · 누수 · 종합설비
                </div>
              </div>

              <div className="text-right sm:text-right">
                <div className="text-sm font-bold text-cyan-200">
                  막힌 곳은 시원하게 불편한 곳은 확실하게!
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
                  준픽스 작업 가격 안내
                </h3>
              </div>
            </div>

            {/* Sub-pill notification */}
            <div className="mt-4 inline-block bg-[#00b4d8] text-[#071739] px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold shadow-sm">
              ✔ 작업 전 비용 안내 · 고객 동의 후 작업 진행
            </div>
          </div>

          {/* Main Price Body Grid */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Price Items (Fixed + Quote) */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. 기본 비용 리스트 (사진과 일치) */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]" />
                    기본 표준 작업 비용
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">단위: 원 (VAT 별도)</span>
                </div>

                <div className="space-y-3">
                  {fixedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                          {item.id}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-base sm:text-lg">
                            {item.serviceName}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg sm:text-2xl font-black text-red-600 tracking-tight">
                          {item.priceDisplay}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 현장 견적 서비스 (사진의 하단 파란 영역) */}
              <div>
                <div className="bg-[#071739] text-white p-3.5 rounded-t-xl flex items-center justify-between">
                  <span className="font-black text-sm sm:text-base text-[#00b4d8]">
                    현장 견적 서비스
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    정확한 진단으로 확실하게 해결합니다!
                  </span>
                </div>

                <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden divide-y divide-slate-200 bg-white">
                  {quoteItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 transition"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 text-base">
                          {item.serviceName}
                        </div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                      <div>
                        <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0077b6] text-sm font-black border border-blue-200">
                          {item.priceDisplay}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Service Promise & Poster Graphic */}
            <div className="lg:col-span-4 space-y-6">
              {/* Trust Features Sidebar (as in Image) */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="text-center pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-[#0077b6]">JUNFIX PROMISE</span>
                  <h4 className="text-base font-black text-slate-900">
                    젊은 기술, 정직한 서비스
                  </h4>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00b4d8]/10 text-[#0077b6] flex items-center justify-center shrink-0">
                      <ThumbsUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">신속한 출장 서비스</div>
                      <div className="text-xs text-slate-500">수도권 30~60분 내 도착</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00b4d8]/10 text-[#0077b6] flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">합리적인 비용 안내</div>
                      <div className="text-xs text-slate-500">작업 전 명확한 사전 견적</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00b4d8]/10 text-[#0077b6] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">정직한 작업 진행</div>
                      <div className="text-xs text-slate-500">과잉 청구 절대 근절</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00b4d8]/10 text-[#0077b6] flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">깔끔한 작업 마무리</div>
                      <div className="text-xs text-slate-500">현장 정리 및 통수 확인</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-white rounded-xl border border-blue-100 text-center">
                    <p className="text-xs font-bold text-slate-800">
                      &quot;생활의 불편함, 준픽스가 해결합니다!&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Call Card */}
              <div className="bg-[#071739] text-white p-5 rounded-2xl text-center space-y-3">
                <div className="text-xs text-[#00b4d8] font-bold">24시간 상담 및 접수</div>
                <div className="text-xl sm:text-2xl font-black text-white">010-2703-1491</div>
                <a
                  href="tel:010-2703-1491"
                  data-track="call-click"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  전화로 견적 상담하기
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Contact & Disclaimer (from Image) */}
          <div className="bg-[#040d21] text-white p-6 sm:p-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800 text-center md:text-left">
              <div>
                <div className="text-xs text-slate-400 font-semibold">
                  경기 · 수도권 출장 (평일 · 주말 24시간 상담 가능)
                </div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  상담 및 작업 문의 : <span className="text-[#00b4d8]">010-2703-1491</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-200">
                  직접 출동
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-200">
                  투명한 비용
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-200">
                  사후서비스
                </span>
              </div>
            </div>

            {/* Disclaimer Notes (Strictly matching user's image) */}
            <div className="pt-4 text-xs text-slate-400 space-y-1">
              <p>※ 위 금액은 일반적인 작업 기준의 기본 비용입니다.</p>
              <p>※ 막힘 정도, 배관 구조, 작업 난이도 및 장비 사용 여부에 따라 비용이 달라질 수 있습니다.</p>
              <p>※ 고압세척·배관 교체·누수탐지는 현장 상황에 따라 별도 견적이 적용될 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal for Viewing the Original Poster */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/junfix_pricing_table.jpg"
                alt="준픽스 작업 가격 안내 공식 포스터"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
