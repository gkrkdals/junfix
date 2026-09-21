# junpiks 배포 가이드

`main` 브랜치에 push 하면 GitHub Actions 가 서버에 SSH 로 접속해
소스를 내려받고 Docker 이미지를 빌드한 뒤 컨테이너를 교체한다.

```
개발자 push ──▶ GitHub Actions
                 ├─ build-check  : MariaDB 붙여서 migrate deploy + seed + next build
                 │                 (깨진 코드/마이그레이션 차단)
                 └─ deploy       : 서버 SSH → DB 덤프 백업 → git reset --hard
                                   → docker compose build → up -d
                                   → 헬스체크 실패 시 이전 커밋으로 자동 롤백
```

서버에서 `docker compose up -d` 가 뜨는 순서는 다음과 같다.

```
mariadb (healthy) ─▶ migrate (prisma migrate deploy + seed, 완료 후 종료)
                        └─▶ next-app (healthy) ─▶ nginx
```

## 구성

| 파일 | 역할 |
| --- | --- |
| `Dockerfile` | 멀티스테이지 이미지 (deps → builder → **runner** / **migrator**), 비루트 실행 |
| `docker-compose.yml` | nginx(80) → next-app(3000) → mariadb(3306) + 1회성 `migrate` |
| `prisma/schema.prisma` | DB 스키마 (테이블 7개) |
| `prisma/migrations/` | 마이그레이션 이력. **반드시 커밋한다** |
| `prisma/seed.ts` | 최초 1회 초기 데이터 적재 |
| `nginx/conf.d/` | 리버스 프록시 설정 |
| `.github/workflows/deploy.yml` | CI/CD 파이프라인 |
| `.env` | 서버/로컬에서 각각 직접 생성 (git 에 커밋되지 않음) |

---

## 1. 서버 최초 세팅 (1회만)

### 1-1. Docker 설치 확인

```bash
docker --version
docker compose version     # v2 이상 필요
```

### 1-2. 배포용 SSH 키 생성

**GitHub Actions → 서버** 접속용 키를 로컬에서 만든다.

```bash
ssh-keygen -t ed25519 -C "github-actions-junpiks" -f ~/.ssh/junpiks_deploy -N ""
```

공개키를 서버의 배포 계정에 등록한다.

```bash
ssh-copy-id -i ~/.ssh/junpiks_deploy.pub <배포계정>@<서버IP>
```

### 1-3. 서버 → GitHub 읽기 권한 (Deploy key)

서버가 `git pull` 을 하려면 저장소 읽기 권한이 필요하다. 서버에서:

```bash
ssh-keygen -t ed25519 -C "junpiks-server" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

출력된 공개키를 GitHub 저장소
**Settings → Deploy keys → Add deploy key** 에 등록한다 (write access 체크 **안 함**).

연결 확인:

```bash
ssh -T git@github.com     # "successfully authenticated" 문구가 나오면 성공
```

### 1-4. 소스 클론 + 환경변수 생성

```bash
sudo mkdir -p /opt/junpiks
sudo chown "$USER":"$USER" /opt/junpiks
git clone git@github.com:<계정>/<저장소>.git /opt/junpiks
cd /opt/junpiks

cp .env.example .env
vi .env        # 비밀번호를 실제 값으로 수정
```

> `.env` 는 gitignore 되어 있고 배포 스크립트도 건드리지 않으므로
> 최초 1회만 만들어 두면 이후 배포에서 그대로 유지된다.

### 1-5. 배포 계정에 docker 권한 부여

```bash
sudo usermod -aG docker "$USER"
# 재로그인 후 적용. sudo 없이 아래가 되어야 한다.
docker ps
```

### 1-6. 첫 기동 확인

```bash
cd /opt/junpiks
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1/
```

---

## 2. GitHub 저장소 설정

**Settings → Secrets and variables → Actions**

### Secrets (필수)

| 이름 | 값 |
| --- | --- |
| `SSH_HOST` | 서버 IP 또는 도메인 |
| `SSH_USER` | 배포 계정명 |
| `SSH_KEY` | `~/.ssh/junpiks_deploy` **개인키 전체 내용** (`-----BEGIN`~`END-----` 포함) |

### Secrets (선택)

| 이름 | 기본값 |
| --- | --- |
| `SSH_PORT` | `22` |

### Variables (선택)

| 이름 | 기본값 |
| --- | --- |
| `DEPLOY_PATH` | `/opt/junpiks` |

> 워크플로의 `environment: production` 을 쓰면
> **Settings → Environments → production** 에서 승인자를 지정해
> 수동 승인 후에만 배포되도록 막을 수도 있다.

---

## 3. 평소 운영

### 배포

```bash
git push origin main
```

Actions 탭에서 진행 상황을 볼 수 있다. 수동 재배포는
**Actions → Deploy to production → Run workflow**.

### 로그 확인

```bash
cd /opt/junpiks
docker compose logs -f next-app
docker compose logs -f nginx
```

### 수동 롤백

```bash
cd /opt/junpiks
git log --oneline -10
git reset --hard <되돌릴커밋>
docker compose build next-app && docker compose up -d
```

---

## 4. 데이터 관리

모든 데이터는 MariaDB 에 있고, `mariadb_data` 볼륨에 보존된다.
컨테이너를 지웠다 다시 만들어도 이 볼륨이 남아 있으면 데이터는 유지된다.

| 테이블 | 내용 |
| --- | --- |
| `admin_users` | 관리자 계정 (scrypt 해시) |
| `site_settings` | 사이트 기본 정보 (단일 행) |
| `services` | 서비스 마스터 8건 |
| `case_studies` | 시공사례 |
| `pricing_items` | 작업비용 안내 |
| `reviews` | 고객 후기 |
| `inquiries` | **고객 상담/출동 접수 (개인정보)** |

### 스키마를 바꿀 때

로컬에서 마이그레이션을 만들고 **반드시 커밋**한다. 서버는 이미 만들어진
마이그레이션을 적용만 한다(`migrate deploy`).

```bash
# 1. 로컬에 개발용 DB 띄우기
docker run -d --name junpiks-devdb \
  -e MARIADB_ROOT_PASSWORD=rootpw -e MARIADB_DATABASE=junpics \
  -p 13306:3306 mariadb:11

