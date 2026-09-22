'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, ExternalLink, ImageOff, ChevronRight } from 'lucide-react';
import type { CaseStudy, ServiceItem, SitePhoto } from '@/lib/types';
import BeforeAfterSlider from './BeforeAfterSlider';
import CaseDetailModal from './CaseDetailModal';
import SectionHeader from './SectionHeader';
import { featuredCase } from '@/lib/cases';
import { useSiteSettings } from '@/components/SiteSettingsProvider';

interface Props {
  cases: CaseStudy[];
  services: ServiceItem[];
  photos?: SitePhoto[];
}

const PAGE_SIZE = 6;

export default function CaseStudiesSection({ cases, services, photos = [] }: Props) {
  const s = useSiteSettings();
  const [filter, setFilter] = useState('전체');
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const present = new Set(cases.map((c) => c.serviceCategory).filter(Boolean));
    const ordered = services.map((sv) => sv.title).filter((t) => present.has(t));
    const extras = [...present].filter((c) => !ordered.includes(c));
    return ['전체', ...ordered, ...extras];
  }, [cases, services]);

  const filtered = filter === '전체' ? cases : cases.filter((c) => c.serviceCategory === filter);
  const visible = filtered.slice(0, limit);
  const featured = featuredCase(cases);

  const blogButton = s.naverBlogUrl && (
    <a href={s.naverBlogUrl} target="_blank" rel="noopener noreferrer" data-track="blog_click" className="btn bg-[#03c75a] hover:bg-[#02b350] text-white px-4 py-2.5 text-sm">
      네이버 블로그 <ExternalLink className="w-4 h-4" />
    </a>
  );

  return (
    <section id="cases" className="section bg-white">
      <div className="container-x">
        <SectionHeader label="시공사례" title="실제 작업 사례" desc="현장에서 직접 찍은 작업 전·후 사진과 작업 내용입니다." action={blogButton || undefined} />

        {featured && (
          <div className="mb-6 sm:mb-8 card">
            <BeforeAfterSlider
              beforeImage={featured.beforeImageUrl}
              afterImage={featured.afterImageUrl}
              title={featured.title}
              subtitle={[featured.serviceCategory, featured.region].filter(Boolean).join(' · ')}
            />
            <div className="mt-2 text-right">
              <button onClick={() => setSelected(featured)} className="text-[13px] font-bold text-brand inline-flex items-center gap-0.5">
                이 사례 자세히 보기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="card text-center py-10 bg-slate-50">
            <ImageOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="card-title">현장 사례를 준비 중입니다</h3>
            <p className="card-desc mt-1">작업한 현장의 사진과 내용을 차례로 올리고 있습니다.</p>
          </div>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilter(cat);
                      setLimit(PAGE_SIZE);
                    }}
                    className={`px-3.5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition ${filter === cat ? 'bg-navy text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {visible.map((item) => {
                const hasPair = item.beforeImageUrl && item.afterImageUrl;
                const single = item.afterImageUrl || item.beforeImageUrl || item.processImages[0];
                return (
                  <button key={item.id} onClick={() => setSelected(item)} className="card p-0 overflow-hidden text-left h-full flex flex-col hover:border-brand hover:shadow-md transition group">
                    {hasPair ? (
                      <div className="grid grid-cols-2 gap-px bg-slate-200">
                        <div className="relative aspect-square bg-slate-100">
                          <Image src={item.beforeImageUrl} alt={`${item.title} 작업 전`} fill className="object-cover" sizes="200px" />
                          <span className="absolute top-2 left-2 bg-navy/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">전</span>
                        </div>
                        <div className="relative aspect-square bg-slate-100">
                          <Image src={item.afterImageUrl} alt={`${item.title} 작업 후`} fill className="object-cover" sizes="200px" />
                          <span className="absolute top-2 left-2 bg-brand/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">후</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-[2/1] bg-slate-100">
                        {single ? (
                          <Image src={single} alt={item.title} fill className="object-cover" sizes="400px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <ImageOff className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <span className="self-start text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-brand mb-1.5">{item.serviceCategory}</span>
                      <h3 className="card-title line-clamp-2 min-h-[2.6em] group-hover:text-brand transition">{item.title}</h3>
                      <div className="mt-auto pt-2 flex items-center gap-2 text-[12px] text-muted">
                        {item.region && (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" /> {item.region}
                          </span>
                        )}
                        {item.date && (
                          <span className="flex items-center gap-0.5 shrink-0">
                            <Calendar className="w-3 h-3" /> {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length > visible.length && (
              <div className="mt-6 text-center">
                <button onClick={() => setLimit(limit + PAGE_SIZE)} className="btn-ghost px-6 py-3 text-sm">
                  사례 더 보기 ({filtered.length - visible.length}건)
                </button>
              </div>
            )}
          </>
        )}

        {photos.length > 0 && (
          <div className="mt-8">
            <h3 className="card-title mb-3">작업차량 · 장비 · 현장</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
              {photos.map((photo) => (
                <figure key={photo.id} className="shrink-0 w-56 sm:w-64 snap-start">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
                    <Image src={photo.url} alt={photo.caption || '준픽스 현장 사진'} fill className="object-cover" sizes="256px" />
                  </div>
                  {photo.caption && <figcaption className="mt-1.5 text-[12px] text-muted px-1 line-clamp-1">{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <CaseDetailModal caseStudy={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
