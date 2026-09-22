'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  ariaLabel?: string;
}

/** 모바일 전체 폭 / 데스크톱 가운데 카드 형태의 공용 모달 */
export default function ModalShell({ onClose, header, footer, children, maxWidth = 'max-w-3xl', ariaLabel }: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/70 flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className={`relative bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-navy text-white p-5 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
          {header}
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-7">{children}</div>

        {footer && <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
