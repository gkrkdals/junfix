'use client';

import React, { useState } from 'react';
import { Phone, Trash2, Save } from 'lucide-react';
import type { InquiryItem } from '@/lib/types';
import { api, Button, Card, Empty, inputClass } from './ui';
import { telHref } from '@/lib/contact';

interface Props {
  inquiries: InquiryItem[];
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  접수완료: 'bg-amber-50 text-amber-700 border-amber-300',
  상담진행중: 'bg-blue-50 text-blue-700 border-blue-300',
  출동예약: 'bg-purple-50 text-purple-700 border-purple-300',
  시공완료: 'bg-emerald-50 text-emerald-700 border-emerald-300',
};

function MemoEditor({ inquiry, toast }: { inquiry: InquiryItem; toast: (m: string) => void }) {
  const [memo, setMemo] = useState(inquiry.memo);
  const [saving, setSaving] = useState(false);
  const dirty = memo !== inquiry.memo;

  return (
    <div className="flex gap-2 items-start">
      <textarea
        rows={2}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="관리 메모 (통화 내용, 방문 일정 등)"
        className={`${inputClass} resize-none text-xs`}
      />
      <Button
        variant="ghost"
        disabled={!dirty || saving}
        onClick={async () => {
          setSaving(true);
          try {
            await api('PATCH', '/api/inquiries', { id: inquiry.id, memo });
            inquiry.memo = memo;
            toast('메모를 저장했습니다.');
          } catch (e) {
            toast(e instanceof Error ? e.message : '저장 실패');
          } finally {
            setSaving(false);
          }
        }}
      >
        <Save className="w-3.5 h-3.5" /> 저장
      </Button>
    </div>
  );
}

export default function InquiriesTab({ inquiries, reload, toast }: Props) {
  const [filter, setFilter] = useState('전체');
  const statuses = ['전체', '접수완료', '상담진행중', '출동예약', '시공완료'];
  const list = filter === '전체' ? inquiries : inquiries.filter((i) => i.status === filter);

  const changeStatus = async (id: number, status: string) => {
    try {
      await api('PATCH', '/api/inquiries', { id, status });
      toast('상태를 변경했습니다.');
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : '변경 실패');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('이 접수 내역을 삭제할까요?')) return;
    try {
      await api('DELETE', `/api/inquiries?id=${id}`);
      toast('삭제했습니다.');
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : '삭제 실패');
    }
  };

  return (
    <Card
      title="상담 접수 내역"
      description="홈페이지 상담 신청 폼으로 들어온 내역입니다. 전화·문자·카톡으로 직접 연락한 고객은 여기 남지 않습니다."
      actions={
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filter === st ? 'bg-[#071739] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {st}
            </button>
          ))}
        </div>
      }
    >
      {list.length === 0 ? (
        <Empty>접수된 문의가 없습니다.</Empty>
      ) : (
        <div className="divide-y divide-slate-100 -m-4 sm:-m-5">
          {list.map((inq) => (
            <div key={inq.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{inq.customerName}</span>
                    <a
                      href={telHref(inq.phoneNumber)}
                      className="text-xs font-bold text-[#0077b6] bg-blue-50 px-2.5 py-1 rounded-md hover:bg-blue-100 inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {inq.phoneNumber}
                    </a>
                    <span className="text-[11px] text-slate-400">{inq.createdAt}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      <b className="text-slate-800">지역</b> {inq.region || '-'}
                    </span>
                    <span>
                      <b className="text-slate-800">서비스</b> {inq.serviceType || '-'}
                    </span>
                    <span>
                      <b className="text-slate-800">희망시간</b> {inq.preferredTime || '-'}
                    </span>
                  </div>
                  {inq.description && <p className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg whitespace-pre-line">{inq.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={inq.status}
                    onChange={(e) => changeStatus(inq.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none ${STATUS_STYLE[inq.status]}`}
                  >
                    {statuses.slice(1).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => remove(inq.id)} className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50" aria-label="삭제">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <MemoEditor inquiry={inq} toast={toast} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
