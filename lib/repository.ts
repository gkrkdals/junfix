// DB 접근 계층.
// API 응답 형태를 그대로 유지하기 위해 Prisma 행 <-> 도메인 타입 변환을 여기서 모두 처리한다.

import 'server-only';

import { prisma } from '@/lib/prisma';
import type {
  CaseStudy,
  InquiryItem,
  InquiryStatus,
  MediaAsset,
  PricingItem,
  ReviewItem,
  ServiceItem,
  SitePhoto,
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
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((v) => String(v).trim()).filter((v) => v.length > 0));
  }
  if (typeof value === 'string') return JSON.stringify(decodeList(value));
  return '[]';
}

/** 기존 JSON 파일 구현이 쓰던 표기를 유지한다. 예: "2026. 9. 21. 오전 10:15" */
function formatSeoulTimestamp(value: Date): string {
  return value.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

function str(value: unknown, fallback = ''): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
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
  'businessNumber',
  'address',
  'siteUrl',
  'email',
  'businessHours',
  'serviceAreaList',
  'logoImageUrl',
  'heroImageUrl',
  'notifyEmail',
  'gaMeasurementId',
  'gtmId',
  'naverAnalyticsId',
  'googleAdsSendTo',
  'naverSiteVerification',
  'googleSiteVerification',
] as const;

function toSiteSettings(row: Record<string, unknown>): SiteSettings {
  const out = {} as SiteSettings;
  for (const key of SETTINGS_FIELDS) {
    out[key] = str(row[key]).trim();
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
    if (typeof value === 'string') data[key] = value.trim();
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
    imageUrl: row.imageUrl,
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

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `service-${Date.now()}`;
}

function serviceWriteData(input: Record<string, unknown>) {
  return {
    category: input.category === 'aircon' ? 'aircon' : 'plumbing',
    title: str(input.title).trim(),
    subtitle: str(input.subtitle).trim(),
    iconName: str(input.iconName, 'Wrench').trim() || 'Wrench',
    symptoms: encodeList(input.symptoms),
    causes: encodeList(input.causes),
    inspectionMethod: str(input.inspectionMethod).trim(),
    workProcess: encodeList(input.workProcess),
    equipment: encodeList(input.equipment),
    imageUrl: str(input.imageUrl).trim(),
    orderNum: Number(input.orderNum) || 0,
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
  };
}

export async function createService(input: Record<string, unknown>): Promise<ServiceItem> {
  const data = serviceWriteData(input);
  let slug = str(input.slug).trim() || slugify(data.title);

  // slug 중복이면 뒤에 숫자를 붙인다.
  const taken = await prisma.service.findUnique({ where: { slug } });
  if (taken) slug = `${slug}-${Date.now().toString(36)}`;

  const row = await prisma.service.create({ data: { ...data, slug } });
  return toServiceItem(row);
}

export async function updateService(
  id: number,
  patch: Record<string, unknown>
): Promise<ServiceItem | null> {
  const exists = await prisma.service.findUnique({ where: { id } });
  if (!exists) return null;

  const full = serviceWriteData(patch);
  // 넘어온 필드만 갱신한다.
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(full) as (keyof typeof full)[]) {
    if (patch[key] !== undefined) data[key] = full[key];
  }

  const row = await prisma.service.update({ where: { id }, data });
  return toServiceItem(row);
}

export async function deleteService(id: number): Promise<void> {
  await prisma.service.deleteMany({ where: { id } });
}

/** 관리자 목록 화면의 순서를 그대로 저장한다. */
export async function reorderServices(ids: number[]): Promise<void> {
  await prisma.$transaction(
    ids.map((id, index) => prisma.service.updateMany({ where: { id }, data: { orderNum: index } }))
  );
}

/* ------------------------------------------------------------------ */
/* 시공사례                                                              */
/* ------------------------------------------------------------------ */

type CaseRow = Awaited<ReturnType<typeof prisma.caseStudy.findFirstOrThrow>>;

function toCaseStudy(row: CaseRow): CaseStudy {
  return {
    id: row.id,
    serviceId: row.serviceId,
    title: row.title,
    serviceCategory: row.serviceCategory,
    region: row.region,
    symptom: row.symptom,
    cause: row.cause,
    workProcess: row.workProcess,
    solution: row.solution,
    equipment: row.equipment,
    beforeImageUrl: row.beforeImageUrl,
    afterImageUrl: row.afterImageUrl,
    processImages: decodeList(row.processImages),
    naverBlogLink: row.naverBlogLink,
    date: row.date,
    isFeatured: row.isFeatured,
  };
}

/** 최신 등록분이 앞에 오도록 정렬 */
export async function listCaseStudies(): Promise<CaseStudy[]> {
  const rows = await prisma.caseStudy.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toCaseStudy);
}

