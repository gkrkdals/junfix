/**
 * 초기 데이터 적재 스크립트.
 *
 * data/junpiks_data.json 을 읽어 DB 로 옮긴다.
 * 다른 경로의 파일을 쓰려면 SEED_SOURCE 환경변수로 지정한다.
 *
 * 데이터 적재는 seed_state 마커로 딱 한 번만 수행한다.
 * "테이블이 비어 있으면 채운다" 로 하면 관리자가 UI 에서 전부 지운 데이터가
 * 다음 배포 때 되살아나므로, 지운 상태를 존중하려면 마커가 필요하다.
 *
 * 관리자 계정 비밀번호만 예외로 매번 .env 의 ADMIN_PASSWORD 로 동기화한다
 * (비밀번호 변경 UI 가 없어서 .env 가 유일한 변경 수단이다).
 */

import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'junpiks';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'junp1325@@';

function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString('hex')}:${scryptSync(plain, salt, 64).toString('hex')}`;
}

function toJsonList(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map(String));
  if (typeof value === 'string' && value.trim()) {
    return JSON.stringify(
      value
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  return '[]';
}

function loadSource(): any | null {
  const file = process.env.SEED_SOURCE || path.join(process.cwd(), 'data', 'junpiks_data.json');
  if (!fs.existsSync(file)) {
    console.warn(`⚠ 시드 원본을 찾을 수 없습니다: ${file}`);
    return null;
  }
  console.log(`📄 시드 원본: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function serviceData(s: any) {
  return {
    category: s.category === 'aircon' ? 'aircon' : 'plumbing',
    title: s.title,
    subtitle: s.subtitle ?? '',
    iconName: s.iconName ?? '',
    symptoms: toJsonList(s.symptoms),
    causes: toJsonList(s.causes),
    inspectionMethod: s.inspectionMethod ?? '',
    workProcess: toJsonList(s.workProcess),
    equipment: toJsonList(s.equipment),
    imageUrl: s.imageUrl ?? '',
    orderNum: Number(s.orderNum) || 0,
    isActive: s.isActive !== false,
  };
}

const SEED_KEY = 'initial-data-v1';
const CLEANUP_KEY = 'content-cleanup-v2';

/** 데이터 적재를 이미 했는지 판단한다. */
async function alreadySeeded(): Promise<boolean> {
  if (await prisma.seedState.findUnique({ where: { key: SEED_KEY } })) {
    return true;
  }

  // 마커 도입 이전에 적재된 DB 라면, 데이터가 있는 것을 보고 마커만 남긴다.
  const existing =
    (await prisma.service.count()) +
    (await prisma.pricingItem.count()) +
    (await prisma.caseStudy.count()) +
    (await prisma.review.count()) +
    (await prisma.siteSetting.count());

  if (existing > 0) {
    await prisma.seedState.create({ data: { key: SEED_KEY } });
    console.log('ℹ 기존 데이터를 확인하여 시드 마커만 기록했습니다.');
    return true;
  }

  return false;
}

/**
 * v1 시드로 이미 적재된 DB 정리 (1회).
 * - 예시용 가상 시공사례/후기/접수 삭제
 * - 자리표시 사업자번호·카톡·블로그 URL 비우기
 * - 서비스 문구를 새 원본으로 갱신, 빠진 서비스(배관공사) 추가
 */
async function cleanupLegacyContent(src: any | null) {
  if (await prisma.seedState.findUnique({ where: { key: CLEANUP_KEY } })) return;

  const sampleCaseTitles = [
    '역삼동 빌라 싱크대 역류 배관 스케일링 완벽 해결',
    '수원 영통구 아파트 욕실 바닥 하수구 머리카락·석회 제거',
    '부천 상동 신축 상가 식당 주방 메인관 고압세척 통수',
    '성남 분당구 노후 양변기 흔들림 및 냄새 치마형 변기 신규 교체',
    '인천 연수구 송도동 아파트 아래층 천장 누수탐지 및 배관 수리',
  ];
  const sampleReviewNames = ['이*현 고객님', '박*철 대표님', '최*영 고객님', '정*훈 고객님'];
  const sampleInquiryNames = ['테스트고객', '홍길동'];

  const removedCases = await prisma.caseStudy.deleteMany({
    where: { title: { in: sampleCaseTitles }, beforeImageUrl: '/images/junfix_main_poster.jpg' },
  });
  const removedReviews = await prisma.review.deleteMany({
    where: { customerName: { in: sampleReviewNames } },
  });
  const removedInquiries = await prisma.inquiry.deleteMany({
    where: { customerName: { in: sampleInquiryNames }, phoneNumber: { in: ['010-0000-0000', '010-1234-5678'] } },
  });

  const settings = await prisma.siteSetting.findFirst({ orderBy: { id: 'asc' } });
  if (settings) {
    const patch: Record<string, string> = {};
    if (settings.businessNumber === '123-45-67890') patch.businessNumber = '';
    if (settings.kakaoTalkUrl === 'https://open.kakao.com/me/junfix') patch.kakaoTalkUrl = '';
    if (settings.naverBlogUrl === 'https://blog.naver.com/junfix_official') patch.naverBlogUrl = '';
    if (settings.address === '경기 및 수도권 전지역 긴급출동 대기') patch.address = '';
    if (settings.tagline.includes('젊은 기술')) patch.tagline = '막힘은 해결하고, 일상은 흐르게';
    if (!settings.serviceAreaList && src?.settings?.serviceAreaList) {
      patch.serviceAreaList = src.settings.serviceAreaList;
    }
    if (!settings.notifyEmail && src?.settings?.notifyEmail) {
      patch.notifyEmail = src.settings.notifyEmail;
    }
    if (Object.keys(patch).length) {
      await prisma.siteSetting.update({ where: { id: settings.id }, data: patch });
    }
  }

  let touchedServices = 0;
  for (const s of src?.services ?? []) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    const data = serviceData(s);
    if (existing) {
      // 사진은 관리자가 올렸을 수 있으니 유지한다.
      const { imageUrl: _ignored, ...text } = data;
      await prisma.service.update({ where: { id: existing.id }, data: text });
    } else {
      await prisma.service.create({ data: { ...data, slug: s.slug } });
    }
    touchedServices += 1;
  }

  await prisma.seedState.create({ data: { key: CLEANUP_KEY } });
  console.log(
    `🧹 기존 콘텐츠 정리: 예시 시공사례 ${removedCases.count}건, 예시 후기 ${removedReviews.count}건, ` +
      `예시 접수 ${removedInquiries.count}건 삭제, 서비스 ${touchedServices}건 갱신`
  );
}

