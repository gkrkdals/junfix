// DB 접근 계층.
// 기존 lib/store.ts(JSON 파일)를 대체하며, API 응답 형태를 그대로 유지하기 위해
// Prisma 행 <-> 도메인 타입 변환을 여기서 모두 처리한다.

import 'server-only';

import { prisma } from '@/lib/prisma';
import type {
  CaseStudy,
  InquiryItem,
  InquiryStatus,
  PricingItem,
  ReviewItem,
  ServiceItem,
  SiteSettings,
} from '@/lib/types';

/* ------------------------------------------------------------------ */
/* 배열 <-> TEXT 코덱                                                   */
/* ------------------------------------------------------------------ */

/** TEXT 컬럼을 문자열 배열로. JSON 배열과 줄바꿈 구분 텍스트를 모두 허용한다. */
function decodeList(raw: string | null | undefined): string[] {
  if (!raw) return [];

  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v)).filter((v) => v.length > 0);
      }
    } catch {
      // JSON 이 아니면 아래 줄바꿈 분리로 넘어간다
    }
  }

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function encodeList(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map((v) => String(v)));
  if (typeof value === 'string') return JSON.stringify(decodeList(value));
  return '[]';
}

/** 기존 JSON 파일 구현이 쓰던 표기를 유지한다. 예: "2026. 9. 21. 오전 10:15" */
function formatSeoulTimestamp(value: Date): string {
  return value.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

/* ------------------------------------------------------------------ */
/* 사이트 설정 (단일 행)                                                 */
/* ------------------------------------------------------------------ */

const SETTINGS_FIELDS = [
  'siteName',
  'tagline',
  'representativeName',
  'phoneNumber',
  'telNumber',
  'kakaoTalkUrl',
  'naverBlogUrl',
  'serviceAreas',
  'businessNumber',
  'address',
] as const;

function toSiteSettings(row: Record<string, unknown>): SiteSettings {
  const out = {} as SiteSettings;
  for (const key of SETTINGS_FIELDS) {
    out[key] = String(row[key] ?? '');
  }
  return out;
}

/** 설정 행이 없으면 스키마 기본값으로 한 건 만들어 반환한다. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const existing = await prisma.siteSetting.findFirst({ orderBy: { id: 'asc' } });
  if (existing) return toSiteSettings(existing);

  const created = await prisma.siteSetting.create({ data: {} });
  return toSiteSettings(created);
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await prisma.siteSetting.findFirst({ orderBy: { id: 'asc' } });

  // 알 수 없는 키가 넘어와도 스키마 밖 값이 들어가지 않도록 화이트리스트로 거른다.
  const data: Record<string, string> = {};
  for (const key of SETTINGS_FIELDS) {
    const value = patch[key];
    if (typeof value === 'string') data[key] = value;
  }

  const saved = current
    ? await prisma.siteSetting.update({ where: { id: current.id }, data })
    : await prisma.siteSetting.create({ data });

  return toSiteSettings(saved);
}

/* ------------------------------------------------------------------ */
/* 서비스                                                                */
/* ------------------------------------------------------------------ */

type ServiceRow = Awaited<ReturnType<typeof prisma.service.findFirstOrThrow>>;

function toServiceItem(row: ServiceRow): ServiceItem {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category === 'aircon' ? 'aircon' : 'plumbing',
    title: row.title,
    subtitle: row.subtitle,
    iconName: row.iconName,
    symptoms: decodeList(row.symptoms),
    causes: decodeList(row.causes),
    inspectionMethod: row.inspectionMethod,
    workProcess: decodeList(row.workProcess),
    equipment: decodeList(row.equipment),
    orderNum: row.orderNum,
    isActive: row.isActive,
  };
}

export async function listServices(options: { activeOnly?: boolean } = {}): Promise<ServiceItem[]> {
  const rows = await prisma.service.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ orderNum: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toServiceItem);
}

/* ------------------------------------------------------------------ */
/* 시공사례                                                              */
/* ------------------------------------------------------------------ */

type CaseRow = Awaited<ReturnType<typeof prisma.caseStudy.findFirstOrThrow>>;

