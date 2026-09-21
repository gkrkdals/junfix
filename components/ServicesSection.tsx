'use client';

import React, { useState } from 'react';
import { ServiceItem } from '@/lib/types';
import ServiceDetailModal from './ServiceDetailModal';
import {
  Droplets,
  Wrench,
  Search,
  Gauge,
  RotateCw,
  Sparkles,
  Wind,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Props {
  services: ServiceItem[];
  onConsult?: (serviceTitle: string) => void;
}

export default function ServicesSection({ services, onConsult }: Props) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleConsult = (serviceTitle: string) => {
    if (onConsult) {
      onConsult(serviceTitle);
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const plumbingServices = services.filter((s) => s.category === 'plumbing');
  const airconServices = services.filter((s) => s.category === 'aircon');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Drain':
        return <Droplets className="w-6 h-6 text-[#00b4d8]" />;
      case 'Sink':
        return <Droplets className="w-6 h-6 text-[#0077b6]" />;
      case 'Toilet':
        return <Wrench className="w-6 h-6 text-indigo-500" />;
      case 'Gauge':
        return <Gauge className="w-6 h-6 text-sky-500" />;
      case 'Search':
        return <Search className="w-6 h-6 text-emerald-500" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#00b4d8]" />;
    }
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00b4d8]/10 text-[#0077b6] text-xs sm:text-sm font-bold mb-3">
            <Wrench className="w-4 h-4" /> 전문 설비 엔지니어 100% 직영 시공
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            준픽스 핵심 서비스 안내
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            원인을 알 수 없는 막힘과 누수, 준픽스는 최첨단 내시경과 전문 장비로 원인을 정확히 찾아 근본적으로 해결합니다.
            카드를 클릭하시면 상세 점검 및 시공 방식을 확인하실 수 있습니다.
          </p>
        </div>

        {/* 1. 하수구·배관·누수 메인 서비스 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plumbingServices.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="group cursor-pointer rounded-2xl p-6 bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-[#00b4d8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition">
                    {getIcon(service.iconName)}
                  </div>
                  <span className="text-[11px] font-bold text-[#0077b6] bg-[#00b4d8]/10 px-2.5 py-1 rounded-full group-hover:bg-[#00b4d8] group-hover:text-white transition">
                    상세보기 &gt;
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#0077b6] transition">
                  {service.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {service.subtitle}
                </p>

                {/* Key Checklist Preview */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                  {service.symptoms.slice(0, 2).map((symptom, i) => (
                    <div key={i} className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] shrink-0" />
                      <span className="truncate">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>첨단 장비 완비</span>
                <span className="text-[#0077b6] flex items-center gap-1 font-bold">
                  공법 보기 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. 에어컨 별도 서비스 영역 (클라이언트 요청사항 반영) */}
        <div id="aircon" className="mt-16 sm:mt-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#0077b6] text-white p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 text-[#90e0ef] text-xs font-bold">
                  <Wind className="w-4 h-4" /> 사계절 쾌적한 실내를 위한 전문 케어
                </div>
                <h3 className="text-2xl sm:text-4xl font-black">
                  준픽스 에어컨 설치 · 이전설치 · 냉매충전
                </h3>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl">
                  여름철 시원하지 않은 에어컨, 가스 누설 진단부터 정밀 진공 작업, 디지털 매니폴드 정량 충전까지!
                  벽걸이, 스탠드, 2in1 완벽 시공 및 이전 설치를 신속하게 진행합니다.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs font-bold">냉매 완충</div>
                    <div className="text-[10px] text-slate-300">정량 전자저울 계량</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs font-bold">진공 작업</div>
                    <div className="text-[10px] text-slate-300">배관 수분 100% 제거</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs font-bold">이전 설치</div>
                    <div className="text-[10px] text-slate-300">안전 철거 및 재시공</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs font-bold">물샘·누설 점검</div>
                    <div className="text-[10px] text-slate-300">드레인 호스 완벽 수리</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                {airconServices.length > 0 && (
                  <button
                    onClick={() => setSelectedService(airconServices[0])}
                    className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-[#071739] font-bold text-sm shadow-md transition"
                  >
                    에어컨 점검 프로세스 보기
                  </button>
                )}
                <a
                  href="tel:010-2703-1491"
                  data-track="call-click"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#00b4d8] hover:bg-[#0096c7] text-white font-black text-sm text-center shadow-lg transition"
                >
                  에어컨 즉시 상담 (010-2703-1491)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onConsult={handleConsult}
      />
    </section>
  );
}
