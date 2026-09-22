'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, EyeOff } from 'lucide-react';
import type { ReviewItem, ServiceItem } from '@/lib/types';
import { api, Button, Card, Empty, Field, inputClass, Toggle } from './ui';

interface Props {
  reviews: ReviewItem[];
  services: ServiceItem[];
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

type ReviewForm = Omit<ReviewItem, 'id'>;

const empty = (): ReviewForm => ({
  customerName: '',
  region: '',
  serviceType: '',
  rating: 5,
  comment: '',
  date: new Date().toISOString().split('T')[0],
  isActive: true,
});

export default function ReviewsTab({ reviews, services, reload, toast }: Props) {
  const [editing, setEditing] = useState<ReviewItem | null>(null);
  const [form, setForm] = useState<ReviewForm | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ReviewForm>(key: K, value: ReviewForm[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.comment.trim()) {
      toast('후기 내용을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api('PUT', '/api/reviews', { id: editing.id, ...form });
        toast('후기를 수정했습니다.');
      } else {
        await api('POST', '/api/reviews', form);
        toast('후기를 등록했습니다.');
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

  const remove = async (r: ReviewItem) => {
    if (!confirm('이 후기를 삭제할까요?')) return;
    try {
      await api('DELETE', `/api/reviews?id=${r.id}`);
      toast('삭제했습니다.');
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const toggleActive = async (r: ReviewItem) => {
    try {
      await api('PUT', '/api/reviews', { id: r.id, isActive: !r.isActive });
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '변경 실패');
    }
  };

  return (
    <>
      <Card
        title="고객후기"
        description="고객이 문자·카톡·리뷰로 남긴 내용을 옮겨 적습니다. 이름은 '김*수' 처럼 일부만 적는 것을 권장합니다. 후기가 하나도 없으면 홈페이지의 후기 영역은 숨겨집니다."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(empty());
            }}
          >
            <Plus className="w-4 h-4" /> 후기 등록
          </Button>
        }
      >
        {reviews.length === 0 ? (
          <Empty>등록된 후기가 없습니다.</Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reviews.map((r) => (
              <div key={r.id} className={`p-4 rounded-xl border ${r.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    {r.serviceType && <span className="text-[10px] font-bold text-[#0077b6] bg-blue-50 px-1.5 py-0.5 rounded">{r.serviceType}</span>}
                    {!r.isActive && (
                      <span className="text-[10px] font-bold text-slate-500 inline-flex items-center gap-0.5">
                        <EyeOff className="w-3 h-3" /> 숨김
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(r);
                        const { id: _id, ...rest } = r;
                        setForm(rest);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                      aria-label="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600" aria-label="삭제">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-line">{r.comment}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {r.customerName} {r.region && `· ${r.region}`} {r.date && `· ${r.date}`}
                  </span>
                  <Toggle checked={r.isActive} onChange={() => toggleActive(r)} label="표시" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !saving && setForm(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">{editing ? '후기 수정' : '후기 등록'}</h3>
              <Button variant="ghost" onClick={() => setForm(null)} disabled={saving}>
                닫기
              </Button>
            </div>
            <form onSubmit={save} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="고객명">
                  <input value={form.customerName} onChange={(e) => set('customerName', e.target.value)} className={inputClass} placeholder="예: 김*수 고객님" />
                </Field>
                <Field label="지역">
                  <input value={form.region} onChange={(e) => set('region', e.target.value)} className={inputClass} placeholder="예: 수원 영통구" />
                </Field>
                <Field label="서비스">
                  <select value={form.serviceType} onChange={(e) => set('serviceType', e.target.value)} className={inputClass}>
                    <option value="">선택 안 함</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="별점">
                  <select value={form.rating} onChange={(e) => set('rating', Number(e.target.value))} className={inputClass}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {'★'.repeat(n)} ({n}점)
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="날짜" className="col-span-2">
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="후기 내용 *">
                <textarea required rows={5} value={form.comment} onChange={(e) => set('comment', e.target.value)} className={inputClass} />
              </Field>
              <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label="홈페이지에 표시" />
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
