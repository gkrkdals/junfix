'use client';

// 업체 정보(전화번호, 카톡, 블로그, 지역 등)를 화면 어디서든 읽을 수 있게 하는 컨텍스트.
// layout.tsx(서버)에서 DB 값을 읽어 넘겨준다. 관리자가 값을 바꾸면 다음 요청부터 반영된다.

import React, { createContext, useContext } from 'react';
import type { SiteSettings } from '@/lib/types';

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  const value = useContext(SiteSettingsContext);
  if (!value) {
    throw new Error('useSiteSettings 는 SiteSettingsProvider 안에서만 쓸 수 있습니다.');
  }
  return value;
}
