'use client';

import React, { useState } from 'react';
import { Phone, Send, CheckCircle2, Clock, AlertCircle, MessageSquare, MessageCircle } from 'lucide-react';
import type { ServiceItem } from '@/lib/types';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { smsHref, telHref } from '@/lib/contact';
import { trackConversion } from '@/components/ConversionTracker';
import SectionHeader from './SectionHeader';

interface Props {
  services: ServiceItem[];
}

const EMPTY = {
  customerName: '',
  phoneNumber: '',
  region: '',
  serviceType: '',
  description: '',
  preferredTime: '',
};

const inputClass =
  'w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand text-base sm:text-sm text-ink bg-white';

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-bold text-navy mb-1.5">{children}</span>;
}

export default function InquirySection({ services }: Props) {
  const s = useSiteSettings();
  const serviceNames = [...services.map((sv) => sv.title), '기타 문의'];
  const [form, setForm] = useState({ ...EMPTY, serviceType: serviceNames[0] ?? '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof EMPTY, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phoneNumber.trim()) {
      setError('연락처를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        trackConversion('inquiry_submit', form.serviceType);
      } else {
        setError(data?.error || '접수 중 오류가 발생했습니다. 전화로 문의해 주세요.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 전화로 문의해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section bg-sky-50 border-t border-slate-200">
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionHeader label="상담 및 문의" title="편한 방법으로 문의해 주세요" desc="증상과 지역을 알려주시면 예상 비용과 방문 시간을 안내합니다. 급한 경우 전화가 가장 빠릅니다." />

            <div className="bg-navy text-white p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-light">
                <Clock className="w-4 h-4" /> {s.businessHours}
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">{s.phoneNumber}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <a href={telHref(s.phoneNumber)} data-track="call_click" className="btn-brand py-3 text-sm">
                  <Phone className="w-4 h-4" /> 전화하기
                </a>
                <a href={smsHref(s.phoneNumber, `안녕하세요, ${s.siteName} 상담 문의드립니다. (지역/증상: )`)} data-track="sms_click" className="btn bg-white/10 hover:bg-white/20 text-white py-3 text-sm">
                  <MessageSquare className="w-4 h-4" /> 문자 문의
                </a>
                {s.kakaoTalkUrl && (
                  <a href={s.kakaoTalkUrl} target="_blank" rel="noopener noreferrer" data-track="kakao_click" className="btn-kakao py-3 text-sm">
                    <MessageCircle className="w-4 h-4" /> 카카오톡
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="card sm:p-6">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="card-title">상담 신청이 접수되었습니다</h3>
                  <p className="card-desc max-w-md mx-auto">남겨주신 연락처로 확인 후 연락드리겠습니다. 급하시면 {s.phoneNumber}로 바로 전화 주세요.</p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ ...EMPTY, serviceType: serviceNames[0] ?? '' });
                    }}
                    className="btn-ghost px-5 py-2.5 text-xs"
                  >
                    다시 작성하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="card-title">상담 신청</h3>
                    <p className="card-desc mt-0.5">연락처만 남기셔도 됩니다. 확인 후 연락드립니다.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <Label>
                        연락처 <span className="text-red-500">*</span>
                      </Label>
                      <input type="tel" required inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} className={inputClass} />
                    </label>
                    <label className="block">
                      <Label>성함</Label>
                      <input type="text" autoComplete="name" placeholder="선택 입력" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} className={inputClass} />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <Label>방문 지역</Label>
                      <input type="text" placeholder="예: 수원시 영통구" value={form.region} onChange={(e) => update('region', e.target.value)} className={inputClass} />
                    </label>
                    <label className="block">
                      <Label>필요한 서비스</Label>
                      <select value={form.serviceType} onChange={(e) => update('serviceType', e.target.value)} className={inputClass}>
                        {serviceNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <Label>증상 설명</Label>
                    <textarea rows={3} placeholder="예: 싱크대 물이 내려가지 않고 바닥으로 조금씩 역류합니다." value={form.description} onChange={(e) => update('description', e.target.value)} className={`${inputClass} resize-none`} />
                  </label>

                  <label className="block">
                    <Label>희망 방문 시간</Label>
                    <input type="text" placeholder="예: 오늘 오후 / 내일 오전" value={form.preferredTime} onChange={(e) => update('preferredTime', e.target.value)} className={inputClass} />
                  </label>

                  <button type="submit" disabled={loading} className="btn-brand w-full py-3.5 text-base">
                    {loading ? (
                      '접수 중...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> 상담 신청하기
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">입력하신 정보는 상담 안내 목적으로만 사용됩니다.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