function toCaseStudy(row: CaseRow): CaseStudy {
  return {
    id: row.id,
    title: row.title,
    serviceCategory: row.serviceCategory,
    region: row.region,
    symptom: row.symptom,
    cause: row.cause,
    solution: row.solution,
    equipment: row.equipment,
    beforeImageUrl: row.beforeImageUrl,
    afterImageUrl: row.afterImageUrl,
    naverBlogLink: row.naverBlogLink,
    date: row.date,
    isFeatured: row.isFeatured,
  };
}

/** 최신 등록분이 앞에 오도록 정렬 (기존 unshift 동작과 동일) */
export async function listCaseStudies(): Promise<CaseStudy[]> {
  const rows = await prisma.caseStudy.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toCaseStudy);
}

export async function createCaseStudy(input: Record<string, unknown>): Promise<CaseStudy> {
  const row = await prisma.caseStudy.create({
    data: {
      title: String(input.title ?? ''),
      serviceCategory: String(input.serviceCategory ?? ''),
      region: String(input.region ?? ''),
      symptom: String(input.symptom ?? ''),
      cause: String(input.cause ?? ''),
      solution: String(input.solution ?? ''),
      equipment: String(input.equipment ?? ''),
      beforeImageUrl: String(input.beforeImageUrl || '/images/junfix_main_poster.jpg'),
      afterImageUrl: String(input.afterImageUrl || '/images/junfix_pricing_table.jpg'),
      naverBlogLink: String(input.naverBlogLink || 'https://blog.naver.com/'),
      date: String(input.date || new Date().toISOString().split('T')[0]),
      isFeatured: Boolean(input.isFeatured),
    },
  });
  return toCaseStudy(row);
}

const CASE_TEXT_FIELDS = [
  'title',
  'serviceCategory',
  'region',
  'symptom',
  'cause',
  'solution',
  'equipment',
  'beforeImageUrl',
  'afterImageUrl',
  'naverBlogLink',
  'date',
] as const;

/** 존재하지 않으면 null. 넘어온 필드만 부분 갱신한다. */
export async function updateCaseStudy(
  id: number,
  patch: Record<string, unknown>
): Promise<CaseStudy | null> {
  const data: Record<string, unknown> = {};
  for (const key of CASE_TEXT_FIELDS) {
    if (patch[key] !== undefined) data[key] = String(patch[key] ?? '');
  }
  if (patch.isFeatured !== undefined) data.isFeatured = Boolean(patch.isFeatured);

  const exists = await prisma.caseStudy.findUnique({ where: { id } });
  if (!exists) return null;

  const row = await prisma.caseStudy.update({ where: { id }, data });
  return toCaseStudy(row);
}

export async function deleteCaseStudy(id: number): Promise<void> {
  await prisma.caseStudy.deleteMany({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* 가격표                                                                */
/* ------------------------------------------------------------------ */

type PricingRow = Awaited<ReturnType<typeof prisma.pricingItem.findFirstOrThrow>>;

function toPricingItem(row: PricingRow): PricingItem {
  return {
    id: row.id,
    serviceName: row.serviceName,
    category: row.category === 'quote' ? 'quote' : 'fixed',
    priceDisplay: row.priceDisplay,
    description: row.description,
    notice: row.notice || undefined,
    orderNum: row.orderNum,
  };
}

export async function listPricing(options: { activeOnly?: boolean } = {}): Promise<PricingItem[]> {
  const rows = await prisma.pricingItem.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ orderNum: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toPricingItem);
}

function pricingWriteData(input: Record<string, unknown>) {
  return {
    serviceName: String(input.serviceName ?? ''),
    category: input.category === 'quote' ? 'quote' : 'fixed',
    priceDisplay: String(input.priceDisplay ?? ''),
    description: String(input.description ?? ''),
    notice: String(input.notice ?? ''),
    orderNum: Number(input.orderNum) || 0,
  };
}

/**
 * 관리자 화면은 가격표 전체 배열을 한 번에 보낸다.
 * id 가 있으면 갱신, 없으면 신규 생성. 목록에서 빠진 행은 건드리지 않는다.
 */
export async function savePricing(input: unknown): Promise<PricingItem[]> {
  const items = Array.isArray(input) ? input : [input];

  await prisma.$transaction(
    items
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => {
        const id = Number(item.id);
        const data = pricingWriteData(item);
        return Number.isInteger(id) && id > 0
          ? prisma.pricingItem.upsert({ where: { id }, update: data, create: { id, ...data } })
          : prisma.pricingItem.create({ data });
      })
  );

  return listPricing();
}

/* ------------------------------------------------------------------ */
/* 후기                                                                  */
/* ------------------------------------------------------------------ */

type ReviewRow = Awaited<ReturnType<typeof prisma.review.findFirstOrThrow>>;

function toReviewItem(row: ReviewRow): ReviewItem {
  return {
    id: row.id,
    customerName: row.customerName,
    region: row.region,
    serviceType: row.serviceType,
    rating: row.rating,
    comment: row.comment,
    date: row.date,
  };
}

export async function listReviews(options: { activeOnly?: boolean } = {}): Promise<ReviewItem[]> {
  const rows = await prisma.review.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toReviewItem);
}

