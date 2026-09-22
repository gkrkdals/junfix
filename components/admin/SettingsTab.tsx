'use client';

import React, { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import { api, Button, Card, Field, inputClass } from './ui';
import ImageUploader from './ImageUploader';

interface Props {
  settings: SiteSettings;
  reload: () => Promise<void>;
  toast: (msg: string) => void;
}

export default function SettingsTab({ settings, reload, toast }: Props) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('PUT', '/api/settings', form);
      toast('기본 정보를 저장했습니다. 홈페이지에 바로 반영됩니다.');
      await reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const text = (key: keyof SiteSettings, placeholder = '') => (
    <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inputClass} />
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="sticky top-[72px] z-10 flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={() => setForm(settings)}>
          <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
        </Button>
        <Button type="submit" disabled={!dirty || saving}>
          <Save className="w-3.5 h-3.5" /> {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <Card title="업체 정보" description="전화번호를 바꾸면 홈페이지의 모든 전화 버튼과 표시가 함께 바뀝니다.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="상호명">{text('siteName')}</Field>
          <Field label="대표자명">{text('representativeName')}</Field>
          <Field label="대표 전화번호" hint="전화·문자 버튼에 쓰입니다. 예: 010-2703-1491">
            {text('phoneNumber', '010-0000-0000')}
          </Field>
          <Field label="이메일 (홈페이지 표시용, 선택)">{text('email', 'example@naver.com')}</Field>
          <Field label="사업자등록번호 (선택)" hint="비워두면 표시하지 않습니다.">
            {text('businessNumber')}
          </Field>
          <Field label="주소 (선택)" hint="비워두면 표시하지 않습니다.">
            {text('address')}
          </Field>
          <Field label="대표 문구" hint="메인 화면 상단에 표시됩니다." className="sm:col-span-2">
            {text('tagline')}
          </Field>
          <Field label="상담 가능 시간" hint="예: 평일·주말 24시간 상담 가능">
            {text('businessHours')}
          </Field>
          <Field label="서비스 가능 지역 목록" hint="한 줄에 한 지역씩. '서비스 가능지역' 영역에 목록으로 표시됩니다." className="sm:col-span-2">
            <textarea rows={5} value={form.serviceAreaList} onChange={(e) => set('serviceAreaList', e.target.value)} className={inputClass} placeholder={'수원\n용인\n성남'} />
          </Field>
        </div>
      </Card>

      <Card title="연결 채널" description="비워두면 해당 버튼은 홈페이지에 표시되지 않습니다.">
        <div className="grid grid-cols-1 gap-4">
          <Field label="카카오톡 채널 / 오픈채팅 주소" hint="카카오톡 채널 관리자센터 > 채널 URL, 또는 오픈채팅방 링크 (https://open.kakao.com/...)">
            {text('kakaoTalkUrl', 'https://pf.kakao.com/...')}
          </Field>
          <Field label="네이버 블로그 주소" hint="예: https://blog.naver.com/아이디">
            {text('naverBlogUrl', 'https://blog.naver.com/...')}
          </Field>
        </div>
      </Card>

      <Card title="로고 · 메인 이미지">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ImageUploader label="로고 (선택)" value={form.logoImageUrl} onChange={(url) => set('logoImageUrl', url)} aspect="aspect-[3/1]" hint="비워두면 JUNFIX 글자 로고가 표시됩니다. 가로로 긴 투명 배경 PNG 권장." />
          <ImageUploader label="메인 화면 이미지" value={form.heroImageUrl} onChange={(url) => set('heroImageUrl', url)} aspect="aspect-square" hint="첫 화면 오른쪽 이미지. 비워두면 기본 포스터가 표시됩니다. 작업 차량이나 현장 사진을 권장합니다." />
        </div>
      </Card>

      <Card title="상담 접수 알림" description="홈페이지 상담 신청이 들어오면 이 주소로 메일을 보냅니다. 서버에 메일 발송(SMTP) 설정이 되어 있어야 합니다. (DEPLOY.md 참고)">
        <Field label="알림 받을 이메일">{text('notifyEmail', 'example@naver.com')}</Field>
      </Card>

      <Card title="검색엔진 등록 · 광고 전환 측정" description="각 서비스에서 발급받은 ID/코드를 붙여 넣으면 자동으로 적용됩니다. 모르면 비워두세요.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="홈페이지 주소" hint="사이트맵과 검색 등록에 쓰입니다. 예: https://junfix.co.kr">
            {text('siteUrl', 'https://')}
          </Field>
          <div />
          <Field label="네이버 서치어드바이저 사이트 인증 코드" hint="서치어드바이저 > 사이트 등록 > HTML 태그 방식의 content 값만 붙여 넣기">
            {text('naverSiteVerification')}
          </Field>
          <Field label="구글 서치콘솔 사이트 인증 코드" hint="서치콘솔 > HTML 태그 방식의 content 값만 붙여 넣기">
            {text('googleSiteVerification')}
          </Field>
          <Field label="구글 애널리틱스 4 측정 ID" hint="예: G-XXXXXXXXXX. 전화·문자·카톡 클릭과 상담 신청이 이벤트로 기록됩니다.">
            {text('gaMeasurementId', 'G-')}
          </Field>
          <Field label="구글 태그 매니저 ID (선택)" hint="예: GTM-XXXXXXX. 태그 매니저로 관리할 때만 입력">
            {text('gtmId', 'GTM-')}
          </Field>
          <Field label="네이버 애널리틱스 ID (선택)" hint="네이버 애널리틱스 > 사이트 등록 후 발급되는 ID">
            {text('naverAnalyticsId')}
          </Field>
          <Field label="구글 애즈 전환 (선택)" hint="구글 애즈 > 전환 > 태그 설정의 send_to 값. 예: AW-123456789/AbC-D_efGhIjKlMnOp">
            {text('googleAdsSendTo', 'AW-')}
          </Field>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          기록되는 이벤트: <b>call_click</b>(전화), <b>sms_click</b>(문자), <b>kakao_click</b>(카카오톡), <b>blog_click</b>(블로그), <b>inquiry_submit</b>(상담 신청).
          구글 애널리틱스에서 이 이벤트를 "전환"으로 표시하면 광고 성과를 확인할 수 있습니다.
        </div>
      </Card>
    </form>
  );
}