async function main() {
  /* 0. 관리자 계정 비밀번호 동기화 (매 배포마다) ------------------------- */
  const passwordHash = hashPassword(ADMIN_PASSWORD);
  await prisma.adminUser.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: { username: ADMIN_USERNAME, passwordHash, role: 'admin' },
  });
  console.log(`✔ 관리자 계정(${ADMIN_USERNAME}) 비밀번호 동기화 완료`);

  const src = loadSource();

  if (await alreadySeeded()) {
    console.log('✔ 초기 데이터는 이미 적재되어 있습니다. 건너뜁니다.');
    await cleanupLegacyContent(src);
    return;
  }

  console.log('🌱 초기 데이터 적재 시작...');

  /* 1. 사이트 설정 ------------------------------------------------------ */
  if ((await prisma.siteSetting.count()) === 0) {
    await prisma.siteSetting.create({ data: src?.settings ?? {} });
    console.log('✔ 사이트 설정 적재 완료');
  }

  /* 2. 서비스 ----------------------------------------------------------- */
  if ((await prisma.service.count()) === 0 && src?.services?.length) {
    for (const s of src.services) {
      await prisma.service.create({ data: { ...serviceData(s), slug: s.slug } });
    }
    console.log(`✔ 서비스 ${src.services.length}건 적재 완료`);
  }

  /* 3. 가격표 ----------------------------------------------------------- */
  if ((await prisma.pricingItem.count()) === 0 && src?.pricing?.length) {
    for (const p of src.pricing) {
      await prisma.pricingItem.create({
        data: {
          serviceName: p.serviceName,
          category: p.category === 'quote' ? 'quote' : 'fixed',
          priceDisplay: p.priceDisplay ?? '',
          description: p.description ?? '',
          notice: p.notice ?? '',
          orderNum: Number(p.orderNum) || 0,
        },
      });
    }
    console.log(`✔ 가격표 ${src.pricing.length}건 적재 완료`);
  }

  /* 4. 시공사례 (원본에 있을 때만) --------------------------------------- */
  if ((await prisma.caseStudy.count()) === 0 && src?.caseStudies?.length) {
    for (const c of [...src.caseStudies].reverse()) {
      await prisma.caseStudy.create({
        data: {
          title: c.title,
          serviceCategory: c.serviceCategory ?? '',
          region: c.region ?? '',
          symptom: c.symptom ?? '',
          cause: c.cause ?? '',
          workProcess: c.workProcess ?? '',
          solution: c.solution ?? '',
          equipment: c.equipment ?? '',
          beforeImageUrl: c.beforeImageUrl ?? '',
          afterImageUrl: c.afterImageUrl ?? '',
          processImages: toJsonList(c.processImages),
          naverBlogLink: c.naverBlogLink ?? '',
          date: c.date ?? '',
          isFeatured: Boolean(c.isFeatured),
        },
      });
    }
    console.log(`✔ 시공사례 ${src.caseStudies.length}건 적재 완료`);
  }

  /* 5. 후기 (원본에 있을 때만) ------------------------------------------- */
  if ((await prisma.review.count()) === 0 && src?.reviews?.length) {
    for (const r of [...src.reviews].reverse()) {
      await prisma.review.create({
        data: {
          customerName: r.customerName,
          region: r.region ?? '',
          serviceType: r.serviceType ?? '',
          rating: Number(r.rating) || 5,
          comment: r.comment ?? '',
          date: r.date ?? '',
        },
      });
    }
    console.log(`✔ 후기 ${src.reviews.length}건 적재 완료`);
  }

  await prisma.seedState.create({ data: { key: SEED_KEY } });
  await prisma.seedState.create({ data: { key: CLEANUP_KEY } });
  console.log('🎉 초기 데이터 적재 완료 (다음 배포부터는 건너뜁니다)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