export async function createReview(input: Record<string, unknown>): Promise<ReviewItem> {
  const rating = Number(input.rating);

  const row = await prisma.review.create({
    data: {
      customerName: String(input.customerName || '고객님'),
      region: String(input.region || '경기/수도권'),
      serviceType: String(input.serviceType || '하수구 설비'),
      rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? Math.trunc(rating) : 5,
      comment: String(input.comment ?? ''),
      date: String(input.date || new Date().toISOString().split('T')[0]),
    },
  });
  return toReviewItem(row);
}

export async function deleteReview(id: number): Promise<void> {
  await prisma.review.deleteMany({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* 상담 접수                                                             */
/* ------------------------------------------------------------------ */

const INQUIRY_STATUSES: InquiryStatus[] = ['접수완료', '상담진행중', '출동예약', '시공완료'];

type InquiryRow = Awaited<ReturnType<typeof prisma.inquiry.findFirstOrThrow>>;

function toInquiryItem(row: InquiryRow): InquiryItem {
  return {
    id: row.id,
    customerName: row.customerName,
    phoneNumber: row.phoneNumber,
    region: row.region,
    serviceType: row.serviceType,
    description: row.description,
    preferredTime: row.preferredTime,
    status: (INQUIRY_STATUSES as string[]).includes(row.status)
      ? (row.status as InquiryStatus)
      : '접수완료',
    memo: row.memo,
    createdAt: formatSeoulTimestamp(row.createdAt),
  };
}

/** 최근 접수가 맨 위 (기존 unshift 동작과 동일) */
export async function listInquiries(): Promise<InquiryItem[]> {
  const rows = await prisma.inquiry.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toInquiryItem);
}

export async function createInquiry(input: Record<string, unknown>): Promise<InquiryItem> {
  const row = await prisma.inquiry.create({
    data: {
      customerName: String(input.customerName || '익명 고객'),
      phoneNumber: String(input.phoneNumber ?? ''),
      region: String(input.region || '경기/수도권'),
      serviceType: String(input.serviceType || '하수구 막힘'),
      description: String(input.description ?? ''),
      preferredTime: String(input.preferredTime || '최대한 빠른 상담 희망'),
      status: '접수완료',
      memo: '',
    },
  });
  return toInquiryItem(row);
}

export async function updateInquiry(
  id: number,
  patch: { status?: unknown; memo?: unknown }
): Promise<InquiryItem | null> {
  const data: { status?: string; memo?: string } = {};

  if (typeof patch.status === 'string' && (INQUIRY_STATUSES as string[]).includes(patch.status)) {
    data.status = patch.status;
  }
  if (patch.memo !== undefined) {
    data.memo = String(patch.memo ?? '');
  }

  const exists = await prisma.inquiry.findUnique({ where: { id } });
  if (!exists) return null;

  const row = await prisma.inquiry.update({ where: { id }, data });
  return toInquiryItem(row);
}

/* ------------------------------------------------------------------ */
/* 관리자                                                                */
/* ------------------------------------------------------------------ */

export async function findAdminByUsername(username: string) {
  return prisma.adminUser.findUnique({ where: { username } });
}

export { encodeList, decodeList };
