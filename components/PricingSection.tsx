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

/** 가격 카드: 서비스 카드와 같은 격자·여백 규칙. 항목명 → 한 줄 설명 → 가격 슬롯(우측 하단 고정). */
function PriceCard({ item }: { item: PricingItem }) {
  const isQuote = item.category === 'quote';
  return (
    <li className="card h-full flex flex-col">
      <h3 className="card-title line-clamp-1">{item.serviceName}</h3>
      <p className="card-desc mt-1 line-clamp-1 min-h-[1.5em]">{item.description || ' '}</p>
      {item.notice && <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{item.notice}</p>}
      <div className="mt-auto pt-3">
        {isQuote ? <span className="price-quote">{item.priceDisplay || '현장 견적'}</span> : <span className="price">{item.priceDisplay}</span>}
      </div>
    </li>
  );
}

function Group({ title, hint, items }: { title: string; hint: string; items: PricingItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[15px] sm:text-base font-bold text-navy flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand" /> {title}
        </h3>
        <span className="text-[12px] text-muted">{hint}</span>
      </div>
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {items.map((item) => (
          <PriceCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
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
        <SectionHeader label="작업비용 안내" title="작업 가격 안내" desc="일반적인 작업 기준의 시작 가격입니다. 현장 확인 후 정확한 비용을 안내하고, 동의하신 뒤 작업합니다." />

        <div className="space-y-8">
          <Group title="기본 작업 비용" hint="단위: 원 (VAT 별도)" items={fixed} />
          <Group title="현장 견적 서비스" hint="현장 상황에 따라 비용이 달라지는 작업" items={quote} />
        </div>

        <div className="mt-6 card bg-white/70 text-[12px] sm:text-[13px] text-muted space-y-1">
          <p>※ 위 금액은 일반적인 작업 기준의 기본 비용입니다.</p>
          <p>※ 막힘 정도, 배관 구조, 작업 난이도 및 장비 사용 여부에 따라 비용이 달라질 수 있습니다.</p>
          <p>※ 고압세척 · 배관 교체 · 누수탐지는 현장 상황에 따라 별도 견적이 적용될 수 있습니다.</p>
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
