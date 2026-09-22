'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw, ArrowLeftRight } from 'lucide-react';
import type { PricingItem } from '@/lib/types';
import { api, Button, Card, Empty, inputClass, Toggle } from './ui';

interface Props {
  pricing: PricingItem[];
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

/** 저장 전까지는 화면에서만 편집한다. 새 행은 id 를 0 이하 음수로 둔다. */
export default function PricingTab({ pricing, reload, toast }: Props) {
  const [rows, setRows] = useState<PricingItem[]>(pricing);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(rows) !== JSON.stringify(pricing);

  useEffect(() => setRows(pricing), [pricing]);

  // 저장 안 한 변경이 있으면 페이지 이탈 경고
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const update = (id: number, patch: Partial<PricingItem>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = (category: 'fixed' | 'quote') => {
    const tempId = -Date.now();
    setRows((rs) => [
      ...rs,
      {
        id: tempId,
        serviceName: '',
        category,
        priceDisplay: category === 'fixed' ? '원~' : '현장 견적',
        description: '',
        notice: '',
        orderNum: rs.length,
        isActive: true,
      },
    ]);
  };

  const removeRow = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));

  const move = (id: number, dir: -1 | 1) => {
    setRows((rs) => {
      const row = rs.find((r) => r.id === id);
      if (!row) return rs;
      const group = rs.filter((r) => r.category === row.category);
      const idx = group.findIndex((r) => r.id === id);
      const swapWith = group[idx + dir];
      if (!swapWith) return rs;
      const a = rs.indexOf(row);
      const b = rs.indexOf(swapWith);
      const next = [...rs];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  const save = async () => {
    const invalid = rows.find((r) => !r.serviceName.trim());
    if (invalid) {
      toast('항목명이 비어 있는 행이 있습니다. 채우거나 삭제해 주세요.');
      return;
    }
    setSaving(true);
    try {
      // 새 행(id<=0)은 id 없이 보낸다. 표 순서대로 정렬(기본 비용 -> 현장 견적).
      const ordered = [...rows.filter((r) => r.category === 'fixed'), ...rows.filter((r) => r.category === 'quote')];
      const payload = ordered.map(({ id, ...rest }) => (id > 0 ? { id, ...rest } : rest));
      await api('PUT', '/api/pricing', payload);
      toast('가격표를 저장했습니다.');
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  // 컴포넌트가 아니라 함수로 그려야 입력 중 포커스가 유지된다 (매 렌더마다 새 컴포넌트 타입이 되면 재마운트됨)
  const renderTable = (category: 'fixed' | 'quote', title: string, hint: string) => {
    const list = rows.filter((r) => r.category === category);
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-black text-slate-900">{title}</h4>
            <p className="text-[11px] text-slate-500">{hint}</p>
          </div>
          <Button variant="ghost" onClick={() => addRow(category)}>
            <Plus className="w-3.5 h-3.5" /> 행 추가
          </Button>
        </div>

        {list.length === 0 ? (
          <Empty>항목이 없습니다. "행 추가"를 눌러 추가하세요.</Empty>
        ) : (
          <div className="space-y-2">
            {list.map((row, index) => (
              <div key={row.id} className={`rounded-xl border p-3 ${row.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300 opacity-70'}`}>
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      value={row.serviceName}
                      onChange={(e) => update(row.id, { serviceName: e.target.value })}
                      placeholder="항목명 (예: 하수구 막힘)"
                      className={`${inputClass} font-bold`}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <input
                      value={row.priceDisplay}
                      onChange={(e) => update(row.id, { priceDisplay: e.target.value })}
                      placeholder={category === 'fixed' ? '50,000원~' : '현장 견적'}
                      className={`${inputClass} ${category === 'fixed' ? 'text-red-600 font-bold' : 'text-brand font-bold'}`}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-5">
                    <input
                      value={row.description}
                      onChange={(e) => update(row.id, { description: e.target.value })}
                      placeholder="설명 (예: 욕실·베란다 등 일반 배수구 막힘)"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-12">
                    <input
                      value={row.notice}
                      onChange={(e) => update(row.id, { notice: e.target.value })}
                      placeholder="비고 (선택, 작게 표시됨. 예: 배관 길이에 따라 추가 비용)"
                      className={`${inputClass} text-xs py-2`}
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <Toggle checked={row.isActive} onChange={(v) => update(row.id, { isActive: v })} label="홈페이지에 표시" />
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(row.id, -1)} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="위로">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => move(row.id, 1)} disabled={index === list.length - 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="아래로">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => update(row.id, { category: category === 'fixed' ? 'quote' : 'fixed', priceDisplay: category === 'fixed' ? '현장 견적' : row.priceDisplay })}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                      title={category === 'fixed' ? '현장 견적 표로 이동' : '기본 비용 표로 이동'}
                      aria-label="표 이동"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeRow(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" aria-label="행 삭제">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      title="작업비용 안내표"
      description="행을 추가·삭제·이동한 뒤 반드시 '저장'을 눌러야 홈페이지에 반영됩니다."
      actions={
        <>
          <Button variant="ghost" disabled={!dirty || saving} onClick={() => setRows(pricing)}>
            <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
          </Button>
          <Button disabled={!dirty || saving} onClick={save}>
            <Save className="w-3.5 h-3.5" /> {saving ? '저장 중...' : '저장'}
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        {renderTable('fixed', '기본 작업 비용', "가격이 정해진 작업. 금액은 '50,000원~' 처럼 자유롭게 적습니다.")}
        {renderTable('quote', '현장 견적 서비스', "현장 상황에 따라 비용이 달라지는 작업. 가격란에 '현장 견적' 등을 적습니다.")}
      </div>
      {dirty && (
        <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
          저장하지 않은 변경 사항이 있습니다. 상단의 "저장" 버튼을 눌러 주세요.
        </div>
      )}
    </Card>
  );
}
