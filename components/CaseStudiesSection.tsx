'use client';

import React, { useState } from 'react';
import { CaseStudy } from '@/lib/types';
import BeforeAfterSlider from './BeforeAfterSlider';
import { MapPin, AlertCircle, Wrench, CheckCircle2, ExternalLink, Calendar, Filter, Sparkles, X } from 'lucide-react';

interface Props {
  initialCases: CaseStudy[];
}

export default function CaseStudiesSection({ initialCases }: Props) {
  const [cases] = useState<CaseStudy[]>(initialCases);
  const [filter, setFilter] = useState('전체');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const categories = ['전체', '싱크대 막힘', '하수구 막힘', '배관 고압세척', '변기 교체', '누수탐지'];

  const filteredCases = filter === '전체'
    ? cases
    : cases.filter((c) => c.serviceCategory.includes(filter) || filter.includes(c.serviceCategory));

  return (
    <section id="cases" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00b4d8]/10 text-[#0077b6] text-xs sm:text-sm font-bold mb-3">
            <Sparkles className="w-4 h-4" /> 100% 실제 현장 작업 스토리
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            준픽스 현장 시공사례
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            준픽스가 직접 해결한 생생한 현장 작업 기록입니다. 증상과 원인, 사용 장비와 투명한 전·후 결과를 확인해보세요.
          </p>
        </div>

        {/* Featured Interactive Before/After Showcase */}
        <div className="max-w-4xl mx-auto mb-14 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200">
          <BeforeAfterSlider
            beforeImage="/images/junfix_main_poster.jpg"
            afterImage="/images/junfix_pricing_table.jpg"
            title="대표 시공사례: 배관 내시경 정밀 검사 후 플렉스샤프트 관벽 스케일링 복원"
          />
        </div>

        {/* Filter Categories */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-[#071739] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedCase(item)}
              className="group cursor-pointer bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#00b4d8]/15 text-[#0077b6] font-bold">
                    {item.serviceCategory}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.region}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0077b6] transition line-clamp-2">
                  {item.title}
                </h3>

                {/* Detail Snippet */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">고객 증상: </span>
                      <span className="line-clamp-2">{item.symptom}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">해결 결과: </span>
                      <span className="line-clamp-2">{item.solution}</span>
                    </div>
                  </div>
                </div>

                {/* Equipment Badge */}
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Wrench className="w-3 h-3 text-[#00b4d8] shrink-0" />
                  <span className="truncate">사용장비: {item.equipment}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.date}
                </span>
                <span className="text-[#0077b6] group-hover:underline flex items-center gap-1 font-bold">
                  전체 내용 보기 &gt;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Naver Blog Callout Banner (Client Requirement 10) */}
        <div className="mt-12 bg-gradient-to-r from-emerald-900 to-[#071739] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-[#03c75a] text-white text-[11px] font-black px-2 py-0.5 rounded">
                NAVER BLOG
              </span>
              <span className="text-sm font-bold text-emerald-300">준픽스 공식 네이버 블로그</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black">
              매일 업데이트되는 생생한 현장 작업 일지를 네이버 블로그에서 확인하세요!
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              배관 내시경 영상, 고압세척 실시간 동영상, 배관 관리 꿀팁을 지속적으로 연재하고 있습니다.
            </p>
          </div>
          <a
            href="https://blog.naver.com/junfix_official"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#03c75a] hover:bg-[#02b350] text-white font-black text-sm shadow-md transition"
          >
            <span>네이버 블로그 바로가기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Case Study Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-[#071739] text-white p-6 relative">
              <button
                onClick={() => setSelectedCase(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#00b4d8]">
                <span>{selectedCase.serviceCategory}</span>
                <span>•</span>
                <span>{selectedCase.region}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">{selectedCase.title}</h3>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500" /> 고객 증상
                </h4>
                <p className="p-3 bg-red-50 text-slate-800 rounded-xl border border-red-100">
                  {selectedCase.symptom}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-500" /> 문제 원인 분석
                </h4>
                <p className="p-3 bg-amber-50 text-slate-800 rounded-xl border border-amber-100">
                  {selectedCase.cause}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 작업 과정 및 해결 결과
                </h4>
                <p className="p-3 bg-emerald-50 text-slate-800 rounded-xl border border-emerald-100">
                  {selectedCase.solution}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-bold mb-1">투입된 전문 장비</div>
                <div className="text-sm font-semibold text-slate-800">{selectedCase.equipment}</div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
              <a
                href={selectedCase.naverBlogLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-[#03c75a] hover:underline"
              >
                블로그 상세 포스팅 보기 &gt;
              </a>
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
