// 상담 접수 이메일 알림.
//
// SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (/ SMTP_FROM / SMTP_SECURE) 환경변수가 있고
// 수신 주소(관리자 설정 notifyEmail 또는 NOTIFY_EMAIL 환경변수)가 있을 때만 보낸다.
// 설정이 없거나 전송에 실패해도 접수 자체는 이미 저장된 뒤이므로 로그만 남긴다.

import 'server-only';

import nodemailer from 'nodemailer';
import type { InquiryItem } from '@/lib/types';
import { getSiteSettings } from '@/lib/repository';

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === '1' || process.env.SMTP_SECURE === 'true' || port === 465;
  const from = process.env.SMTP_FROM?.trim() || user;
  return { host, port, secure, user, pass, from };
}

export function isNotifyConfigured(): boolean {
  return smtpConfig() !== null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function notifyNewInquiry(inquiry: InquiryItem): Promise<void> {
  const smtp = smtpConfig();
  if (!smtp) {
    console.warn('[notify] SMTP 설정이 없어 접수 알림 메일을 보내지 않았습니다. (.env 의 SMTP_* 참고)');
    return;
  }

  let to = process.env.NOTIFY_EMAIL?.trim() || '';
  let siteName = '준픽스';
  try {
    const settings = await getSiteSettings();
    if (settings.notifyEmail) to = settings.notifyEmail;
    siteName = settings.siteName || siteName;
  } catch {
    // 설정 조회 실패 시 환경변수 값으로 진행
  }

  if (!to) {
    console.warn('[notify] 수신 이메일이 없어 접수 알림 메일을 보내지 않았습니다. (관리자 > 기본 정보 > 접수 알림 이메일)');
    return;
  }

  const rows: [string, string][] = [
    ['접수 시각', inquiry.createdAt],
    ['성함', inquiry.customerName],
    ['연락처', inquiry.phoneNumber],
    ['지역', inquiry.region || '-'],
    ['서비스', inquiry.serviceType || '-'],
    ['희망 시간', inquiry.preferredTime || '-'],
    ['증상', inquiry.description || '-'],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Malgun Gothic',sans-serif;font-size:14px;color:#1e293b">
      <h2 style="margin:0 0 12px">[${escapeHtml(siteName)}] 새 상담 접수</h2>
      <table style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`
          )
          .join('')}
      </table>
      <p style="margin-top:16px"><a href="tel:${escapeHtml(inquiry.phoneNumber.replace(/[^0-9+]/g, ''))}" style="display:inline-block;padding:10px 16px;background:#0077b6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">고객에게 전화하기</a></p>
    </div>`;

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject: `[${siteName}] 새 상담 접수 - ${inquiry.serviceType || '문의'} (${inquiry.phoneNumber})`,
    text,
    html,
  });
}