function caseServiceId(input: Record<string, unknown>): number | null {
  const id = Number(input.serviceId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function createCaseStudy(input: Record<string, unknown>): Promise<CaseStudy> {
  const row = await prisma.caseStudy.create({
    data: {
      serviceId: caseServiceId(input),
      title: str(input.title).trim(),
      serviceCategory: str(input.serviceCategory).trim(),
      region: str(input.region).trim(),
      symptom: str(input.symptom).trim(),
      cause: str(input.cause).trim(),
      workProcess: str(input.workProcess).trim(),
      solution: str(input.solution).trim(),
      equipment: str(input.equipment).trim(),
      beforeImageUrl: str(input.beforeImageUrl).trim(),
      afterImageUrl: str(input.afterImageUrl).trim(),
      processImages: encodeList(input.processImages),
      naverBlogLink: str(input.naverBlogLink).trim(),
      date: str(input.date).trim() || todayISO(),
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
  'workProcess',
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
    if (patch[key] !== undefined) data[key] = str(patch[key]).trim();
  }
  if (patch.isFeatured !== undefined) data.isFeatured = Boolean(patch.isFeatured);
  if (patch.processImages !== undefined) data.processImages = encodeList(patch.processImages);
  if (patch.serviceId !== undefined) data.serviceId = caseServiceId(patch);

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
    notice: row.notice,
    orderNum: row.orderNum,
    isActive: row.isActive,
  };
}

export async function listPricing(options: { activeOnly?: boolean } = {}): Promise<PricingItem[]> {
  const rows = await prisma.pricingItem.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ orderNum: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toPricingItem);
}

function pricingWriteData(input: Record<string, unknown>, orderNum: number) {
  return {
    serviceName: str(input.serviceName).trim(),
    category: input.category === 'quote' ? 'quote' : 'fixed',
    priceDisplay: str(input.priceDisplay).trim(),
    description: str(input.description).trim(),
    notice: str(input.notice).trim(),
    orderNum,
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
  };
}

/**
 * 관리자 화면은 가격표 전체 목록을 한 번에 보낸다 (행 추가/삭제/순서 변경 포함).
 * - id 가 있는 항목은 갱신, 없는 항목은 신규 생성
 * - 목록에 없는 기존 행은 삭제
 * - orderNum 은 배열 순서로 다시 매긴다
 */
export async function syncPricing(input: unknown): Promise<PricingItem[]> {
  const items = (Array.isArray(input) ? input : [])
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .filter((item) => str(item.serviceName).trim().length > 0);

  const keepIds = items
    .map((item) => Number(item.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  await prisma.$transaction([
    prisma.pricingItem.deleteMany({ where: { id: { notIn: keepIds.length ? keepIds : [0] } } }),
    ...items.map((item, index) => {
      const id = Number(item.id);
      const data = pricingWriteData(item, index);
      return Number.isInteger(id) && id > 0
        ? prisma.pricingItem.upsert({ where: { id }, update: data, create: data })
        : prisma.pricingItem.create({ data });
    }),
  ]);

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
    isActive: row.isActive,
  };
}

export async function listReviews(options: { activeOnly?: boolean } = {}): Promise<ReviewItem[]> {
  const rows = await prisma.review.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toReviewItem);
}

function clampRating(value: unknown): number {
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? Math.trunc(rating) : 5;
}

export async function createReview(input: Record<string, unknown>): Promise<ReviewItem> {
  const row = await prisma.review.create({
    data: {
      customerName: str(input.customerName).trim() || '고객님',
      region: str(input.region).trim(),
      serviceType: str(input.serviceType).trim(),
      rating: clampRating(input.rating),
      comment: str(input.comment).trim(),
      date: str(input.date).trim() || todayISO(),
      isActive: input.isActive === undefined ? true : Boolean(input.isActive),
    },
  });
  return toReviewItem(row);
}

export async function updateReview(
  id: number,
  patch: Record<string, unknown>
): Promise<ReviewItem | null> {
  const exists = await prisma.review.findUnique({ where: { id } });
  if (!exists) return null;

  const data: Record<string, unknown> = {};
  for (const key of ['customerName', 'region', 'serviceType', 'comment', 'date'] as const) {
    if (patch[key] !== undefined) data[key] = str(patch[key]).trim();
  }
  if (patch.rating !== undefined) data.rating = clampRating(patch.rating);
  if (patch.isActive !== undefined) data.isActive = Boolean(patch.isActive);

  const row = await prisma.review.update({ where: { id }, data });
  return toReviewItem(row);
}

export async function deleteReview(id: number): Promise<void> {
  await prisma.review.deleteMany({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* 업체 사진 갤러리                                                       */
/* ------------------------------------------------------------------ */

type SitePhotoRow = Awaited<ReturnType<typeof prisma.sitePhoto.findFirstOrThrow>>;

function toSitePhoto(row: SitePhotoRow): SitePhoto {
  return {
    id: row.id,
    url: row.url,
    caption: row.caption,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

export async function listSitePhotos(options: { activeOnly?: boolean } = {}): Promise<SitePhoto[]> {
  const rows = await prisma.sitePhoto.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toSitePhoto);
}

export async function createSitePhoto(input: Record<string, unknown>): Promise<SitePhoto> {
  const last = await prisma.sitePhoto.findFirst({ orderBy: { sortOrder: 'desc' } });
  const row = await prisma.sitePhoto.create({
    data: {
      url: str(input.url).trim(),
      caption: str(input.caption).trim(),
      sortOrder: last ? last.sortOrder + 1 : 0,
      isActive: input.isActive === undefined ? true : Boolean(input.isActive),
    },
  });
  return toSitePhoto(row);
}

export async function updateSitePhoto(
  id: number,
  patch: Record<string, unknown>
): Promise<SitePhoto | null> {
  const exists = await prisma.sitePhoto.findUnique({ where: { id } });
  if (!exists) return null;

  const data: Record<string, unknown> = {};
  if (patch.caption !== undefined) data.caption = str(patch.caption).trim();
  if (patch.url !== undefined) data.url = str(patch.url).trim();
  if (patch.isActive !== undefined) data.isActive = Boolean(patch.isActive);
  if (patch.sortOrder !== undefined) data.sortOrder = Number(patch.sortOrder) || 0;

  const row = await prisma.sitePhoto.update({ where: { id }, data });
  return toSitePhoto(row);
}

export async function reorderSitePhotos(ids: number[]): Promise<void> {
  await prisma.$transaction(
    ids.map((id, index) => prisma.sitePhoto.updateMany({ where: { id }, data: { sortOrder: index } }))
  );
}

export async function deleteSitePhoto(id: number): Promise<void> {
  await prisma.sitePhoto.deleteMany({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* 업로드 파일 메타데이터                                                 */
/* ------------------------------------------------------------------ */

type MediaRow = Awaited<ReturnType<typeof prisma.mediaAsset.findFirstOrThrow>>;

function toMediaAsset(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    url: row.url,
    originalName: row.originalName,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    size: row.size,
    createdAt: formatSeoulTimestamp(row.createdAt),
  };
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const rows = await prisma.mediaAsset.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  return rows.map(toMediaAsset);
}

export async function createMediaAsset(input: {
  url: string;
  originalName: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}): Promise<MediaAsset> {
  const row = await prisma.mediaAsset.create({ data: input });
  return toMediaAsset(row);
}

export async function findMediaAsset(id: number): Promise<MediaAsset | null> {
  const row = await prisma.mediaAsset.findUnique({ where: { id } });
  return row ? toMediaAsset(row) : null;
}

export async function deleteMediaAsset(id: number): Promise<void> {
  await prisma.mediaAsset.deleteMany({ where: { id } });
}

/**
 * 업로드 파일이 어딘가에서 쓰이고 있는지 확인한다.
 * 관리자가 사용 중인 사진을 실수로 지우지 않도록 삭제 전에 호출한다.
 */
export async function mediaUsage(url: string): Promise<string[]> {
  const [cases, services, photos, settings] = await Promise.all([
    prisma.caseStudy.findMany({
      where: {
        OR: [
          { beforeImageUrl: url },
          { afterImageUrl: url },
          { processImages: { contains: url } },
        ],
      },
      select: { title: true },
    }),
    prisma.service.findMany({ where: { imageUrl: url }, select: { title: true } }),
    prisma.sitePhoto.findMany({ where: { url }, select: { id: true } }),
    prisma.siteSetting.findFirst({
      where: { OR: [{ logoImageUrl: url }, { heroImageUrl: url }] },
      select: { id: true },
    }),
  ]);

  return [
    ...cases.map((c) => `시공사례: ${c.title}`),
    ...services.map((s) => `서비스: ${s.title}`),
    ...(photos.length ? ['업체 사진 갤러리'] : []),
    ...(settings ? ['기본 정보 (로고/메인 이미지)'] : []),
  ];
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

/** 최근 접수가 맨 위 */
export async function listInquiries(): Promise<InquiryItem[]> {
  const rows = await prisma.inquiry.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toInquiryItem);
}

export async function createInquiry(input: Record<string, unknown>): Promise<InquiryItem> {
  const row = await prisma.inquiry.create({
    data: {
      customerName: str(input.customerName).trim() || '이름 미입력',
      phoneNumber: str(input.phoneNumber).trim(),
      region: str(input.region).trim(),
      serviceType: str(input.serviceType).trim(),
      description: str(input.description).trim(),
      preferredTime: str(input.preferredTime).trim(),
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
    data.memo = str(patch.memo);
  }

  const exists = await prisma.inquiry.findUnique({ where: { id } });
  if (!exists) return null;

  const row = await prisma.inquiry.update({ where: { id }, data });
  return toInquiryItem(row);
}

export async function deleteInquiry(id: number): Promise<void> {
  await prisma.inquiry.deleteMany({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* 관리자                                                                */
/* ------------------------------------------------------------------ */

export async function findAdminByUsername(username: string) {
  return prisma.adminUser.findUnique({ where: { username } });
}

export { encodeList, decodeList };
