'use client';

import React from 'react';
import Image from 'next/image';
import { AlertCircle, HelpCircle, Eye, Cog, Wrench, CheckCircle2, Phone, ChevronRight } from 'lucide-react';
import type { CaseStudy, ServiceItem } from '@/lib/types';
import ModalShell from '@/components/ModalShell';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  service: ServiceItem;
  relatedCases: CaseStudy[];
  onClose: () => void;
  onConsult: (serviceTitle: string) => void;
  onOpenCase: (c: CaseStudy) => void;
}

function Step({ n, icon: Icon, title, children }: { n: number; icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-black shrink-0">
          {n}
        </span>
        <Icon className="w-5 h-5 text-brand shrink-0" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ServiceDetailModal({ service, relatedCases, onClose, onConsult, onOpenCase }: Props) {
  const s = useSiteSettings();

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={service.title}
      header={
        <>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 text-xs font-bold mb-2">
            서비스 안내
          </span>
          <h2 className="text-xl sm:text-3xl font-black pr-10">{service.title}</h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1">{service.subtitle}</p>
        </>
      }
      footer={
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">증상을 말씀해 주시면 예상 비용을 안내해 드립니다.</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onConsult(service.title);
              }}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition"
            >
              상담 신청
            </button>
            <a
              href={telHref(s.phoneNumber)}
              data-track="call_click"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm transition"
            >
              <Phone className="w-4 h-4" /> 전화 상담
            </a>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {service.imageUrl && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <Image src={service.imageUrl} alt={service.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" />
          </div>
        )}

        {service.symptoms.length > 0 && (
          <Step n={1} icon={AlertCircle} title="이런 증상이 있으신가요?">
            <ul className="grid grid-cols-1 gap-2">
              {service.symptoms.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50/60 border border-red-100 text-sm text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {service.causes.length > 0 && (
          <Step n={2} icon={HelpCircle} title="발생 가능한 원인">
            <ul className="grid grid-cols-1 gap-2">
              {service.causes.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-sm text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {service.inspectionMethod && (
          <Step n={3} icon={Eye} title="현장 점검">
            <p className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-sm text-slate-800 leading-relaxed">
              {service.inspectionMethod}
            </p>
          </Step>
        )}

        {service.workProcess.length > 0 && (
          <Step n={4} icon={Cog} title="작업 방법">
            <ol className="space-y-2">
              {service.workProcess.map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ol>
          </Step>
        )}

        {service.equipment.length > 0 && (
          <Step n={5} icon={Wrench} title="사용 장비">
            <div className="flex flex-wrap gap-2">
              {service.equipment.map((item, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm font-semibold border border-brand/30">
                  {item}
                </span>
              ))}
            </div>
          </Step>
        )}

        <Step n={6} icon={CheckCircle2} title="실제 시공사례">
          {relatedCases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedCases.slice(0, 3).map((c) => {
                const thumb = c.afterImageUrl || c.beforeImageUrl || c.processImages[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => onOpenCase(c)}
                    className="text-left rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-brand transition"
                  >
                    {thumb && (
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <Image src={thumb} alt={c.title} fill className="object-cover" sizes="240px" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-[11px] text-slate-500">{c.region}</div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-2">{c.title}</div>
                      <div className="mt-1 text-xs text-brand font-semibold flex items-center gap-0.5">
                        자세히 보기 <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              이 서비스의 현장 사례는 준비 중입니다.
              {s.naverBlogUrl && (
                <>
                  {' '}
                  <a href={s.naverBlogUrl} target="_blank" rel="noopener noreferrer" data-track="blog_click" className="text-[#03c75a] font-bold hover:underline">
                    네이버 블로그
                  </a>
                  에서 작업 기록을 보실 수 있습니다.
                </>
              )}
            </p>
          )}
        </Step>
      </div>
    </ModalShell>
  );
}
