'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Inbox, Briefcase, DollarSign, Star, Settings, LogOut, ExternalLink, Wrench, Images } from 'lucide-react';
import type { AppData } from '@/lib/types';
import InquiriesTab from '@/components/admin/InquiriesTab';
import CasesTab from '@/components/admin/CasesTab';
import PricingTab from '@/components/admin/PricingTab';
import ServicesTab from '@/components/admin/ServicesTab';
import ReviewsTab from '@/components/admin/ReviewsTab';
import PhotosTab from '@/components/admin/PhotosTab';
import SettingsTab from '@/components/admin/SettingsTab';

type Tab = 'inquiries' | 'cases' | 'services' | 'pricing' | 'reviews' | 'photos' | 'settings';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} 조회 실패 (${res.status})`);
  return res.json();
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('inquiries');
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  const reload = useCallback(async () => {
    const [inquiries, caseStudies, services, pricing, reviews, sitePhotos, settings] = await Promise.all([
      getJson<AppData['inquiries']>('/api/inquiries'),
      getJson<AppData['caseStudies']>('/api/cases'),
      getJson<AppData['services']>('/api/services?all=1'),
      getJson<AppData['pricing']>('/api/pricing?all=1'),
      getJson<AppData['reviews']>('/api/reviews?all=1'),
      getJson<AppData['sitePhotos']>('/api/site-photos?all=1'),
      getJson<AppData['settings']>('/api/settings'),
    ]);
    setData({ inquiries, caseStudies, services, pricing, reviews, sitePhotos, settings });
  }, []);

  useEffect(() => {
    fetch('/api/admin/check')
      .then(async (res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        await reload();
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router, reload]);

  // URL 해시로 탭 기억 (#pricing 등)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as Tab;
    if (['inquiries', 'cases', 'services', 'pricing', 'reviews', 'photos', 'settings'].includes(hash)) setTab(hash);
  }, []);
  const selectTab = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, '', `#${t}`);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading || !data) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-600">관리자 데이터를 불러오는 중...</div>;
  }

  const pendingCount = data.inquiries.filter((i) => i.status === '접수완료').length;

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'inquiries', label: '상담 접수', icon: Inbox, badge: pendingCount },
    { key: 'cases', label: '시공사례', icon: Briefcase, badge: data.caseStudies.length },
    { key: 'services', label: '서비스 안내', icon: Wrench },
    { key: 'pricing', label: '작업비용', icon: DollarSign },
    { key: 'reviews', label: '고객후기', icon: Star, badge: data.reviews.length },
    { key: 'photos', label: '사진 관리', icon: Images },
    { key: 'settings', label: '기본 정보', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-[#071739] text-white py-3 px-4 sm:px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg sm:text-xl font-black">
              JUNFI<span className="text-[#00b4d8]">X</span>
            </span>
            <span className="text-[11px] bg-[#00b4d8]/20 text-[#90e0ef] px-2 py-0.5 rounded font-bold">관리자</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" target="_blank" className="text-xs text-slate-300 hover:text-white flex items-center gap-1">
              <span className="hidden sm:inline">홈페이지 보기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button onClick={logout} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> 로그아웃
            </button>
          </div>
        </div>
      </header>

      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg">
          {toastMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 flex-grow">
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-3 px-3 sm:mx-0 sm:px-0 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => selectTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                tab === t.key ? 'bg-[#071739] text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'inquiries' && <InquiriesTab inquiries={data.inquiries} reload={reload} toast={toast} />}
        {tab === 'cases' && <CasesTab cases={data.caseStudies} services={data.services} reload={reload} toast={toast} />}
        {tab === 'services' && <ServicesTab services={data.services} reload={reload} toast={toast} />}
        {tab === 'pricing' && <PricingTab pricing={data.pricing} reload={reload} toast={toast} />}
        {tab === 'reviews' && <ReviewsTab reviews={data.reviews} services={data.services} reload={reload} toast={toast} />}
        {tab === 'photos' && <PhotosTab photos={data.sitePhotos} reload={reload} toast={toast} />}
        {tab === 'settings' && <SettingsTab settings={data.settings} reload={reload} toast={toast} />}
      </div>
    </div>
  );
}
