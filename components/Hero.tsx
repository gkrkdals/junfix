'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, Zap, Shield, ThumbsUp, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

export default function Hero() {
  const s = useSiteSettings();
  const heroImage = s.heroImageUrl || '/images/junfix_main_poster.jpg';

  const points = [
    { icon: Zap, title: '빠른 출동', desc: '현장 직접 방문' },
    { icon: Shield, title: '합리적인 비용', desc: '작업 전 비용 안내' },
    { icon: ThumbsUp, title: '꼼꼼한 시공', desc: '작업 후 정리와 확인' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#071739] to-[#0a2558] text-white py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-100 text-xs sm:text-sm">
                {s.businessHours}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-lg sm:text-2xl font-bold text-[#00b4d8]">{s.tagline}</p>
              <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                하수구 · 배관 · 누수 전문
                <br />
                <span className="text-cyan-100">현장에 직접 출동하는 설비업체</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                하수구·싱크대·변기 막힘부터 변기 교체, 배관 고압세척, 누수탐지, 배관공사까지.
                원인을 확인하고 비용을 먼저 안내한 뒤 작업합니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto lg:mx-0">
              {points.map((p) => (
                <div key={p.title} className="bg-white/10 border border-white/10 p-3 rounded-xl text-center">
                  <p.icon className="w-5 h-5 mx-auto mb-1.5 text-[#00b4d8]" />
                  <div className="text-xs sm:text-sm font-bold">{p.title}</div>
                  <div className="text-[11px] text-slate-300">{p.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <a
                href={telHref(s.phoneNumber)}
                data-track="call_click"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#00b4d8] hover:bg-[#0096c7] text-[#071739] font-extrabold text-lg sm:text-xl transition active:scale-[0.98]"
              >
                <Phone className="w-6 h-6" />
                <span>{s.phoneNumber}</span>
              </a>
              <a
                href="#contact"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition"
              >
                <span>상담 신청하기</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-3 shadow-2xl">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
                <Image src={heroImage} alt={`${s.siteName} 대표 이미지`} fill className="object-cover" priority />
              </div>
              <div className="mt-3 bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[#00b4d8] font-bold">상담 및 작업 문의</div>
                  <div className="text-sm font-black">{s.businessHours}</div>
                </div>
                <a
                  href={telHref(s.phoneNumber)}
                  data-track="call_click"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#00b4d8] text-[#071739] text-xs font-bold hover:bg-[#48cae4] transition"
                >
                  전화하기
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
