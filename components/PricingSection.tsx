'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, Maximize2, X, ThumbsUp, Coins, ShieldCheck, Home } from 'lucide-react';
import type { PricingItem } from '@/lib/types';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  pricing: PricingItem[];
}

export default function PricingSection({ pricing }: Props) {
  const s = useSiteSettings();
  const [showPoster, setShowPoster] = useState(false);

  const fixed = pricing.filter((p) => p.category === 'fixed');
  const quote = pricing.filter((p) => p.category === 'quote');

  const promises = [
    { icon: ThumbsUp, title: '신속한 출장 서비스', desc: '연락 주시면 일정을 잡아 방문합니다' },
    { icon: Coins, title: '합리적인 비용 안내', desc: '작업 전 비용을 먼저 안내합니다' },
    { icon: ShieldCheck, title: '정직한 작업 진행', desc: '고객 동의 후 작업을 시작합니다' },
    { icon: Home, title: '깔끔한 작업 마무리', desc: '현장 정리와 통수 확인' },
  ];

  return (
    <section id="pricing" className="py-14 sm:py-20 bg-slate-100/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="text-[#0077b6] text-xs sm:text-sm font-bold">작업비용 안내</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">준픽스 작업 가격 안내</h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            일반적인 작업 기준의 기본 비용입니다. 현장 확인 후 정확한 비용을 안내드리고, 동의하신 뒤 작업합니다.
          </p>
          <button
            onClick={() => setShowPoster(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#00b4d8] text-slate-700 text-xs sm:text-sm font-bold transition"
          >
            <Maximize2 className="w-4 h-4 text-[#00b4d8]" /> 가격표 이미지로 보기
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden max-w-6xl mx-auto">
          <div className="bg-[#071739] text-white p-5 sm:p-7 border-b-4 border-[#00b4d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-[#90e0ef] font-semibold">하수구 · 배관설비 · 누수 · 종합설비</div>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5">작업 전 비용 안내 · 고객 동의 후 작업 진행</h3>
            </div>
            <div className="text-xs text-slate-300">단위: 원 (VAT 별도)</div>
          </div>

          <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              {fixed.length > 0 && (
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]" /> 기본 작업 비용
                  </h4>
                  <ul className="space-y-2.5">
                    {fixed.map((item, index) => (
                      <li key={item.id} className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-base sm:text-lg">{item.serviceName}</div>
                            {item.description && <div className="text-xs sm:text-sm text-slate-500">{item.description}</div>}
                            {item.notice && <div className="text-[11px] text-slate-400 mt-0.5">{item.notice}</div>}
                          </div>
                        </div>
                        <div className="text-base sm:text-xl font-black text-red-600 whitespace-nowrap">{item.priceDisplay}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {quote.length > 0 && (
                <div>
                  <div className="bg-[#071739] text-white p-3.5 rounded-t-xl flex items-center justify-between">
                    <span className="font-black text-sm sm:text-base text-[#00b4d8]">현장 견적 서비스</span>
                    <span className="text-xs text-slate-300">현장 상황에 따라 비용이 달라지는 작업</span>
                  </div>
                  <ul className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden divide-y divide-slate-200 bg-white">
                    {quote.map((item) => (
                      <li key={item.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-base">{item.serviceName}</div>
                          {item.description && <div className="text-xs sm:text-sm text-slate-500">{item.description}</div>}
                          {item.notice && <div className="text-[11px] text-slate-400 mt-0.5">{item.notice}</div>}
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0077b6] text-sm font-black border border-blue-200 whitespace-nowrap">
                          {item.priceDisplay}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="text-center pb-2 border-b border-slate-200">
                  <h4 className="text-base font-black text-slate-900">젊은 기술, 정직한 서비스</h4>
                </div>
                {promises.map((p) => (
                  <div key={p.title} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00b4d8]/10 text-[#0077b6] flex items-center justify-center shrink-0">
                      <p.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#071739] text-white p-5 rounded-2xl text-center space-y-2.5">
                <div className="text-xs text-[#00b4d8] font-bold">상담 및 작업 문의</div>
                <div className="text-xl sm:text-2xl font-black">{s.phoneNumber}</div>
                <a
                  href={telHref(s.phoneNumber)}
                  data-track="call_click"
                  className="w-full py-3 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#071739] font-extrabold text-sm flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4" /> 전화로 견적 문의
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#040d21] text-slate-400 p-5 sm:p-7 text-xs space-y-1 border-t border-slate-800">
            <p>※ 위 금액은 일반적인 작업 기준의 기본 비용입니다.</p>
            <p>※ 막힘 정도, 배관 구조, 작업 난이도 및 장비 사용 여부에 따라 비용이 달라질 수 있습니다.</p>
            <p>※ 고압세척 · 배관 교체 · 누수탐지는 현장 상황에 따라 별도 견적이 적용될 수 있습니다.</p>
          </div>
        </div>
      </div>

      {showPoster && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowPoster(false)}>
          <div className="relative bg-white max-w-2xl w-full rounded-2xl overflow-hidden p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPoster(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-[3/4] w-full">
              <Image src="/images/junfix_pricing_table.jpg" alt="준픽스 작업 가격 안내" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
