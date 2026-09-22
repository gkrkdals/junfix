'use client';

import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { splitLines, telHref } from '@/lib/contact';

export default function ServiceAreaSection() {
  const s = useSiteSettings();
  const areas = splitLines(s.serviceAreaList);

  return (
    <section id="areas" className="section bg-white">
      <div className="container-x">
        <SectionHeader
          label="서비스 가능지역"
          title="직접 출동하는 지역"
          desc="목록에 없는 지역도 거리와 일정에 따라 방문할 수 있으니 전화로 문의해 주세요."
          action={
            <a href={telHref(s.phoneNumber)} data-track="call_click" className="btn-ghost px-4 py-2.5 text-sm">
              <Phone className="w-4 h-4" /> 지역 확인 전화
            </a>
          }
        />
        {areas.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {areas.map((area) => (
              <div key={area} className="chip justify-center py-3">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <span className="truncate">{area}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="card-desc">출동 가능 지역은 전화로 확인해 주세요.</p>
        )}
      </div>
    </section>
  );
}
