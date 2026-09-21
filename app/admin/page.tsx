'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AppData,
  InquiryItem,
  CaseStudy,
  PricingItem,
  ReviewItem,
  SiteSettings,
} from '@/lib/types';
import {
  Inbox,
  Briefcase,
  DollarSign,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Search,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'cases' | 'pricing' | 'reviews' | 'settings'>('inquiries');
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  // 시공사례 신규/수정 모달 상태
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [caseFormData, setCaseFormData] = useState<Partial<CaseStudy>>({
    title: '',
    serviceCategory: '싱크대 막힘',
    region: '경기 수원시',
    symptom: '',
    cause: '',
    solution: '',
    equipment: '배관 내시경, 플렉스샤프트',
    beforeImageUrl: '/images/junfix_main_poster.jpg',
    afterImageUrl: '/images/junfix_pricing_table.jpg',
    naverBlogLink: 'https://blog.naver.com/',
  });

  // 후기 등록 폼
  const [newReview, setNewReview] = useState({
    customerName: '',
    region: '',
    serviceType: '하수구 막힘',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    // 세션 인증 체크
    fetch('/api/admin/check')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          loadAllData();
        }
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const loadAllData = async () => {
    try {
      const [inqRes, caseRes, priceRes, reviewRes, setRes] = await Promise.all([
        fetch('/api/inquiries'),
        fetch('/api/cases'),
        fetch('/api/pricing'),
        fetch('/api/reviews'),
        fetch('/api/settings'),
      ]);

      const [inquiries, caseStudies, pricing, reviews, settings] = await Promise.all([
        inqRes.json(),
        caseRes.json(),
        priceRes.json(),
        reviewRes.json(),
        setRes.json(),
      ]);

      setData({
        inquiries,
        caseStudies,
        pricing,
        reviews,
        settings,
        services: [],
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const showToast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // 1. 상담 상태 변경
  const handleInquiryStatusChange = async (id: number, status: string) => {
    await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    showToast('상담 상태가 업데이트되었습니다.');
    loadAllData();
  };

  // 2. 상담 관리자 메모 저장
  const handleInquiryMemoSave = async (id: number, memo: string) => {
    await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, memo }),
    });
    showToast('메모가 저장되었습니다.');
  };

  // 3. 시공사례 저장 (신규 등록 or 수정)
  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      // 수정
      await fetch('/api/cases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCase.id, ...caseFormData }),
      });
      showToast('시공사례가 수정되었습니다.');
    } else {
      // 신규 등록
      await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseFormData),
      });
      showToast('새로운 시공사례가 등록되었습니다.');
    }
    setIsCaseModalOpen(false);
    setEditingCase(null);
    loadAllData();
  };

  const handleDeleteCase = async (id: number) => {
    if (!confirm('정말 이 시공사례를 삭제하시겠습니까?')) return;
    await fetch(`/api/cases?id=${id}`, { method: 'DELETE' });
    showToast('시공사례가 삭제되었습니다.');
    loadAllData();
  };

  // 4. 가격표 항목 수정
  const handleSavePricing = async () => {
    if (!data) return;
    await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.pricing),
    });
    showToast('가격표가 성공적으로 저장되었습니다.');
  };

  // 5. 사이트 설정 저장
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.settings),
    });
    showToast('기본 정보 설정이 저장되었습니다.');
  };

  // 6. 후기 등록 및 삭제
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment) return;
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview),
    });
    setNewReview({ customerName: '', region: '', serviceType: '하수구 막힘', rating: 5, comment: '' });
    showToast('새 후기가 등록되었습니다.');
    loadAllData();
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('후기를 삭제하시겠습니까?')) return;
    await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
    showToast('후기가 삭제되었습니다.');
    loadAllData();
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-600">
        관리자 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#071739] text-white py-4 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black">JUNFI<span className="text-[#00b4d8]">X</span></span>
            <span className="text-xs bg-[#00b4d8]/20 text-[#90e0ef] px-2 py-0.5 rounded font-bold">
              관리자 모드
            </span>
          </div>

          <div className="flex items-center gap-4">
            {saveMessage && (
              <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                ✔ {saveMessage}
              </span>
            )}
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <span>홈페이지 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> 로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-grow">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'inquiries'
                ? 'bg-[#071739] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" /> 상담/출동 접수 현황 ({data.inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('cases')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'cases'
                ? 'bg-[#071739] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" /> 시공사례 관리 ({data.caseStudies.length})
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'pricing'
                ? 'bg-[#071739] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> 작업비용 관리
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'reviews'
                ? 'bg-[#071739] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-4 h-4" /> 고객후기 관리 ({data.reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'settings'
                ? 'bg-[#071739] text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" /> 기본 정보 설정
          </button>
        </div>

        {/* TAB 1: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">고객 상담 및 출동 접수 목록</h3>
                <p className="text-xs text-slate-500">홈페이지 간편 접수 폼으로 들어온 실시간 문의 내역입니다.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {data.inquiries.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">접수된 문의 내역이 없습니다.</div>
              ) : (
                data.inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{inq.customerName}</span>
                        <a
                          href={`tel:${inq.phoneNumber}`}
                          className="text-xs font-bold text-[#0077b6] bg-blue-50 px-2.5 py-0.5 rounded-md hover:bg-blue-100 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> {inq.phoneNumber}
                        </a>
                        <span className="text-xs text-slate-400">| 접수일시: {inq.createdAt}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                        <span className="font-semibold text-slate-800">지역:</span> {inq.region}
                        <span>•</span>
                        <span className="font-semibold text-slate-800">서비스:</span> {inq.serviceType}
                        <span>•</span>
                        <span className="font-semibold text-slate-800">희망시간:</span> {inq.preferredTime}
                      </div>
                      {inq.description && (
                        <p className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg">
                          💬 {inq.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full md:w-auto">
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                          inq.status === '접수완료'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : inq.status === '상담진행중'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : inq.status === '출동예약'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        <option value="접수완료">접수완료</option>
                        <option value="상담진행중">상담진행중</option>
                        <option value="출동예약">출동예약</option>
                        <option value="시공완료">시공완료</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Case Studies */}
        {activeTab === 'cases' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">시공사례 직접 관리</h3>
                <p className="text-xs text-slate-500">새로운 현장 사진과 작업 내용을 추가하거나 수정할 수 있습니다.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCase(null);
                  setCaseFormData({
                    title: '',
                    serviceCategory: '싱크대 막힘',
                    region: '경기 수원시',
                    symptom: '',
                    cause: '',
                    solution: '',
                    equipment: '배관 내시경, 플렉스샤프트',
                    beforeImageUrl: '/images/junfix_main_poster.jpg',
                    afterImageUrl: '/images/junfix_pricing_table.jpg',
                    naverBlogLink: 'https://blog.naver.com/',
                  });
                  setIsCaseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00b4d8] hover:bg-[#0096c7] text-white text-xs font-bold rounded-xl shadow transition"
              >
                <Plus className="w-4 h-4" /> 신규 시공사례 등록
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.caseStudies.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-[#0077b6] bg-blue-50 px-2 py-0.5 rounded">
                        {item.serviceCategory}
                      </span>
                      <span className="text-slate-400">{item.region}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2"><strong>증상:</strong> {item.symptom}</p>
                    <p className="text-xs text-slate-600 line-clamp-2"><strong>결과:</strong> {item.solution}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <a
                      href={item.naverBlogLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      블로그 링크 <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCase(item);
                          setCaseFormData(item);
                          setIsCaseModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCase(item.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Pricing Management */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">작업 가격표 실시간 수정</h3>
                <p className="text-xs text-slate-500">
                  고객에게 노출되는 가격 및 설명을 직접 수정하고 저장하실 수 있습니다.
                </p>
              </div>
              <button
                onClick={handleSavePricing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00b4d8] hover:bg-[#0096c7] text-white text-xs font-bold shadow transition"
              >
                <Save className="w-4 h-4" /> 수정사항 저장하기
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">1. 기본 표준 작업 비용 항목</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.pricing.filter((p) => p.category === 'fixed').map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">항목 #{idx + 1}</span>
                      <input
                        type="text"
                        value={item.priceDisplay}
                        onChange={(e) => {
                          const updated = [...data.pricing];
                          const targetIdx = updated.findIndex((p) => p.id === item.id);
                          updated[targetIdx].priceDisplay = e.target.value;
                          setData({ ...data, pricing: updated });
                        }}
                        className="text-sm font-black text-red-600 px-2 py-1 rounded bg-white border border-slate-300 w-32 text-right"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">서비스명</label>
                      <input
                        type="text"
                        value={item.serviceName}
                        onChange={(e) => {
                          const updated = [...data.pricing];
                          const targetIdx = updated.findIndex((p) => p.id === item.id);
                          updated[targetIdx].serviceName = e.target.value;
                          setData({ ...data, pricing: updated });
                        }}
                        className="w-full text-xs font-bold px-2 py-1 rounded bg-white border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">설명</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...data.pricing];
                          const targetIdx = updated.findIndex((p) => p.id === item.id);
                          updated[targetIdx].description = e.target.value;
                          setData({ ...data, pricing: updated });
                        }}
                        className="w-full text-xs px-2 py-1 rounded bg-white border border-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-bold text-slate-800 pt-4">2. 현장 견적 서비스 항목</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.pricing.filter((p) => p.category === 'quote').map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">현장 견적 #{idx + 1}</span>
                      <input
                        type="text"
                        value={item.priceDisplay}
                        onChange={(e) => {
                          const updated = [...data.pricing];
                          const targetIdx = updated.findIndex((p) => p.id === item.id);
                          updated[targetIdx].priceDisplay = e.target.value;
                          setData({ ...data, pricing: updated });
                        }}
                        className="text-xs font-black text-[#0077b6] px-2 py-1 rounded bg-white border border-slate-300 w-28 text-right"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">서비스명</label>
                      <input
                        type="text"
                        value={item.serviceName}
                        onChange={(e) => {
                          const updated = [...data.pricing];
                          const targetIdx = updated.findIndex((p) => p.id === item.id);
                          updated[targetIdx].serviceName = e.target.value;
                          setData({ ...data, pricing: updated });
                        }}
                        className="w-full text-xs font-bold px-2 py-1 rounded bg-white border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">설명</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...data.pricing];
                          const targetIdx = updated.findIndex((p) => p.id === item.id);
                          updated[targetIdx].description = e.target.value;
                          setData({ ...data, pricing: updated });
                        }}
                        className="w-full text-xs px-2 py-1 rounded bg-white border border-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Reviews Management */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* New Review Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 mb-3">신규 고객후기 등록</h4>
              <form onSubmit={handleAddReview} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="고객명 (예: 김*수 고객님)"
                    value={newReview.customerName}
                    onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                    className="px-3 py-2 border rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="지역 (예: 경기 수원시)"
                    value={newReview.region}
                    onChange={(e) => setNewReview({ ...newReview, region: e.target.value })}
                    className="px-3 py-2 border rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="서비스 유형 (예: 싱크대 막힘)"
                    value={newReview.serviceType}
                    onChange={(e) => setNewReview({ ...newReview, serviceType: e.target.value })}
                    className="px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <textarea
                  required
                  placeholder="고객 후기 내용을 입력하세요..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={3}
                  className="w-full p-3 border rounded-xl text-xs resize-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                >
                  후기 등록하기
                </button>
              </form>
            </div>

            {/* Existing Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900">{rev.customerName}</span>
                      <span className="text-[10px] text-slate-400">{rev.region} • {rev.serviceType}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3">{rev.comment}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Basic Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-1">업체 기본정보 및 링크 설정</h3>
            <p className="text-xs text-slate-500 mb-6">
              전화번호, 카카오톡 오픈채팅 주소, 네이버 블로그 URL을 수정할 수 있습니다.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상호명</label>
                <input
                  type="text"
                  value={data.settings.siteName}
                  onChange={(e) => setData({ ...data, settings: { ...data.settings, siteName: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">대표자명</label>
                <input
                  type="text"
                  value={data.settings.representativeName}
                  onChange={(e) => setData({ ...data, settings: { ...data.settings, representativeName: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대표 전화번호 (긴급출동)</label>
                  <input
                    type="text"
                    value={data.settings.phoneNumber}
                    onChange={(e) => setData({ ...data, settings: { ...data.settings, phoneNumber: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0077b6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">출동 가능 지역 안내문구</label>
                  <input
                    type="text"
                    value={data.settings.serviceAreas}
                    onChange={(e) => setData({ ...data, settings: { ...data.settings, serviceAreas: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">카카오톡 오픈채팅 URL</label>
                <input
                  type="text"
                  value={data.settings.kakaoTalkUrl}
                  onChange={(e) => setData({ ...data, settings: { ...data.settings, kakaoTalkUrl: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">공식 네이버 블로그 URL</label>
                <input
                  type="text"
                  value={data.settings.naverBlogUrl}
                  onChange={(e) => setData({ ...data, settings: { ...data.settings, naverBlogUrl: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#00b4d8] hover:bg-[#0096c7] text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> 설정 저장하기
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Case Study Modal (Create & Edit) */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900">
              {editingCase ? '시공사례 수정' : '새 시공사례 등록'}
            </h3>
            <form onSubmit={handleSaveCase} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={caseFormData.title}
                  onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                  placeholder="예: 역삼동 빌라 싱크대 역류 스케일링 해결"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">서비스 분류</label>
                  <select
                    value={caseFormData.serviceCategory}
                    onChange={(e) => setCaseFormData({ ...caseFormData, serviceCategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="하수구 막힘">하수구 막힘</option>
                    <option value="싱크대 막힘">싱크대 막힘</option>
                    <option value="변기 막힘">변기 막힘</option>
                    <option value="변기 교체">변기 교체</option>
                    <option value="배관 고압세척">배관 고압세척</option>
                    <option value="누수탐지">누수탐지</option>
                    <option value="에어컨 케어">에어컨 케어</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">작업 지역</label>
                  <input
                    type="text"
                    required
                    value={caseFormData.region}
                    onChange={(e) => setCaseFormData({ ...caseFormData, region: e.target.value })}
                    placeholder="예: 서울 강남구 역삼동"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">고객 증상</label>
                <input
                  type="text"
                  required
                  value={caseFormData.symptom}
                  onChange={(e) => setCaseFormData({ ...caseFormData, symptom: e.target.value })}
                  placeholder="예: 물이 내려가지 않고 바닥으로 역류"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">문제 원인</label>
                <input
                  type="text"
                  required
                  value={caseFormData.cause}
                  onChange={(e) => setCaseFormData({ ...caseFormData, cause: e.target.value })}
                  placeholder="예: 기름 슬러지 90% 고착"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">해결 결과 및 작업 과정</label>
                <textarea
                  required
                  value={caseFormData.solution}
                  onChange={(e) => setCaseFormData({ ...caseFormData, solution: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">사용 장비</label>
                <input
                  type="text"
                  value={caseFormData.equipment}
                  onChange={(e) => setCaseFormData({ ...caseFormData, equipment: e.target.value })}
                  placeholder="예: 플렉스샤프트, 배관내시경"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">네이버 블로그 링크</label>
                <input
                  type="text"
                  value={caseFormData.naverBlogLink}
                  onChange={(e) => setCaseFormData({ ...caseFormData, naverBlogLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00b4d8] text-white font-bold rounded-xl"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
