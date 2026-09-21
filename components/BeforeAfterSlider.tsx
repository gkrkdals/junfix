'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = '작업 전 (Before)',
  afterLabel = '작업 후 (After)',
  title = '기름 슬러지로 꽉 막힌 배관 ➜ 고압세척 후 신축 배관처럼 복원',
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full">
      {title && (
        <div className="mb-3 text-center sm:text-left">
          <span className="text-xs font-bold text-[#0077b6] bg-[#00b4d8]/10 px-2.5 py-1 rounded-md">
            Before & After 비교
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800 mt-1">{title}</h4>
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={() => (isDragging.current = true)}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => (isDragging.current = true)}
        onTouchEnd={() => (isDragging.current = false)}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-2xl cursor-ew-resize select-none border-2 border-slate-200 shadow-lg bg-slate-900"
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={afterImage}
            alt="시공 후 사진"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-4 right-4 bg-emerald-600/90 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow backdrop-blur-sm">
            {afterLabel}
          </div>
        </div>

        {/* Before Image (Clipped Overlay) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <Image
            src={beforeImage}
            alt="시공 전 사진"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-red-600/90 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow backdrop-blur-sm">
            {beforeLabel}
          </div>
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-[#071739] text-xs font-black border border-slate-300">
            ↔
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 mt-2">
        💡 가운데 동그라미를 좌우로 밀어서 작업 전·후를 실시간으로 비교해보세요.
      </p>
    </div>
  );
}
