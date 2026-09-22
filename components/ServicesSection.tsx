'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Droplets, Wrench, Search, Gauge, Wind, ChevronRight, Phone, Bath } from 'lucide-react';
import type { CaseStudy, ServiceItem } from '@/lib/types';
import ServiceDetailModal from './ServiceDetailModal';
import CaseDetailModal from './CaseDetailModal';
import { casesForService } from '@/lib/cases';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  services: ServiceItem[];
  caseStudies: CaseStudy[];
}

export function ServiceIcon({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  switch (name) {
    case 'Drain':
      return <Droplets className={`${className} text-[#0096c7]`} />;
    case 'Sink':
      return <Bath className={`${className} text-[#0077b6]`} />;
    case 'Toilet':
      return <Wrench className={`${className} text-indigo-500`} />;
    case 'Gauge':
      return <Gauge className={`${className} text-sky-600`} />;
    case 'Search':
      return <Search className={`${className} text-emerald-600`} />;
    case 'Wind':
      return <Wind className={`${className} text-cyan-600`} />;
    default:
      return <Wrench className={`${className} text-amber-600`} />;
  }
}

export default function ServicesSection({ services, caseStudies }: Props) {
  const s = useSiteSettings();
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const plumbing = services.filter((sv) => sv.category === 'plumbing');
  const aircon = services.filter((sv) => sv.category === 'aircon');

  const goConsult = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#0077b6] text-xs sm:text-sm font-bold">서비스 안내</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">하수구 · 배관 · 누수 서비스</h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            증상에 맞는 서비스를 누르시면 원인, 점검 방법, 작업 순서, 사용 장비와 실제 사례를 확인하실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plumbing.map((service) => {
            const related = casesForService(service, caseStudies).length;
            return (
              <button
                key={service.id}
                onClick={() => setSelected(service)}
                className="group text-left rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#00b4d8] transition-all overflow-hidden flex flex-col"
              >
                {service.imageUrl && (
                  <div className="relative aspect-[16/9] bg-slate-100">
                    <Image src={service.imageUrl} alt={service.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <ServiceIcon name={service.iconName} />
                    </div>
                    {related > 0 && (
                      <span className="text-[11px] font-bold text-[#0077b6] bg-[#00b4d8]/10 px-2 py-1 rounded-full">
                        사례 {related}건
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0077b6] transition">{service.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed line-clamp-2">{service.subtitle}</p>
                  {service.symptoms.length > 0 && (
                    <ul className="mt-4 pt-3 border-t border-slate-200/70 space-y-1.5 text-xs text-slate-700">
                      {service.symptoms.slice(0, 2).map((symptom, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] shrink-0" />
                          <span className="truncate">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto pt-4 text-xs text-[#0077b6] font-bold flex items-center gap-1">
                    자세히 보기 <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 에어컨: 별도 영역 */}
        {aircon.length > 0 && (
          <div id="aircon" className="mt-12 sm:mt-16">
            <div className="rounded-3xl bg-gradient-to-r from-[#071739] to-[#0a2558] text-white p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#90e0ef] text-xs font-bold">
                    <Wind className="w-4 h-4" /> 에어컨 서비스
                  </span>
                  {aircon.map((a) => (
                    <div key={a.id}>
                      <h3 className="text-xl sm:text-3xl font-black">{a.title}</h3>
                      <p className="text-slate-200 text-sm sm:text-base mt-1.5 leading-relaxed max-w-2xl">{a.subtitle}</p>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aircon[0].workProcess.slice(0, 4).map((step, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                  <button
                    onClick={() => setSelected(aircon[0])}
                    className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#071739] font-bold text-sm transition"
                  >
                    에어컨 서비스 안내 보기
                  </button>
                  <a
                    href={telHref(s.phoneNumber)}
                    data-track="call_click"
                    className="w-full py-3.5 px-5 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#071739] font-black text-sm text-center transition flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> 에어컨 상담 {s.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selected && !selectedCase && (
        <ServiceDetailModal
          service={selected}
          relatedCases={casesForService(selected, caseStudies)}
          onClose={() => setSelected(null)}
          onConsult={goConsult}
          onOpenCase={(c) => setSelectedCase(c)}
        />
      )}
      {selectedCase && <CaseDetailModal caseStudy={selectedCase} onClose={() => setSelectedCase(null)} />}
    </section>
  );
}
