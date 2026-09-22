'use client';

import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { splitLines, telHref } from '@/lib/contact';

export default function ServiceAreaSection() {
  const s = useSiteSettings();
  const areas = splitLines(s.serviceAreaList);

  return (
    <section id="areas" className="py-14 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[#0077b6] text-xs sm:text-sm font-bold">서비스 가능지역</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">직접 출동하는 지역</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              아래 지역은 직접 출동합니다. 목록에 없는 지역도 거리와 일정에 따라 방문이 가능하니 전화로 문의해 주세요.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
                <Clock className="w-4 h-4 text-[#0077b6]" /> {s.businessHours}
              </span>
            </div>
            <a
              href={telHref(s.phoneNumber)}
              data-track="call_click"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0077b6] hover:bg-[#0096c7] text-white font-bold text-sm transition"
            >
              <Phone className="w-4 h-4" /> 지역 확인 전화하기
            </a>
          </div>

          <div className="lg:col-span-7">
            {areas.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {areas.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800"
                  >
                    <MapPin className="w-4 h-4 text-[#00b4d8] shrink-0" />
                    <span className="truncate">{area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                출동 가능 지역은 전화로 확인해 주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
