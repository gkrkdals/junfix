'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Truck, Wrench, FileCheck, Award, ThumbsUp, CheckCircle2 } from 'lucide-react';

export default function WhyJunfix() {
  const strengths = [
    {
      icon: <Truck className="w-8 h-8 text-[#00b4d8]" />,
      title: '100% 직영 출동 (하도급 없음)',
      desc: '중개 수수료나 외주 하도급 없이 대표 엔지니어가 직접 출동하여 정직하고 책임감 있게 작업합니다.',
    },
    {
      icon: <Wrench className="w-8 h-8 text-[#00b4d8]" />,
      title: '수천만 원 상당 최첨단 장비 완비',
      desc: 'FHD 배관 내시경, 리지드 K9 플렉스샤프트, 300bar 초고압 세척기, 디지털 누수탐지기로 배관을 파괴하지 않고 안전하게 해결합니다.',
    },
    {
      icon: <FileCheck className="w-8 h-8 text-[#00b4d8]" />,
      title: '작업 전 비용 고지 & 사전 동의',
      desc: '현장 확인 후 정확한 원인과 작업 비용을 사전에 명확히 안내해 드리며, 고객 동의 없이 임의로 작업을 시작하지 않습니다.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#00b4d8]" />,
      title: '못 뚫으면 비용 0원 & A/S 보장',
      desc: '기술에 대한 자신감으로 해결하지 못하면 비용을 받지 않으며, 동일 부위 재발 시 철저한 사후관리를 약속드립니다.',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#0077b6] text-xs sm:text-sm font-black tracking-wider uppercase">
            WHY JUNFIX
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
            왜 배관·설비는 준픽스(JUNFIX)여야 할까요?
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            광고만 그럴듯한 단순 출장 중개 플랫폼이 아닙니다.
            현장에서 직접 땀 흘리며 수많은 배관을 뚫어낸 진짜 기술자가 직접 찾아갑니다.
          </p>
        </div>

        {/* 4 Core Strengths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {strengths.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#00b4d8]/10 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#0077b6] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#00b4d8]" /> 준픽스 안심 약속
              </div>
            </div>
          ))}
        </div>

        {/* Brand Banner Card using User's Image Asset */}
        <div className="bg-gradient-to-r from-[#071739] to-[#0a2558] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 text-[#90e0ef] text-xs font-bold">
              책임 시공제 운영
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              &quot;작은 문제도 그냥 넘기지 않고, 끝까지 책임집니다.&quot;
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              타 업체가 해결하지 못하고 돌아선 고난이도 배관 막힘, 낡은 주택의 누수 문제도
              준픽스의 젊은 열정과 전문 기술력으로 시원하게 뚫어드립니다.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href="tel:010-2703-1491"
              data-track="call-click"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:brightness-110 text-white font-extrabold text-center shadow-lg transition"
            >
              직영 기사 바로 전화하기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
