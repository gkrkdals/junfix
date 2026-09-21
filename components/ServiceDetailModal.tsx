'use client';

import React from 'react';
import { ServiceItem } from '@/lib/types';
import { X, AlertCircle, HelpCircle, Eye, Cog, Wrench, CheckCircle2, Phone, MessageSquare, ArrowRight } from 'lucide-react';

interface Props {
  service: ServiceItem | null;
  onClose: () => void;
  onConsult: (serviceTitle: string) => void;
}

export default function ServiceDetailModal({ service, onClose, onConsult }: Props) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071739] to-[#0a2558] text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="inline-block px-3 py-1 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 text-[#90e0ef] text-xs font-bold mb-2">
            준픽스 정밀 시공 가이드
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{service.title}</h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1">{service.subtitle}</p>
        </div>

        {/* Modal Body: Client's 7-step comparison flow */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 divide-y divide-slate-100">
          {/* Step 1: 주요 증상 (Symptoms) */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-black">1</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
              이런 증상이 있다면 지금 바로 점검이 필요합니다!
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {service.symptoms.map((symptom, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/50 border border-red-100/80">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: 발생 가능한 원인 (Causes) */}
          <div className="pt-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">2</span>
              <HelpCircle className="w-5 h-5 text-amber-500" />
              왜 이런 문제가 발생했을까요?
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {service.causes.map((cause, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100/80">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{cause}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: 현장점검 방식 (Inspection) */}
          <div className="pt-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">3</span>
              <Eye className="w-5 h-5 text-blue-500" />
              준픽스의 현장 정밀 점검 방식
            </h3>
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-sm text-slate-800 leading-relaxed font-medium">
              {service.inspectionMethod}
            </div>
          </div>

          {/* Step 4: 작업 방법 (Work Process) */}
          <div className="pt-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">4</span>
              <Cog className="w-5 h-5 text-emerald-500" />
              체계적인 단계별 해결 과정
            </h3>
            <div className="space-y-2">
              {service.workProcess.map((proc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{proc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: 사용 첨단 장비 (Equipment) */}
          <div className="pt-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-black">5</span>
              <Wrench className="w-5 h-5 text-cyan-600" />
              현장에 투입되는 전문 첨단 장비
            </h3>
            <div className="flex flex-wrap gap-2">
              {service.equipment.map((eq, idx) => (
                <span key={idx} className="px-3 py-2 rounded-xl bg-[#00b4d8]/10 text-[#0077b6] text-xs sm:text-sm font-bold border border-[#00b4d8]/30">
                  ⚡ {eq}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Direct Call / Apply Consultation */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-center sm:text-left">
            <div className="text-xs text-slate-500">배관·설비는 지체할수록 피해가 커집니다</div>
            <div className="text-base font-bold text-slate-900">현장 직영 기사와 1:1 직접 통화</div>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={() => {
                onClose();
                onConsult(service.title);
              }}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition"
            >
              온라인 견적 문의
            </button>
            <a
              href="tel:010-2703-1491"
              data-track="call-click"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-extrabold text-sm shadow-md hover:brightness-105 transition"
            >
              <Phone className="w-4 h-4 fill-white" />
              전화로 빠른 해결
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
