'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Calendar, AlertCircle, Wrench, CheckCircle2, Cog, ExternalLink, Phone } from 'lucide-react';
import type { CaseStudy } from '@/lib/types';
import ModalShell from '@/components/ModalShell';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { telHref } from '@/lib/contact';

interface Props {
  caseStudy: CaseStudy;
  onClose: () => void;
}

function Photo({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <figure>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
        <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {label}
        </span>
      </div>
    </figure>
  );
}

function Block({
  icon: Icon,
  title,
  children,
  tone = 'slate',
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  tone?: 'red' | 'amber' | 'blue' | 'emerald' | 'slate';
}) {
  const tones: Record<string, string> = {
    red: 'bg-red-50 border-red-100 text-red-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  };
  return (
    <div>
      <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5 text-sm sm:text-base">
        <Icon className={`w-4 h-4 ${tones[tone].split(' ').pop()}`} /> {title}
      </h4>
      <div className={`p-3.5 rounded-xl border text-sm text-slate-800 leading-relaxed whitespace-pre-line ${tones[tone].split(' ').slice(0, 2).join(' ')}`}>
        {children}
      </div>
    </div>
  );
}

export default function CaseDetailModal({ caseStudy: c, onClose }: Props) {
  const s = useSiteSettings();

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-3xl"
      ariaLabel={c.title}
      header={
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-xs font-bold text-[#00b4d8]">
            <span>{c.serviceCategory}</span>
            {c.region && (
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5" /> {c.region}
              </span>
            )}
            {c.date && (
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5" /> {c.date}
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-2xl font-black pr-10">{c.title}</h3>
        </>
      }
      footer={
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          {c.naverBlogLink ? (
            <a
              href={c.naverBlogLink}
              target="_blank"
              rel="noopener noreferrer"
              data-track="blog_click"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#03c75a] hover:underline"
            >
              블로그에서 자세히 보기 <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span />
          )}
          <a
            href={telHref(s.phoneNumber)}
            data-track="call_click"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0077b6] hover:bg-[#0096c7] text-white font-bold text-sm transition"
          >
            <Phone className="w-4 h-4" /> 비슷한 문제 상담하기
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        {c.symptom && (
          <Block icon={AlertCircle} title="고객 증상" tone="red">
            {c.symptom}
          </Block>
        )}
        {c.cause && (
          <Block icon={Wrench} title="문제 원인" tone="amber">
            {c.cause}
          </Block>
        )}

        {c.beforeImageUrl && <Photo src={c.beforeImageUrl} alt={`${c.title} 작업 전`} label="작업 전" />}

        {c.workProcess && (
          <Block icon={Cog} title="작업 과정" tone="blue">
            {c.workProcess}
          </Block>
        )}

        {c.processImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {c.processImages.map((url, i) => (
              <Photo key={url + i} src={url} alt={`${c.title} 작업 과정 ${i + 1}`} label={`작업 과정 ${i + 1}`} />
            ))}
          </div>
        )}

        {c.equipment && (
          <Block icon={Wrench} title="사용 장비" tone="slate">
            {c.equipment}
          </Block>
        )}

        {c.afterImageUrl && <Photo src={c.afterImageUrl} alt={`${c.title} 작업 후`} label="작업 후" />}

        {c.solution && (
          <Block icon={CheckCircle2} title="해결 결과" tone="emerald">
            {c.solution}
          </Block>
        )}
      </div>
    </ModalShell>
  );
}
