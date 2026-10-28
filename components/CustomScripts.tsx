'use client';

// 관리자 > 기본 정보의 "외부 설치 스크립트"(스마트로그 부정클릭방지 등)를 공개 페이지에 넣는다.
//  - 업체가 주는 <script> 코드를 그대로 붙여 넣는 칸이라 HTML 문자열을 받는다.
//  - innerHTML 로 넣은 <script> 는 실행되지 않으므로 script 요소를 새로 만들어 붙인다.
//  - 관리자 화면(/admin)에서는 넣지 않는다 (관리자 방문이 로그에 섞이지 않게).

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteSettings } from '@/components/SiteSettingsProvider';

export default function CustomScripts() {
  const { customScript } = useSiteSettings();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    const html = customScript.trim();
    if (!html || isAdmin) return;

    const template = document.createElement('template');
    template.innerHTML = html;

    const container = document.createElement('div');
    container.id = 'junpiks-custom-scripts';

    // 순서를 지키도록 외부 src 스크립트는 async=false 로 붙인다.
    for (const node of Array.from(template.content.childNodes)) {
      if (node instanceof HTMLScriptElement) {
        const script = document.createElement('script');
        for (const attr of Array.from(node.attributes)) script.setAttribute(attr.name, attr.value);
        if (node.src) script.async = node.hasAttribute('async');
        script.text = node.text;
        container.appendChild(script);
      } else {
        container.appendChild(node);
      }
    }

    document.body.appendChild(container);
    return () => container.remove();
  }, [customScript, isAdmin]);

  return null;
}
