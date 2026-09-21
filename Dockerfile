# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# junpiks-web / Next.js 15 (App Router) + Prisma + MariaDB
# 멀티스테이지: deps -> builder -> (runner | migrator)
# ---------------------------------------------------------------------------

FROM node:20-alpine AS base
# libc6-compat: Next/SWC 네이티브 바이너리, openssl: Prisma 쿼리 엔진 요구사항
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- 1) 의존성 설치 (package-lock 변경 없으면 레이어 캐시 재사용) -----------
FROM base AS deps
COPY package.json package-lock.json ./
# postinstall 의 `prisma generate` 가 스키마를 필요로 함
COPY prisma ./prisma
# generate 단계는 실제 DB 에 접속하지 않지만 env 자리표시자는 있어야 함
ENV DATABASE_URL="mysql://build:build@127.0.0.1:3306/build"
RUN npm ci

# --- 2) 빌드 ----------------------------------------------------------------
FROM base AS builder
ENV DATABASE_URL="mysql://build:build@127.0.0.1:3306/build"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 3) 마이그레이션 실행기 --------------------------------------------------
# prisma CLI 와 ts-node 가 들어 있는 devDependencies 가 필요하므로 별도 스테이지로 둔다.
# compose 의 migrate 서비스가 이 이미지를 1회성으로 실행한다.
FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY prisma ./prisma
COPY scripts/wait-for-db.js ./scripts/wait-for-db.js
# 최초 1회 시딩 원본 (테이블이 비어 있을 때만 사용된다)
COPY data ./data
# MariaDB 초기화 중에는 TCP 가 아직 안 열려 있어 바로 붙으면 P1001 이 난다.
CMD ["sh", "-c", "node scripts/wait-for-db.js && npx prisma migrate deploy && npx prisma db seed"]

# --- 4) 런타임 --------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# standalone 산출물에는 public / .next/static 이 포함되지 않으므로 직접 복사
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma 쿼리 엔진(.so.node)은 Next 의 트레이싱에서 누락될 수 있어 명시적으로 넣는다.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
