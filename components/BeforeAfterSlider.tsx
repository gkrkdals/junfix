'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  subtitle?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = '작업 전',
  afterLabel = '작업 후',
  title,
  subtitle,
}: Props) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-3">
          <span className="text-xs font-bold text-[#0077b6] bg-[#00b4d8]/10 px-2.5 py-1 rounded-md">작업 전·후 비교</span>
          {title && <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={(e) => {
          dragging.current = true;
          moveTo(e.clientX);
        }}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onMouseMove={(e) => dragging.current && moveTo(e.clientX)}
        onTouchStart={(e) => {
          dragging.current = true;
          moveTo(e.touches[0].clientX);
        }}
        onTouchEnd={() => (dragging.current = false)}
        onTouchMove={(e) => dragging.current && moveTo(e.touches[0].clientX)}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-2xl cursor-ew-resize select-none border border-slate-200 bg-slate-900 touch-pan-y"
      >
        <div className="absolute inset-0">
          <Image src={afterImage} alt={afterLabel} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
          <span className="absolute bottom-3 right-3 bg-[#0077b6]/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{afterLabel}</span>
        </div>

        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image src={beforeImage} alt={beforeLabel} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
          <span className="absolute bottom-3 left-3 bg-slate-900/85 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{beforeLabel}</span>
        </div>

        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow" style={{ left: `${position}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-[#071739] text-sm font-black border border-slate-300">
            ↔
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 mt-2">가운데 손잡이를 좌우로 움직여 작업 전·후를 비교해 보세요.</p>
    </div>
  );
}
