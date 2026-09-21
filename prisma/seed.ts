/**
 * 초기 데이터 적재 스크립트.
 *
 * data/junpiks_data.json (파일 저장소 시절의 실데이터)을 읽어 DB 로 옮긴다.
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

const SEED_KEY = 'initial-data-v1';

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

async function main() {
  /* 0. 관리자 계정 비밀번호 동기화 (매 배포마다) ------------------------- */
  const passwordHash = hashPassword(ADMIN_PASSWORD);
  await prisma.adminUser.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: { username: ADMIN_USERNAME, passwordHash, role: 'admin' },
  });
  console.log(`✔ 관리자 계정(${ADMIN_USERNAME}) 비밀번호 동기화 완료`);

  if (await alreadySeeded()) {
    console.log('✔ 초기 데이터는 이미 적재되어 있습니다. 건너뜁니다.');
    return;
  }

  console.log('🌱 초기 데이터 적재 시작...');
  const src = loadSource();

  /* 1. 사이트 설정 ------------------------------------------------------ */
  if ((await prisma.siteSetting.count()) === 0) {
    await prisma.siteSetting.create({ data: src?.settings ?? {} });
    console.log('✔ 사이트 설정 적재 완료');
  }

  /* 2. 서비스 ----------------------------------------------------------- */
  if ((await prisma.service.count()) === 0 && src?.services?.length) {
    for (const s of src.services) {
      await prisma.service.create({
        data: {
          slug: s.slug,
          category: s.category === 'aircon' ? 'aircon' : 'plumbing',
          title: s.title,
          subtitle: s.subtitle ?? '',
          iconName: s.iconName ?? '',
          symptoms: toJsonList(s.symptoms),
          causes: toJsonList(s.causes),
          inspectionMethod: s.inspectionMethod ?? '',
          workProcess: toJsonList(s.workProcess),
          equipment: toJsonList(s.equipment),
          orderNum: Number(s.orderNum) || 0,
          isActive: s.isActive !== false,
        },
      });
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

  /* 4. 시공사례 --------------------------------------------------------- */
  if ((await prisma.caseStudy.count()) === 0 && src?.caseStudies?.length) {
    // 목록 화면이 최신순이므로, 원본 배열의 앞쪽이 더 최근이 되도록 역순 삽입
    for (const c of [...src.caseStudies].reverse()) {
      await prisma.caseStudy.create({
        data: {
          title: c.title,
          serviceCategory: c.serviceCategory ?? '',
          region: c.region ?? '',
          symptom: c.symptom ?? '',
          cause: c.cause ?? '',
          solution: c.solution ?? '',
          equipment: c.equipment ?? '',
          beforeImageUrl: c.beforeImageUrl ?? '',
          afterImageUrl: c.afterImageUrl ?? '',
          naverBlogLink: c.naverBlogLink ?? '',
          date: c.date ?? '',
          isFeatured: Boolean(c.isFeatured),
        },
      });
    }
    console.log(`✔ 시공사례 ${src.caseStudies.length}건 적재 완료`);
  }

  /* 5. 후기 ------------------------------------------------------------- */
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

  /* 6. 상담 접수 -------------------------------------------------------- */
  if ((await prisma.inquiry.count()) === 0 && src?.inquiries?.length) {
    for (const i of [...src.inquiries].reverse()) {
      await prisma.inquiry.create({
        data: {
          customerName: i.customerName,
          phoneNumber: i.phoneNumber ?? '',
          region: i.region ?? '',
          serviceType: i.serviceType ?? '',
          description: i.description ?? '',
          preferredTime: i.preferredTime ?? '',
          status: i.status ?? '접수완료',
          memo: i.memo ?? '',
        },
      });
    }
    console.log(`✔ 상담 접수 ${src.inquiries.length}건 적재 완료`);
  }

  await prisma.seedState.create({ data: { key: SEED_KEY } });
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