# 2. prisma/schema.prisma 수정 후 마이그레이션 생성
export DATABASE_URL='mysql://root:rootpw@127.0.0.1:13306/junpics'
npx prisma migrate dev --name 변경내용요약

# 3. 생성된 prisma/migrations/ 를 커밋하고 push
git add prisma/migrations prisma/schema.prisma
git commit -m "feat: 스키마 변경"
git push
```

> `migrate dev` 는 shadow database 를 만들기 때문에 DB 생성 권한이 있는
> 계정(root)이 필요하다. 서버에서 쓰는 `migrate deploy` 는 권한이 덜 필요하다.

### 백업

배포할 때마다 워크플로가 `backups/` 에 자동으로 덤프를 남긴다(최근 14개 보관).
정기 백업은 cron 으로 따로 걸어두는 것을 권한다.

```bash
cd /opt/junpiks
docker compose exec -T mariadb sh -c \
  'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines "$MARIADB_DATABASE"' \
  > "backups/junpiks_$(date +%F_%H%M).sql"
```

### 복원

```bash
cd /opt/junpiks
docker compose exec -T mariadb sh -c \
  'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' \
  < backups/복원할파일.sql
docker compose restart next-app
```

### 초기 데이터 적재 규칙

`prisma/seed.ts` 는 `data/junpiks_data.json` 을 읽어 DB 에 넣는다.
**각 테이블이 비어 있을 때만** 적재하므로 배포 때마다 실행돼도
운영 데이터를 덮어쓰지 않는다. 관리자 계정 비밀번호만 예외로,
매번 `.env` 의 `ADMIN_PASSWORD` 값으로 재설정된다.

다른 파일에서 적재하려면:

```bash
docker compose run --rm -e SEED_SOURCE=/app/data/다른파일.json migrate \
  sh -c 'npx prisma db seed'
```

### 마이그레이션이 실패해 롤백된 경우

워크플로는 코드만 이전 커밋으로 되돌린다. **DB 스키마는 되돌아가지 않는다.**
스키마 변경이 원인이었다면 `backups/` 의 배포 직전 덤프로 수동 복원해야 한다.

---

## 5. 보안 참고

이번 DB 전환과 함께 정리된 것:

- 관리자 비밀번호가 소스에 하드코딩돼 있던 것을 `admin_users` 테이블의
  scrypt 해시 대조로 바꿨다.
- 세션 쿠키가 `authenticated_junpiks` 라는 고정 문자열이라 값만 알면
  누구나 위조할 수 있었다. `ADMIN_SESSION_SECRET` 으로 HMAC 서명한
  만료 시각 포함 토큰으로 교체했다.
- `GET /api/inquiries` 가 무인증이라 고객 이름·전화번호가 공개 상태였다.
  관리자 전용 엔드포인트에 인증 가드를 붙였다.
  (고객 접수 폼인 `POST /api/inquiries` 는 그대로 공개)
- DB 비밀번호가 `docker-compose.yml` 에 평문으로 있던 것을 `.env` 로 뺐다.
- MariaDB 포트는 기본적으로 `127.0.0.1:3306` 에만 바인딩된다.
  외부 접속이 필요하면 `.env` 에 `MARIADB_BIND=0.0.0.0` 을 넣되
  방화벽으로 접속 IP 를 반드시 제한한다.

아직 남은 것:

- **HTTPS 미적용.** 지금은 관리자 비밀번호가 평문(HTTP)으로 전송된다.
  도메인 연결 후 certbot 또는 Caddy 로 443 을 붙이는 작업이 시급하다.
- 기존 `docker-compose.yml` 에 평문으로 들어 있던 DB 비밀번호는
  커밋 이력에 남을 수 있으므로 교체를 권한다.
- 관리자 비밀번호 변경 UI 가 없다. `.env` 의 `ADMIN_PASSWORD` 를 바꾸고
  재배포하는 방식으로 운용한다.
- 로그인 시도 횟수 제한(brute-force 방어)이 없다.
