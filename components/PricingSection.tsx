'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import type { PricingItem } from '@/lib/types';
import SectionHeader from './SectionHeader';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  pricing: PricingItem[];
}

function Row({ item }: { item: PricingItem }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-5 min-h-[64px] py-3">
      <div className="min-w-0">
        <div className="card-title">{item.serviceName}</div>
        {item.description && <div className="card-desc line-clamp-1">{item.description}</div>}
        {item.notice && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.notice}</div>}
      </div>
      {item.category === 'fixed' ? <span className="price">{item.priceDisplay}</span> : <span className="price-quote">{item.priceDisplay || '현장 견적'}</span>}
    </li>
  );
}

export default function PricingSection({ pricing }: Props) {
  const s = useSiteSettings();
  const fixed = pricing.filter((p) => p.category === 'fixed');
  const quote = pricing.filter((p) => p.category === 'quote');
  if (pricing.length === 0) return null;

  return (
    <section id="pricing" className="section bg-sky-50 border-y border-slate-200">
      <div className="container-x">
        <SectionHeader label="작업비용 안내" title="기본 작업 비용" desc="일반적인 작업 기준의 시작 가격입니다. 현장 확인 후 정확한 비용을 안내하고, 동의하신 뒤 작업합니다." />

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {fixed.length > 0 && (
            <>
              <div className="px-4 sm:px-5 py-2.5 bg-navy text-white text-[13px] font-bold flex items-center justify-between">
                <span>기본 작업 비용</span>
                <span className="text-slate-300 font-medium">단위: 원 (VAT 별도)</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {fixed.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </>
          )}
          {quote.length > 0 && (
            <>
              <div className="px-4 sm:px-5 py-2.5 bg-navy text-white text-[13px] font-bold flex items-center justify-between border-t border-slate-200">
                <span>현장 견적 서비스</span>
                <span className="text-slate-300 font-medium">현장 상황에 따라 비용이 달라지는 작업</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {quote.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </>
          )}
          <div className="px-4 sm:px-5 py-4 bg-slate-50 border-t border-slate-200 text-[12px] sm:text-[13px] text-muted space-y-1">
            <p>※ 위 금액은 일반적인 작업 기준의 기본 비용입니다.</p>
            <p>※ 막힘 정도, 배관 구조, 작업 난이도 및 장비 사용 여부에 따라 비용이 달라질 수 있습니다.</p>
            <p>※ 고압세척 · 배관 교체 · 누수탐지는 현장 상황에 따라 별도 견적이 적용될 수 있습니다.</p>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <a href={telHref(s.phoneNumber)} data-track="call_click" className="btn-primary px-6 py-3.5 text-base w-full sm:w-auto">
            <Phone className="w-5 h-5" /> 전화로 비용 문의 {s.phoneNumber}
          </a>
        </div>
      </div>
    </section>
  );
}
