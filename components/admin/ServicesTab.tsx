'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, EyeOff } from 'lucide-react';
import type { ServiceItem } from '@/lib/types';
import { api, Button, Card, Empty, Field, inputClass, linesToArray, Toggle } from './ui';
import ImageUploader from './ImageUploader';

interface Props {
  services: ServiceItem[];
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

interface ServiceForm {
  title: string;
  subtitle: string;
  category: 'plumbing' | 'aircon';
  iconName: string;
  imageUrl: string;
  symptoms: string;
  causes: string;
  inspectionMethod: string;
  workProcess: string;
  equipment: string;
  isActive: boolean;
}

const ICONS: { value: string; label: string }[] = [
  { value: 'Drain', label: '하수구 (물방울)' },
  { value: 'Sink', label: '싱크대·세면대' },
  { value: 'Toilet', label: '변기 (공구)' },
  { value: 'Gauge', label: '고압세척 (게이지)' },
  { value: 'Search', label: '누수탐지 (돋보기)' },
  { value: 'Wrench', label: '배관·수전 (렌치)' },
  { value: 'Wind', label: '에어컨 (바람)' },
];

const EMPTY: ServiceForm = {
  title: '',
  subtitle: '',
  category: 'plumbing',
  iconName: 'Wrench',
  imageUrl: '',
  symptoms: '',
  causes: '',
  inspectionMethod: '',
  workProcess: '',
  equipment: '',
  isActive: true,
};

function toForm(s: ServiceItem): ServiceForm {
  return {
    title: s.title,
    subtitle: s.subtitle,
    category: s.category,
    iconName: s.iconName,
    imageUrl: s.imageUrl,
    symptoms: s.symptoms.join('\n'),
    causes: s.causes.join('\n'),
    inspectionMethod: s.inspectionMethod,
    workProcess: s.workProcess.join('\n'),
    equipment: s.equipment.join('\n'),
    isActive: s.isActive,
  };
}

export default function ServicesTab({ services, reload, toast }: Props) {
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceForm | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const payload = (f: ServiceForm) => ({
    ...f,
    symptoms: linesToArray(f.symptoms),
    causes: linesToArray(f.causes),
    workProcess: linesToArray(f.workProcess),
    equipment: linesToArray(f.equipment),
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (editing) {
        await api('PUT', '/api/services', { id: editing.id, ...payload(form) });
        toast('서비스를 수정했습니다.');
      } else {
        await api('POST', '/api/services', payload(form));
        toast('서비스를 추가했습니다.');
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

  const remove = async (s: ServiceItem) => {
    if (!confirm(`"${s.title}" 서비스를 삭제할까요?\n연결된 시공사례는 남고, 서비스 연결만 해제됩니다.`)) return;
    try {
      await api('DELETE', `/api/services?id=${s.id}`);
      toast('삭제했습니다.');
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const ids = services.map((s) => s.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await api('PUT', '/api/services', { order: ids });
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '순서 변경 실패');
    }
  };

  const toggleActive = async (s: ServiceItem) => {
    try {
      await api('PUT', '/api/services', { id: s.id, isActive: !s.isActive });
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '변경 실패');
    }
  };

  return (
    <>
      <Card
        title="서비스 안내"
        description="홈페이지 서비스 카드(6개 기준, 모바일 2열)와 상세 안내(증상 → 원인 → 점검 → 작업방법 → 장비)에 표시되는 내용입니다. 한 줄 설명은 짧게(20자 내외) 적어야 카드가 깔끔합니다."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(EMPTY);
            }}
          >
            <Plus className="w-4 h-4" /> 서비스 추가
          </Button>
        }
      >
        {services.length === 0 ? (
          <Empty>등록된 서비스가 없습니다.</Empty>
        ) : (
          <div className="space-y-2">
            {services.map((s, index) => (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {s.imageUrl ? <Image src={s.imageUrl} alt={s.title} fill className="object-cover" sizes="56px" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">{s.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.category === 'aircon' ? 'bg-cyan-50 text-cyan-700' : 'bg-blue-50 text-blue-700'}`}>
                      {s.category === 'aircon' ? '에어컨' : '배관·설비'}
                    </span>
                    {!s.isActive && (
                      <span className="text-[10px] font-bold text-slate-500 inline-flex items-center gap-0.5">
                        <EyeOff className="w-3 h-3" /> 숨김
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{s.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="위로">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === services.length - 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="아래로">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(s);
                      setForm(toForm(s));
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                    aria-label="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600" aria-label="삭제">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden sm:block shrink-0">
                  <Toggle checked={s.isActive} onChange={() => toggleActive(s)} label="표시" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !saving && setForm(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">{editing ? '서비스 수정' : '서비스 추가'}</h3>
              <Button variant="ghost" onClick={() => setForm(null)} disabled={saving}>
                닫기
              </Button>
            </div>
            <form onSubmit={save} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="서비스명 *">
                  <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="예: 하수구 막힘" />
                </Field>
                <Field label="분류">
                  <select value={form.category} onChange={(e) => set('category', e.target.value as 'plumbing' | 'aircon')} className={inputClass}>
                    <option value="plumbing">일반 (하수구·배관·누수 등)</option>
                    <option value="aircon">에어컨</option>
                  </select>
                </Field>
              </div>
              <Field label="한 줄 설명" hint="카드 아래에 표시됩니다.">
                <input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} className={inputClass} placeholder="예: 욕실, 베란다 하수구가 막히거나 물이 역류할 때" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="아이콘">
                  <select value={form.iconName} onChange={(e) => set('iconName', e.target.value)} className={inputClass}>
                    {ICONS.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="pt-5">
                  <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label="홈페이지에 표시" />
                </div>
              </div>
              <ImageUploader label="대표 사진 (선택)" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} aspect="aspect-[16/9]" hint="카드와 상세 안내 상단에 표시됩니다. 실제 작업 사진을 권장합니다." />

              <Field label="주요 증상" hint="한 줄에 하나씩 적습니다.">
                <textarea rows={4} value={form.symptoms} onChange={(e) => set('symptoms', e.target.value)} className={inputClass} />
              </Field>
              <Field label="발생 가능한 원인" hint="한 줄에 하나씩.">
                <textarea rows={4} value={form.causes} onChange={(e) => set('causes', e.target.value)} className={inputClass} />
              </Field>
              <Field label="현장 점검 방법">
                <textarea rows={3} value={form.inspectionMethod} onChange={(e) => set('inspectionMethod', e.target.value)} className={inputClass} />
              </Field>
              <Field label="작업 방법 (순서)" hint="한 줄에 한 단계씩.">
                <textarea rows={5} value={form.workProcess} onChange={(e) => set('workProcess', e.target.value)} className={inputClass} />
              </Field>
              <Field label="사용 장비" hint="한 줄에 하나씩.">
                <textarea rows={3} value={form.equipment} onChange={(e) => set('equipment', e.target.value)} className={inputClass} />
              </Field>

              <div className="pt-2 flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setForm(null)} disabled={saving}>
                  취소
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
