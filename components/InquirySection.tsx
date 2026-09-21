'use client';

import React, { useState } from 'react';
import { Phone, Send, CheckCircle2, Clock, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  defaultService?: string;
}

export default function InquirySection({ defaultService = '하수구 막힘' }: Props) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    region: '',
    serviceType: defaultService,
    description: '',
    preferredTime: '최대한 빠른 방문 희망',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const servicesList = [
    '하수구 막힘',
    '싱크대 막힘',
    '변기 막힘',
    '변기 탈거 / 교체',
    '배관 고압세척',
    '배관 스케일링',
    '누수탐지 및 공사',
    '수전 및 세면대 교체',
    '에어컨 설치 및 냉매충전',
    '기타 종합 설비',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber) {
      setError('연락처를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        // 전환 추적 이벤트 발생
        if (typeof window !== 'undefined') {
          if ((window as any).gtag) {
            (window as any).gtag('event', 'generate_lead', {
              event_category: 'Inquiry',
              event_label: formData.serviceType,
            });
          }
          if ((window as any).wcs) {
            (window as any).wcs.event('inquiry_submit', formData.serviceType);
          }
        }
      } else {
        setError('접수 중 오류가 발생했습니다. 전화로 문의해 주세요.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-gradient-to-b from-slate-100 to-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Quick Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#00b4d8]/15 text-[#0077b6] text-xs sm:text-sm font-black">
              QUICK CONSULTATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              막힘·누수 고민, <br />
              <span className="text-[#0077b6]">준픽스 직영 엔지니어</span>가 <br />
              친절하게 진단해 드립니다.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              복잡한 절차 없이 연락처와 주소지만 남겨주시면 담당 기사가 5분 내로 직접 전화드려
              예상 비용과 도착 시간을 안내해 드립니다.
            </p>

            {/* Direct Phone Card */}
            <div className="bg-[#071739] text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00b4d8]">
                <Clock className="w-4 h-4" /> 24시간 긴급출동 상황실
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">
                010-2703-1491
              </div>
              <p className="text-xs text-slate-300">
                급한 누수나 역류로 당장 출동이 필요하신 경우 전화 주시면 가장 빠르게 연결됩니다.
              </p>
              <a
                href="tel:010-2703-1491"
                data-track="call-click"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition"
              >
                <Phone className="w-4 h-4 fill-white" />
                지금 바로 전화 연결
              </a>
            </div>

            {/* Service Area Info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-[#00b4d8]" /> 경기·수도권 전지역 출장 가능
              </div>
              <p>
                서울 전지역, 수원, 용인, 성남, 부천, 안양, 안산, 고양, 인천, 하남 등 수도권 전역에 전문 출동 차량이 상시대기 중입니다.
              </p>
            </div>
          </div>

          {/* Right Column: Fast Application Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    상담 접수가 성공적으로 완료되었습니다!
                  </h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    남겨주신 연락처로 담당 엔지니어가 신속하게 확인 후 5~10분 내로 연락드리겠습니다.
                    긴급 상황이시라면 대표전화(010-2703-1491)로 바로 연락 주시기 바랍니다.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        customerName: '',
                        phoneNumber: '',
                        region: '',
                        serviceType: defaultService,
                        description: '',
                        preferredTime: '최대한 빠른 방문 희망',
                      });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
                  >
                    추가 접수하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-xl font-black text-slate-900">간편 견적 & 출동 신청</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      최소한의 정보만 입력하시면 친절히 견적을 안내해 드립니다.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        고객 성함
                      </label>
                      <input
                        type="text"
                        placeholder="예: 홍길동"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        연락처 (필수) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="예: 010-1234-5678"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        방문 희망 지역 (시/구/동)
                      </label>
                      <input
                        type="text"
                        placeholder="예: 수원시 영통구 매탄동"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        필요한 서비스 선택
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm text-slate-800 bg-white"
                      >
                        {servicesList.map((svc) => (
                          <option key={svc} value={svc}>
                            {svc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      불편 증상 간략 설명
                    </label>
                    <textarea
                      rows={3}
                      placeholder="예: 싱크대 물이 내려가지 않고 바닥으로 조금씩 역류합니다."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm text-slate-800 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      희망 상담 / 출동 시간
                    </label>
                    <input
                      type="text"
                      placeholder="예: 오늘 즉시 출동 희망 / 오늘 오후 3시 이후"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-track="inquiry-submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:brightness-110 text-white font-extrabold text-base shadow-lg transition flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <span>접수 처리 중...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>간편 견적 & 출동 신청하기</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00b4d8]" />
                    입력하신 정보는 오직 상담 및 출동 안내 목적으로만 안전하게 사용됩니다.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
