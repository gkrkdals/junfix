'use client';

import React from 'react';
import Image from 'next/image';
import { Truck, FileCheck, Search, ClipboardCheck } from 'lucide-react';
import type { SitePhoto } from '@/lib/types';
import SectionHeader from './SectionHeader';
import { useSiteSettings } from '@/components/SiteSettingsProvider';

interface Props {
  photos: SitePhoto[];
}

const STRENGTHS = [
  { icon: Truck, title: '직접 출동', desc: '중개 없이 준픽스 기사가 직접 방문합니다.' },
  { icon: FileCheck, title: '작업 전 비용 안내', desc: '원인과 비용을 설명하고 동의 후 작업합니다.' },
  { icon: Search, title: '장비로 원인 확인', desc: '내시경·고압세척기·누수탐지기로 확인합니다.' },
  { icon: ClipboardCheck, title: '정리와 사후 안내', desc: '작업 부위를 정리하고 결과를 확인해 드립니다.' },
];

export default function AboutSection({ photos }: Props) {
  const s = useSiteSettings();

  return (
    <section id="about" className="section bg-sky-50 border-y border-slate-200">
      <div className="container-x">
        <SectionHeader label="준픽스 소개" title="현장에 직접 출동하는 설비업체" desc={`${s.siteName}는 하수구·배관·누수 작업을 현장에서 직접 합니다.`} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {STRENGTHS.map((item) => (
            <div key={item.title} className="card h-full">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-brand flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc mt-1 line-clamp-2">{item.desc}</p>
            </div>
          ))}
        </div>

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
    </section>
  );
}
