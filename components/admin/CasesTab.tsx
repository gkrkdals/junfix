'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Star, ImageOff } from 'lucide-react';
import type { CaseStudy, ServiceItem } from '@/lib/types';
import { api, Button, Card, Empty, Field, inputClass, Toggle } from './ui';
import ImageUploader from './ImageUploader';

interface Props {
  cases: CaseStudy[];
  services: ServiceItem[];
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

type CaseForm = Omit<CaseStudy, 'id'>;

function emptyForm(services: ServiceItem[]): CaseForm {
  const first = services[0];
  return {
    serviceId: first?.id ?? null,
    title: '',
    serviceCategory: first?.title ?? '',
    region: '',
    symptom: '',
    cause: '',
    workProcess: '',
    solution: '',
    equipment: '',
    beforeImageUrl: '',
    afterImageUrl: '',
    processImages: [],
    naverBlogLink: '',
    date: new Date().toISOString().split('T')[0],
    isFeatured: false,
  };
}

export default function CasesTab({ cases, services, reload, toast }: Props) {
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [form, setForm] = useState<CaseForm | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CaseForm>(key: K, value: CaseForm[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm(services));
  };

  const openEdit = (c: CaseStudy) => {
    setEditing(c);
    const { id: _id, ...rest } = c;
    setForm(rest);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.title.trim()) {
      toast('제목을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api('PUT', '/api/cases', { id: editing.id, ...form });
        toast('시공사례를 수정했습니다.');
      } else {
        await api('POST', '/api/cases', form);
        toast('시공사례를 등록했습니다.');
      }
      setForm(null);
      setEditing(null);
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: CaseStudy) => {
    if (!confirm(`"${c.title}" 사례를 삭제할까요?`)) return;
    try {
      await api('DELETE', `/api/cases?id=${c.id}`);
      toast('삭제했습니다.');
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const toggleFeatured = async (c: CaseStudy) => {
    try {
      await api('PUT', '/api/cases', { id: c.id, isFeatured: !c.isFeatured });
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '변경 실패');
    }
  };

  return (
    <>
      <Card
        title="시공사례"
        description="현장 사진과 작업 내용을 등록하면 홈페이지 시공사례와 각 서비스의 '실제 시공사례'에 함께 보입니다. 작업 전·후 사진이 모두 있는 대표 사례는 전·후 비교 슬라이더로 표시됩니다."
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" /> 새 시공사례 등록
          </Button>
        }
      >
        {cases.length === 0 ? (
          <Empty>등록된 시공사례가 없습니다. 첫 사례를 등록해 보세요.</Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) => {
              const thumb = c.afterImageUrl || c.beforeImageUrl || c.processImages[0];
              return (
                <div key={c.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white flex flex-col">
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {thumb ? (
                      <Image src={thumb} alt={c.title} fill className="object-cover" sizes="300px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs gap-1">
                        <ImageOff className="w-4 h-4" /> 사진 없음
                      </div>
                    )}
                    {c.isFeatured && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded">대표</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="font-bold text-brand">{c.serviceCategory}</span>
                      <span className="text-slate-400">
                        {c.region} · {c.date}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{c.title}</h4>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <button
                        onClick={() => toggleFeatured(c)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${c.isFeatured ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${c.isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} /> 대표 사례
                      </button>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg" aria-label="수정">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(c)} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg" aria-label="삭제">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !saving && setForm(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">{editing ? '시공사례 수정' : '새 시공사례 등록'}</h3>
              <Button variant="ghost" onClick={() => setForm(null)} disabled={saving}>
                닫기
              </Button>
            </div>

            <form onSubmit={save} className="flex-1 overflow-y-auto p-5 space-y-4">
              <Field label="제목 *" hint="예: 수원 영통구 아파트 욕실 하수구 막힘 해결">
                <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="서비스 종류">
                  <select
                    value={form.serviceId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      const sv = services.find((s) => s.id === id);
                      set('serviceId', id);
                      if (sv) set('serviceCategory', sv.title);
                    }}
                    className={inputClass}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                    <option value="">기타</option>
                  </select>
                </Field>
                <Field label="작업 지역">
                  <input value={form.region} onChange={(e) => set('region', e.target.value)} placeholder="예: 수원시 영통구" className={inputClass} />
                </Field>
                <Field label="작업 날짜">
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
                </Field>
              </div>

              {!form.serviceId && (
                <Field label="분류명 (기타일 때)">
                  <input value={form.serviceCategory} onChange={(e) => set('serviceCategory', e.target.value)} className={inputClass} />
                </Field>
              )}

              <Field label="고객 증상">
                <textarea rows={2} value={form.symptom} onChange={(e) => set('symptom', e.target.value)} className={inputClass} placeholder="고객이 말씀하신 불편 내용" />
              </Field>
              <Field label="문제 원인">
                <textarea rows={2} value={form.cause} onChange={(e) => set('cause', e.target.value)} className={inputClass} placeholder="현장 확인 결과 원인" />
              </Field>

              <ImageUploader label="작업 전 사진" value={form.beforeImageUrl} onChange={(url) => set('beforeImageUrl', url)} aspect="aspect-[16/9]" />

              <Field label="작업 과정">
                <textarea rows={3} value={form.workProcess} onChange={(e) => set('workProcess', e.target.value)} className={inputClass} placeholder="어떤 순서로 어떻게 작업했는지" />
              </Field>
              <ImageUploader
                multiple
                label="작업 과정 사진 (선택, 최대 6장)"
                value={form.processImages}
                onChange={(urls) => set('processImages', urls)}
                max={6}
              />

              <Field label="사용 장비">
                <input value={form.equipment} onChange={(e) => set('equipment', e.target.value)} className={inputClass} placeholder="예: 배관 내시경, 고압세척기" />
              </Field>

              <ImageUploader label="작업 후 사진" value={form.afterImageUrl} onChange={(url) => set('afterImageUrl', url)} aspect="aspect-[16/9]" />

              <Field label="해결 결과">
                <textarea rows={2} value={form.solution} onChange={(e) => set('solution', e.target.value)} className={inputClass} placeholder="작업 후 상태, 고객 안내 내용" />
              </Field>

              <Field label="네이버 블로그 글 링크 (선택)" hint="같은 사례를 블로그에 올렸다면 주소를 붙여 넣으세요.">
                <input value={form.naverBlogLink} onChange={(e) => set('naverBlogLink', e.target.value)} className={inputClass} placeholder="https://blog.naver.com/..." />
              </Field>

              <Toggle checked={form.isFeatured} onChange={(v) => set('isFeatured', v)} label="대표 사례로 표시 (전·후 비교 슬라이더에 사용)" />

              <div className="pt-2 flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setForm(null)} disabled={saving}>
                  취소
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? '저장 중...' : editing ? '수정 저장' : '등록하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
