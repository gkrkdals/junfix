'use client';

import React, { useState } from 'react';
import { Phone, ChevronRight, Info } from 'lucide-react';
import type { PricingItem } from '@/lib/types';
import SectionHeader from './SectionHeader';
import ModalShell from './ModalShell';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  pricing: PricingItem[];
}

function PriceTag({ item }: { item: PricingItem }) {
  return item.category === 'quote' ? <span className="price-quote">{item.priceDisplay || '현장 견적'}</span> : <span className="price">{item.priceDisplay}</span>;
}

/** 가격 카드: 항목명과 가격만. 설명은 카드를 누르면 안내창에서 보여준다. */
function PriceCard({ item, onOpen }: { item: PricingItem; onOpen: (item: PricingItem) => void }) {
  const hasDetail = Boolean(item.description || item.notice);
  return (
    <li className="h-full">
      <button
        type="button"
        onClick={() => hasDetail && onOpen(item)}
        className={`card w-full h-full text-left flex flex-col ${hasDetail ? 'hover:border-brand hover:shadow-md transition group cursor-pointer' : 'cursor-default'}`}
      >
        <h3 className="card-title line-clamp-2 group-hover:text-brand transition">{item.serviceName}</h3>
        <div className="mt-1.5">
          <PriceTag item={item} />
        </div>
        {hasDetail && (
          <span className="mt-auto pt-2 text-[12px] font-semibold text-muted inline-flex items-center gap-0.5">
            안내 보기 <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
    </li>
  );
}

function Group({ title, hint, items, onOpen }: { title: string; hint: string; items: PricingItem[]; onOpen: (item: PricingItem) => void }) {
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
          <PriceCard key={item.id} item={item} onOpen={onOpen} />
        ))}
      </ul>
    </div>
  );
}

export default function PricingSection({ pricing }: Props) {
  const s = useSiteSettings();
  const [selected, setSelected] = useState<PricingItem | null>(null);
  const fixed = pricing.filter((p) => p.category === 'fixed');
  const quote = pricing.filter((p) => p.category === 'quote');
  if (pricing.length === 0) return null;

  return (
    <section id="pricing" className="section bg-sky-50 border-y border-slate-200">
      <div className="container-x">
        <SectionHeader label="작업비용 안내" title="작업 가격 안내" desc="일반적인 작업 기준의 시작 가격입니다. 현장 확인 후 정확한 비용을 안내하고, 동의하신 뒤 작업합니다." />

        <div className="space-y-8">
          <Group title="기본 작업 비용" hint="단위: 원 (VAT 별도)" items={fixed} onOpen={setSelected} />
          <Group title="현장 견적 서비스" hint="현장 상황에 따라 비용이 달라지는 작업" items={quote} onOpen={setSelected} />
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

      {selected && (
        <ModalShell
          onClose={() => setSelected(null)}
          maxWidth="max-w-md"
          ariaLabel={selected.serviceName}
          header={
            <>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 text-xs font-bold mb-2">
                {selected.category === 'quote' ? '현장 견적 서비스' : '기본 작업 비용'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black pr-10">{selected.serviceName}</h2>
              <div className="mt-2">
                {selected.category === 'quote' ? (
                  <span className="price-quote">{selected.priceDisplay || '현장 견적'}</span>
                ) : (
                  <span className="text-2xl font-extrabold text-white">{selected.priceDisplay}</span>
                )}
              </div>
            </>
          }
          footer={
            <a href={telHref(s.phoneNumber)} data-track="call_click" className="btn-brand w-full py-3 text-sm">
              <Phone className="w-4 h-4" /> 전화로 비용 문의
            </a>
          }
        >
          <div className="space-y-3 text-sm text-ink leading-relaxed">
            {selected.description && (
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>{selected.description}</span>
              </p>
            )}
            {selected.notice && <p className="text-[13px] text-muted pl-6">{selected.notice}</p>}
            <p className="text-[12px] text-slate-400 pl-6">
              {selected.category === 'quote' ? '현장 확인 후 작업 범위와 비용을 안내합니다.' : '일반적인 작업 기준의 시작 가격이며, 현장 상황에 따라 달라질 수 있습니다.'}
            </p>
          </div>
        </ModalShell>
      )}
    </section>
  );
}
