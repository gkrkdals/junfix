import React from 'react';

interface Props {
  label: string;
  title: string;
  desc?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
}

/** 모든 섹션이 같은 머리 규칙을 쓴다 (라벨 → 제목 → 한두 줄 설명). */
export default function SectionHeader({ label, title, desc, align = 'left', action }: Props) {
  return (
    <div className={`mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 ${align === 'center' ? 'text-center sm:text-left' : ''}`}>
      <div className={align === 'center' ? 'mx-auto sm:mx-0' : ''}>
        <span className="section-label">{label}</span>
        <h2 className="section-title">{title}</h2>
        {desc && <p className="section-desc">{desc}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
