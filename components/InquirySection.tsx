'use client';

import React, { useState } from 'react';
import { Phone, Send, CheckCircle2, Clock, AlertCircle, MessageSquare, MessageCircle } from 'lucide-react';
import type { ServiceItem } from '@/lib/types';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { smsHref, telHref } from '@/lib/contact';
import { trackConversion } from '@/components/ConversionTracker';

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

  const inputClass =
    'w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-base sm:text-sm text-slate-800 bg-white';

  return (
    <section id="contact" className="py-14 sm:py-20 bg-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[#0077b6] text-xs sm:text-sm font-bold">상담 및 문의</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              전화, 문자, 카카오톡
              <br />
              편한 방법으로 문의해 주세요
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              증상과 지역을 알려주시면 예상 비용과 방문 가능 시간을 안내해 드립니다. 급한 경우 전화가 가장 빠릅니다.
            </p>

            <div className="bg-[#071739] text-white p-5 sm:p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00b4d8]">
                <Clock className="w-4 h-4" /> {s.businessHours}
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">{s.phoneNumber}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <a
                  href={telHref(s.phoneNumber)}
                  data-track="call_click"
                  className="py-3 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#071739] font-extrabold text-sm flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-4 h-4" /> 전화하기
                </a>
                <a
                  href={smsHref(s.phoneNumber, `안녕하세요, ${s.siteName} 상담 문의드립니다. (지역/증상: )`)}
                  data-track="sms_click"
                  className="py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-4 h-4" /> 문자 문의
                </a>
                {s.kakaoTalkUrl && (
                  <a
                    href={s.kakaoTalkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="kakao_click"
                    className="py-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-bold text-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" /> 카카오톡
                  </a>
                )}
              </div>
            </div>

          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">상담 신청이 접수되었습니다</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    남겨주신 연락처로 확인 후 연락드리겠습니다. 급하시면 {s.phoneNumber}로 바로 전화 주세요.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ ...EMPTY, serviceType: serviceNames[0] ?? '' });
                    }}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
                  >
                    다시 작성하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900">상담 신청</h3>
                    <p className="text-xs text-slate-500 mt-1">연락처만 남기셔도 됩니다. 확인 후 연락드립니다.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1.5">
                        연락처 <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="tel"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="010-0000-0000"
                        value={form.phoneNumber}
                        onChange={(e) => update('phoneNumber', e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1.5">성함</span>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="선택 입력"
                        value={form.customerName}
                        onChange={(e) => update('customerName', e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1.5">방문 지역</span>
                      <input
                        type="text"
                        placeholder="예: 수원시 영통구"
                        value={form.region}
                        onChange={(e) => update('region', e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1.5">필요한 서비스</span>
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
                    <span className="block text-xs font-bold text-slate-700 mb-1.5">증상 설명</span>
                    <textarea
                      rows={3}
                      placeholder="예: 싱크대 물이 내려가지 않고 바닥으로 조금씩 역류합니다."
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-bold text-slate-700 mb-1.5">희망 방문 시간</span>
                    <input
                      type="text"
                      placeholder="예: 오늘 오후 / 내일 오전"
                      value={form.preferredTime}
                      onChange={(e) => update('preferredTime', e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-[#0077b6] hover:bg-[#0096c7] disabled:opacity-60 text-white font-extrabold text-base flex items-center justify-center gap-2 transition"
                  >
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
