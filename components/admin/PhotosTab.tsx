'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2, ArrowLeft, ArrowRight, Copy, RefreshCw, Save } from 'lucide-react';
import type { MediaAsset, SitePhoto } from '@/lib/types';
import { api, ApiError, Button, Card, Empty, inputClass, Toggle } from './ui';
import ImageUploader from './ImageUploader';

interface Props {
  photos: SitePhoto[];
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

function CaptionEditor({ photo, toast, reload }: { photo: SitePhoto; toast: (m: string) => void; reload: () => Promise<void> }) {
  const [caption, setCaption] = useState(photo.caption);
  const dirty = caption !== photo.caption;
  return (
    <div className="flex gap-1.5">
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="설명 (예: 작업 차량)" className={`${inputClass} text-xs py-1.5`} />
      <button
        disabled={!dirty}
        onClick={async () => {
          try {
            await api('PUT', '/api/site-photos', { id: photo.id, caption });
            toast('설명을 저장했습니다.');
            await reload();
          } catch (e) {
            toast(e instanceof Error ? e.message : '저장 실패');
          }
        }}
        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
        aria-label="설명 저장"
      >
        <Save className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PhotosTab({ photos, reload, toast }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const loadAssets = async () => {
    setLoadingAssets(true);
    try {
      setAssets(await api<MediaAsset[]>('GET', '/api/uploads'));
    } catch (e) {
      toast(e instanceof Error ? e.message : '목록 조회 실패');
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const addPhotos = async (urls: string[]) => {
    try {
      for (const url of urls) await api('POST', '/api/site-photos', { url });
      toast(`사진 ${urls.length}장을 갤러리에 추가했습니다.`);
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : '추가 실패');
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const ids = photos.map((p) => p.id);
    const t = index + dir;
    if (t < 0 || t >= ids.length) return;
    [ids[index], ids[t]] = [ids[t], ids[index]];
    await api('PUT', '/api/site-photos', { order: ids });
    await reload();
  };

  const removePhoto = async (p: SitePhoto) => {
    if (!confirm('갤러리에서 뺄까요? (업로드된 파일은 보관함에 남습니다)')) return;
    await api('DELETE', `/api/site-photos?id=${p.id}`);
    toast('갤러리에서 제거했습니다.');
    await reload();
  };

  const deleteAsset = async (a: MediaAsset) => {
    if (!confirm('이 파일을 완전히 삭제할까요?')) return;
    try {
      await api('DELETE', `/api/uploads?id=${a.id}`);
      toast('파일을 삭제했습니다.');
      await loadAssets();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const usedIn = ((e.data as { usedIn?: string[] })?.usedIn ?? []).join(', ');
        if (confirm(`이 사진은 아래에서 사용 중입니다:\n${usedIn}\n\n그래도 삭제하면 해당 화면에서 사진이 깨집니다. 삭제할까요?`)) {
          await api('DELETE', `/api/uploads?id=${a.id}&force=1`);
          toast('파일을 삭제했습니다.');
          await loadAssets();
        }
        return;
      }
      toast(e instanceof Error ? e.message : '삭제 실패');
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      toast('주소를 복사했습니다.');
    } catch {
      toast('복사에 실패했습니다. 주소: ' + url);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="업체 사진 갤러리"
        description="작업차량, 장비, 현장 사진을 올리면 홈페이지 '실제 작업 사례' 아래에 가로로 나열됩니다. 사진이 없으면 그 영역은 보이지 않습니다."
      >
        <div className="space-y-5">
          <ImageUploader multiple value={[]} onChange={addPhotos} label="사진 추가" hint="여러 장을 한 번에 선택할 수 있습니다." />

          {photos.length === 0 ? (
            <Empty>갤러리에 사진이 없습니다.</Empty>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p, index) => (
                <div key={p.id} className={`rounded-xl border overflow-hidden ${p.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image src={p.url} alt={p.caption || '업체 사진'} fill className="object-cover" sizes="240px" />
                  </div>
                  <div className="p-2 space-y-2">
                    <CaptionEditor photo={p} toast={toast} reload={reload} />
                    <div className="flex items-center justify-between">
                      <Toggle
                        checked={p.isActive}
                        onChange={async (v) => {
                          await api('PUT', '/api/site-photos', { id: p.id, isActive: v });
                          await reload();
                        }}
                        label="표시"
                      />
                      <div className="flex gap-0.5">
                        <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30" aria-label="앞으로">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => move(index, 1)} disabled={index === photos.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30" aria-label="뒤로">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => removePhoto(p)} className="p-1 rounded hover:bg-red-50 text-red-600" aria-label="제거">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card
        title="업로드 보관함"
        description="지금까지 올린 모든 사진입니다. 시공사례·서비스·갤러리·기본정보에서 쓰는 사진도 여기에 있습니다. 쓰지 않는 파일은 삭제해 용량을 정리할 수 있습니다."
        actions={
          <Button variant="ghost" onClick={loadAssets} disabled={loadingAssets}>
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAssets ? 'animate-spin' : ''}`} /> 새로고침
          </Button>
        }
      >
        {assets.length === 0 ? (
          <Empty>{loadingAssets ? '불러오는 중...' : '업로드된 파일이 없습니다.'}</Empty>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {assets.map((a) => (
              <div key={a.id} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <Image src={a.url} alt={a.originalName} fill className="object-cover" sizes="160px" />
                <div className="absolute inset-x-0 bottom-0 p-1 flex justify-between bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => copyUrl(a.url)} className="p-1 rounded bg-white/90 text-slate-700" aria-label="주소 복사" title="주소 복사">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteAsset(a)} className="p-1 rounded bg-red-600 text-white" aria-label="삭제" title="삭제">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="absolute top-1 left-1 text-[9px] bg-black/50 text-white px-1 rounded">{Math.round(a.size / 1024)}KB</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
