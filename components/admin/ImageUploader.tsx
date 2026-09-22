'use client';

// 사진 업로드 입력.
//  - single: 사진 한 장 (value: string)
//  - multiple: 여러 장 (value: string[])
// 휴대폰에서는 파일 선택 시 카메라 촬영도 고를 수 있다 (accept="image/*").

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface UploadedAsset {
  id: number;
  url: string;
  width: number;
  height: number;
}

async function uploadFiles(files: File[]): Promise<{ assets: UploadedAsset[]; errors: { name: string; message: string }[] }> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await fetch('/api/uploads', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `업로드 실패 (${res.status})`);
  return { assets: data.assets ?? [], errors: data.errors ?? [] };
}

type SingleProps = {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspect?: string;
};

type MultiProps = {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  hint?: string;
  aspect?: string;
  max?: number;
};

export default function ImageUploader(props: SingleProps | MultiProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const aspect = props.aspect ?? 'aspect-[4/3]';

  const handleFiles = async (fileList: FileList | File[]) => {
    let files = Array.from(fileList).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (files.length === 0) {
      setError('이미지 파일만 올릴 수 있습니다.');
      return;
    }
    if (!props.multiple) files = files.slice(0, 1);
    else if (props.max) files = files.slice(0, Math.max(0, props.max - props.value.length));

    if (files.length === 0) return;

    setBusy(true);
    setError('');
    try {
      const { assets, errors } = await uploadFiles(files);
      if (errors.length) setError(errors.map((e) => `${e.name}: ${e.message}`).join(' / '));
      if (props.multiple) props.onChange([...props.value, ...assets.map((a) => a.url)]);
      else if (assets[0]) props.onChange(assets[0].url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드 실패');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const dropZone = (
    <div
      onClick={() => !busy && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
      className={`${aspect} w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-500 transition ${
        dragOver ? 'border-[#00b4d8] bg-[#00b4d8]/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
      }`}
    >
      {busy ? <Loader2 className="w-6 h-6 animate-spin text-[#0077b6]" /> : <ImagePlus className="w-6 h-6" />}
      <span className="text-xs font-semibold">{busy ? '올리는 중...' : '사진 선택 / 촬영'}</span>
      {!busy && <span className="text-[10px] text-slate-400">JPG · PNG · HEIC, 10MB 이하</span>}
    </div>
  );

  return (
    <div>
      {props.label && <span className="block text-xs font-bold text-slate-700 mb-1">{props.label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple={props.multiple}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {props.multiple ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {props.value.map((url, index) => (
            <div key={url + index} className={`relative ${aspect} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group`}>
              <Image src={url} alt={`사진 ${index + 1}`} fill className="object-cover" sizes="200px" />
              <div className="absolute inset-x-0 bottom-0 p-1.5 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...props.value];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      props.onChange(next);
                    }}
                    className="p-1 rounded bg-white/90 text-slate-700 disabled:opacity-30"
                    aria-label="앞으로"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === props.value.length - 1}
                    onClick={() => {
                      const next = [...props.value];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      props.onChange(next);
                    }}
                    className="p-1 rounded bg-white/90 text-slate-700 disabled:opacity-30"
                    aria-label="뒤로"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => props.onChange(props.value.filter((_, i) => i !== index))}
                  className="p-1 rounded bg-red-600 text-white"
                  aria-label="사진 제거"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {(!props.max || props.value.length < props.max) && dropZone}
        </div>
      ) : props.value ? (
        <div className={`relative ${aspect} w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100`}>
          <Image src={props.value} alt="선택한 사진" fill className="object-cover" sizes="400px" />
          <div className="absolute inset-x-0 bottom-0 p-2 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-white/90 text-slate-800 text-[11px] font-bold"
            >
              바꾸기
            </button>
            <button
              type="button"
              onClick={() => props.onChange('')}
              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold"
            >
              제거
            </button>
          </div>
        </div>
      ) : (
        dropZone
      )}

      {props.hint && <span className="block text-[11px] text-slate-500 mt-1">{props.hint}</span>}
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </div>
  );
}
