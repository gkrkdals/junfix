'use client';

import React from 'react';
import Image from 'next/image';
import { Truck, FileCheck, Search, ClipboardCheck, Phone } from 'lucide-react';
import type { SitePhoto } from '@/lib/types';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  photos: SitePhoto[];
}

export default function WhyJunfix({ photos }: Props) {
  const s = useSiteSettings();

  const strengths = [
    {
      icon: Truck,
      title: '직접 출동해서 작업합니다',
      desc: '중개 없이 준픽스 기사가 직접 방문합니다. 상담부터 작업, 사후 안내까지 같은 사람이 맡습니다.',
    },
    {
      icon: FileCheck,
      title: '작업 전 비용을 먼저 안내합니다',
      desc: '현장 확인 후 원인과 예상 비용을 설명드리고, 동의하신 뒤에 작업을 시작합니다.',
    },
    {
      icon: Search,
      title: '장비로 원인을 확인합니다',
      desc: '배관 내시경, 고압세척기, 누수탐지기 등 작업에 맞는 장비로 원인을 확인하고 해결합니다.',
    },
    {
      icon: ClipboardCheck,
      title: '작업 후 정리와 사후 안내',
      desc: '작업 부위를 정리하고 결과를 확인해 드립니다. 같은 부위에 문제가 다시 생기면 연락 주세요.',
    },
  ];

  return (
    <section id="about" className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#0077b6] text-xs sm:text-sm font-bold">준픽스 소개</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
            현장에서 직접 작업하는 설비업체입니다
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            {s.siteName}는 하수구·배관·누수 작업을 현장에서 직접 하고 있습니다.
            작은 불편도 그냥 지나치지 않고 원인부터 확인합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {strengths.map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-[#0077b6]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {photos.length > 0 && (
          <div className="mt-12">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">작업차량 · 장비 · 현장</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">실제 사용하는 차량과 장비, 작업 현장 사진입니다.</p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
              {photos.map((photo) => (
                <figure key={photo.id} className="shrink-0 w-64 sm:w-72 snap-start">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
                    <Image src={photo.url} alt={photo.caption || '준픽스 현장 사진'} fill className="object-cover" sizes="288px" />
                  </div>
                  {photo.caption && (
                    <figcaption className="mt-2 text-xs sm:text-sm text-slate-600 px-1">{photo.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-[#071739] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">작은 불편도 그냥 지나치지 않습니다</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              증상만 말씀해 주시면 예상 원인과 비용을 안내해 드립니다. 방문이 필요하면 일정을 잡아 직접 찾아갑니다.
            </p>
          </div>
          <a
            href={telHref(s.phoneNumber)}
            data-track="call_click"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#071739] font-extrabold transition"
          >
            <Phone className="w-5 h-5" /> {s.phoneNumber}
          </a>
        </div>
      </div>
    </section>
  );
}
