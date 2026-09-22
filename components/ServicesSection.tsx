'use client';

import React, { useState } from 'react';
import { Droplets, Wrench, Search, Gauge, Wind, ChevronRight, Bath } from 'lucide-react';
import type { CaseStudy, ServiceItem } from '@/lib/types';
import ServiceDetailModal from './ServiceDetailModal';
import CaseDetailModal from './CaseDetailModal';
import SectionHeader from './SectionHeader';
import { casesForService } from '@/lib/cases';

interface Props {
  services: ServiceItem[];
  caseStudies: CaseStudy[];
}

export function ServiceIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  switch (name) {
    case 'Drain':
      return <Droplets className={className} />;
    case 'Sink':
      return <Bath className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Search':
      return <Search className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    default:
      return <Wrench className={className} />;
  }
}

/** 서비스 카드: 아이콘 → 제목 → 한 줄 설명 → 자세히 보기. 모든 카드가 같은 높이·간격을 갖는다. */
export default function ServicesSection({ services, caseStudies }: Props) {
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const goConsult = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="services" className="section bg-white">
      <div className="container-x">
        <SectionHeader label="서비스 안내" title="어떤 문제든 원인부터 확인합니다" desc="해당하는 서비스를 누르면 증상, 점검 방법, 작업 순서와 실제 사례를 볼 수 있습니다." />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelected(service)}
              className="card text-left h-full flex flex-col hover:border-brand hover:shadow-md transition group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-100 text-brand flex items-center justify-center mb-3">
                <ServiceIcon name={service.iconName} />
              </div>
              <h3 className="card-title min-h-[2.6em] line-clamp-2 group-hover:text-brand transition">{service.title}</h3>
              <p className="card-desc mt-1.5 line-clamp-2 min-h-[2.8em]">{service.subtitle}</p>
              <span className="mt-auto pt-3 text-[13px] font-bold text-brand inline-flex items-center gap-0.5">
                자세히 보기 <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
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
