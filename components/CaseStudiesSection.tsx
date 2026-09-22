'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, ExternalLink, ImageOff, ChevronRight } from 'lucide-react';
import type { CaseStudy, ServiceItem } from '@/lib/types';
import BeforeAfterSlider from './BeforeAfterSlider';
import CaseDetailModal from './CaseDetailModal';
import { featuredCase } from '@/lib/cases';
import { useSiteSettings } from '@/components/SiteSettingsProvider';

interface Props {
  cases: CaseStudy[];
  services: ServiceItem[];
}

const PAGE_SIZE = 6;

export default function CaseStudiesSection({ cases, services }: Props) {
  const s = useSiteSettings();
  const [filter, setFilter] = useState('전체');
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // 필터 목록: 실제 등록된 사례의 카테고리만 (서비스 순서 기준으로 정렬)
  const categories = useMemo(() => {
    const present = new Set(cases.map((c) => c.serviceCategory).filter(Boolean));
    const ordered = services.map((sv) => sv.title).filter((t) => present.has(t));
    const extras = [...present].filter((c) => !ordered.includes(c));
    return ['전체', ...ordered, ...extras];
  }, [cases, services]);

  const filtered = filter === '전체' ? cases : cases.filter((c) => c.serviceCategory === filter);
  const visible = filtered.slice(0, limit);
  const featured = featuredCase(cases);

  return (
    <section id="cases" className="py-14 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="text-[#0077b6] text-xs sm:text-sm font-bold">시공사례</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">실제 현장 작업 기록</h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            현장에서 직접 촬영한 작업 전·후 사진과 작업 내용입니다. 비슷한 증상이 있으시면 참고해 주세요.
          </p>
        </div>

        {featured && (
          <div className="max-w-4xl mx-auto mb-10 sm:mb-14 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200">
            <BeforeAfterSlider
              beforeImage={featured.beforeImageUrl}
              afterImage={featured.afterImageUrl}
              title={featured.title}
              subtitle={[featured.serviceCategory, featured.region].filter(Boolean).join(' · ')}
            />
            <div className="mt-3 text-right">
              <button onClick={() => setSelected(featured)} className="text-sm font-bold text-[#0077b6] hover:underline inline-flex items-center gap-0.5">
                이 사례 자세히 보기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="max-w-xl mx-auto text-center p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200">
            <ImageOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">현장 사례를 준비 중입니다</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              작업한 현장의 사진과 내용을 차례로 올리고 있습니다.
              {s.naverBlogUrl && ' 네이버 블로그에서 작업 기록을 먼저 보실 수 있습니다.'}
            </p>
            {s.naverBlogUrl && (
              <a
                href={s.naverBlogUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="blog_click"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#03c75a] hover:bg-[#02b350] text-white font-bold text-sm transition"
              >
                네이버 블로그 보기 <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilter(cat);
                      setLimit(PAGE_SIZE);
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                      filter === cat ? 'bg-[#071739] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visible.map((item) => {
                const hasPair = item.beforeImageUrl && item.afterImageUrl;
                const single = item.afterImageUrl || item.beforeImageUrl || item.processImages[0];
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-[#00b4d8] overflow-hidden transition flex flex-col"
                  >
                    {hasPair ? (
                      <div className="grid grid-cols-2 gap-0.5 bg-slate-200">
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image src={item.beforeImageUrl} alt={`${item.title} 작업 전`} fill className="object-cover" sizes="200px" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">작업 전</span>
                        </div>
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image src={item.afterImageUrl} alt={`${item.title} 작업 후`} fill className="object-cover" sizes="200px" />
                          <span className="absolute top-2 left-2 bg-[#0077b6]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">작업 후</span>
                        </div>
                      </div>
                    ) : single ? (
                      <div className="relative aspect-[16/9] bg-slate-100">
                        <Image src={single} alt={item.title} fill className="object-cover" sizes="400px" />
                      </div>
                    ) : null}

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#00b4d8]/10 text-[#0077b6] font-bold">{item.serviceCategory}</span>
                        {item.region && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5" /> {item.region}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0077b6] transition line-clamp-2">{item.title}</h3>
                      {item.symptom && (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                          <span className="font-bold text-slate-800">증상 </span>
                          {item.symptom}
                        </p>
                      )}
                      <div className="mt-auto pt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                        <span className="text-[#0077b6] font-bold flex items-center gap-0.5">
                          자세히 보기 <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length > visible.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition"
                >
                  사례 더 보기 ({filtered.length - visible.length}건)
                </button>
              </div>
            )}
          </>
        )}

        {s.naverBlogUrl && cases.length > 0 && (
          <div className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="bg-[#03c75a] text-white text-[11px] font-black px-2 py-0.5 rounded">NAVER</span>
                <span className="text-sm font-bold text-slate-800">네이버 블로그</span>
              </div>
              <p className="text-sm text-slate-600">더 많은 현장 작업 기록과 배관 관리 정보는 블로그에 올리고 있습니다.</p>
            </div>
            <a
              href={s.naverBlogUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="blog_click"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#03c75a] hover:bg-[#02b350] text-white font-bold text-sm transition"
            >
              블로그 바로가기 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {selected && <CaseDetailModal caseStudy={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
