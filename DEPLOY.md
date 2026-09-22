# junpiks 배포 가이드

`main` 브랜치에 push 하면 GitHub Actions 가 서버에 SSH 로 접속해
소스를 내려받고 Docker 이미지를 빌드한 뒤 컨테이너를 교체한다.

```
개발자 push ──▶ GitHub Actions
                 ├─ build-check  : MariaDB 붙여서 migrate deploy + seed + next build
                 │                 (깨진 코드/마이그레이션 차단)
                 └─ deploy       : 소스 tar.gz 업로드 → 서버에서 DB 덤프 백업
                                   → 소스 교체 → docker compose build → up -d
                                   → 헬스체크 실패 시 직전 소스로 자동 롤백
```

서버에서 `docker compose up -d` 가 뜨는 순서는 다음과 같다.

```
mariadb (healthy) ─▶ migrate (prisma migrate deploy + seed, 완료 후 종료)
                        └─▶ next-app (healthy) ─▶ nginx (80/443)

certbot ─ 12시간마다 인증서 갱신 (nginx 는 6시간마다 reload)
```

## 구성

| 파일 | 역할 |
| --- | --- |
| `Dockerfile` | 멀티스테이지 이미지 (deps → builder → **runner** / **migrator**), 비루트 실행 |
| `docker-compose.yml` | nginx(80) → next-app(3000) → mariadb(3306) + 1회성 `migrate` |
| `prisma/schema.prisma` | DB 스키마 (테이블 9개) |
| `prisma/migrations/` | 마이그레이션 이력. **반드시 커밋한다** |
| `prisma/seed.ts` | 최초 1회 초기 데이터 적재 |
| `nginx/templates/` | 리버스 프록시 설정 템플릿 (기동 시 `${DOMAIN}` 치환) |
| `nginx/snippets/` | 여러 location 에서 재사용하는 프록시 헤더 |
| `scripts/init-letsencrypt.sh` | HTTPS 인증서 최초 발급 (서버에서 1회) |
| `scripts/deploy-remote.sh` | 서버에서 도는 배포 로직 (Actions 가 SSH 로 흘려보냄) |
| `.github/workflows/deploy.yml` | CI/CD 파이프라인 |
| `.env` | 서버/로컬에서 각각 직접 생성 (git 에 커밋되지 않음) |
| `lib/uploads.ts` | 관리자가 올린 사진 저장 (`uploads_data` 볼륨, `/uploads/...` 로 서빙) |
| `lib/notify.ts` | 상담 접수 이메일 알림 (SMTP 설정 시) |
| `ADMIN_GUIDE.md` | 사장님용 관리자 페이지 사용 안내 |

---

## 1. 서버 최초 세팅 (1회만)

### 1-0. DNS 먼저 연결

도메인의 A 레코드가 서버 IP 를 가리키게 한다. www 도 쓸 거라면 둘 다 등록한다.

| 타입 | 이름 | 값 |
| --- | --- | --- |
| A | `@` | 서버 IP |
| A | `www` | 서버 IP |

전파를 확인한 뒤 다음 단계로 넘어간다. **여기서 서버 IP 가 안 나오면
인증서 발급이 반드시 실패한다.**

```bash
dig +short 도메인.com
dig +short www.도메인.com
```

### 1-1. 방화벽 열기

Let's Encrypt 는 80 포트로 소유권을 확인한다. 갱신 때도 계속 필요하므로
80 을 닫으면 안 된다. 443 은 실제 서비스용이다.

배포판에 따라 방화벽 도구가 다르다. 먼저 무엇이 도는지 확인한다.

```bash
command -v firewall-cmd && sudo firewall-cmd --state    # RHEL / Rocky / Alma / CentOS
command -v ufw          && sudo ufw status              # Ubuntu / Debian
```

**firewalld (RHEL 계열)**

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
sudo firewall-cmd --list-all        # http, https 가 보여야 한다
```

**ufw (Ubuntu / Debian)**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

> 클라우드(네이버클라우드 / AWS / GCP 등)라면 **콘솔의 보안그룹(ACG)에서도**
> 인바운드 TCP 80, 443 을 따로 열어야 한다. 서버 방화벽만 열면 안 된다.

### 열렸는지 밖에서 확인

서버가 아니라 **본인 PC** 에서 확인해야 의미가 있다.

```bash
nc -z -w 5 <서버IP> 80  && echo "80 열림"
nc -z -w 5 <서버IP> 443 && echo "443 열림"
```

한쪽만 열려 있으면 브라우저에서 `ERR_CONNECTION_REFUSED` 나 무한 로딩이 된다.
특히 80 만 열린 경우, HTTP 로 접속하면 HTTPS 로 301 리다이렉트된 뒤 거기서 막힌다.

### 1-2. Docker 설치 확인

```bash
docker --version
docker compose version     # v2 이상 필요
```

### 1-3. 배포 계정에 docker 권한 부여

```bash
sudo usermod -aG docker "$USER"
exit          # 재로그인해야 적용된다
```

재로그인 후 `sudo` 없이 아래가 되어야 한다.

```bash
docker ps
```

### 1-4. 배포 디렉터리와 `.env` 준비

서버에 소스를 미리 받아둘 필요는 없다. GitHub Actions 가 push 할 때마다
소스를 통째로 올려주기 때문에, 서버에는 **디렉터리와 `.env` 만** 있으면 된다.

```bash
sudo mkdir -p /opt/junpiks
sudo chown -R "$USER":"$USER" /opt/junpiks     # 이 줄을 빠뜨리면 배포가 실패한다
cd /opt/junpiks

vi .env        # sudo 없이 작성할 것. 아래 표 참고
```

> **소유권을 넘기지 않으면** 배포가 `Permission denied` 로 멈춘다.
> `ls -ld /opt/junpiks` 로 소유자가 배포 계정인지 확인한다.
> `sudo vi .env` 로 만들면 `.env` 만 root 소유로 남으니 주의한다.

`.env` 예시 (`ADMIN_SESSION_SECRET` 은 `openssl rand -hex 32` 결과를 붙여넣는다):

```ini
DOMAIN=junpiks.com
SERVER_NAMES="junpiks.com www.junpiks.com"
CERTBOT_EMAIL=you@example.com
CERTBOT_STAGING=0

MARIADB_ROOT_PASSWORD=긴-루트-비밀번호
MARIADB_DATABASE=junpics
MARIADB_USER=junpiks
MARIADB_PASSWORD=긴-사용자-비밀번호
MARIADB_BIND=127.0.0.1

ADMIN_USERNAME=junpiks
ADMIN_PASSWORD=관리자-로그인-비밀번호
ADMIN_SESSION_SECRET=openssl-rand-hex-32-결과
```

> `SERVER_NAMES` 처럼 값에 공백이 들어가면 **반드시 따옴표로 감싼다.**

반드시 채워야 하는 값:

| 키 | 설명 | 예시 |
| --- | --- | --- |
| `DOMAIN` | 기본 도메인. 인증서 경로 이름으로도 쓰인다 | `junpiks.com` |
| `SERVER_NAMES` | nginx server_name + 인증서에 포함할 호스트 (공백 구분) | `junpiks.com www.junpiks.com` |
| `CERTBOT_EMAIL` | 인증서 만료 알림 수신 주소 | `you@example.com` |
| `MARIADB_ROOT_PASSWORD` | DB root 비밀번호 | 길게 |
| `MARIADB_DATABASE` / `MARIADB_USER` / `MARIADB_PASSWORD` | DB 이름 / 계정 / 비밀번호 | |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 관리자 로그인 계정 | |
| `ADMIN_SESSION_SECRET` | 위에서 자동 생성됨. 건드리지 말 것 | |

> `.env` 는 gitignore 되어 있고 배포 스크립트도 덮어쓰지 않는다.
> 한 번 만들어 두면 이후 배포에서 계속 유지된다.

### 1-5. GitHub Secrets 등록 후 첫 push

아래 **2절** 을 먼저 수행해 Secrets 를 넣고 `git push` 한다.

첫 배포에서는 아직 HTTPS 인증서가 없으므로, 배포 스크립트가 이를 감지해
**nginx 를 제외하고 DB/앱만 기동한 뒤 안내 메시지를 출력하고 정상 종료** 한다.
Actions 로그 마지막에 다음 안내가 보이면 성공이다.

```
 다음 단계: 서버에 접속해 인증서를 발급받으세요.
   cd /opt/junpiks && ./scripts/init-letsencrypt.sh
```

### 1-6. HTTPS 인증서 발급

첫 push 로 소스가 서버에 올라왔으니, 이제 서버에서 발급 스크립트를 돌린다.

```bash
cd /opt/junpiks
./scripts/init-letsencrypt.sh
```

스크립트가 하는 일:

1. nginx 가 뜰 수 있도록 임시 자체서명 인증서를 만든다
   (인증서 파일이 없으면 nginx 는 기동 자체가 실패한다)
2. `docker compose up -d` 로 전체 스택을 올린다
3. 임시 인증서를 지운다
4. certbot 으로 실제 인증서를 발급받는다 (HTTP-01 방식, 80 포트 사용)
5. nginx 를 reload 한다

> **처음이라면 연습을 권한다.** `.env` 에 `CERTBOT_STAGING=1` 을 넣고 먼저 돌려본다.
> Let's Encrypt 는 도메인당 주간 발급 횟수를 제한하는데, DNS 나 방화벽 문제로
> 몇 번 실패하면 일주일을 기다려야 한다. staging 은 그 제한에 걸리지 않는다.
> 확인이 끝나면 `CERTBOT_STAGING=0` 으로 바꾸고 아래로 지운 뒤 다시 실행한다.
>
> ```bash
> docker compose run --rm --entrypoint sh certbot \
>   -c "rm -rf /etc/letsencrypt/live /etc/letsencrypt/archive /etc/letsencrypt/renewal"
> ```

### 1-7. 확인

```bash
curl -I https://도메인.com/           # 200
curl -I http://도메인.com/            # 301 -> https
docker compose ps                     # 전부 Up / healthy
```

브라우저로 `https://도메인.com` 과 `https://도메인.com/admin/login` 에 접속해
자물쇠 아이콘과 관리자 로그인을 확인한다.

이후로는 `git push origin main` 만 하면 전체 배포가 자동으로 진행된다.

---

## 2. GitHub 저장소 설정

**Settings → Secrets and variables → Actions**

### Secrets (필수)

| 이름 | 값 |
| --- | --- |
| `SSH_HOST` | 서버 IP 또는 도메인 |
| `SSH_USER` | 서버 로그인 계정명 |
| `SSH_PASSWORD` | 그 계정의 **로그인 비밀번호** |

### Secrets (선택)

| 이름 | 기본값 |
| --- | --- |
| `SSH_PORT` | `22` |

### Variables (선택)

| 이름 | 기본값 |
| --- | --- |
| `DEPLOY_PATH` | `/opt/junpiks` |

> SSH 키를 쓰지 않고 비밀번호로 접속한다. 서버의 sshd 가
> `PasswordAuthentication yes` 여야 한다 (대부분 기본값).
>
> 비밀번호 인증은 키 인증보다 무차별 대입에 약하다. 최소한 아래는 해두는 게 좋다.
> - 충분히 긴 비밀번호를 쓸 것
> - `fail2ban` 설치 (`sudo apt install fail2ban`)
> - 가능하면 SSH 포트를 22 에서 변경하고 `SSH_PORT` 에 등록
>
> 나중에 키 방식으로 바꾸고 싶으면 `SSH_PASSWORD` 대신 개인키를 담은
> `SSH_KEY` 를 만들고, 워크플로의 `sshpass -e` 를 `-i 키파일` 로 바꾸면 된다.

### 배포가 하는 일

Actions 는 서버에서 `git pull` 을 하지 않는다. 대신 이렇게 동작한다.

1. 러너가 `git archive` 로 커밋된 파일만 `source.tar.gz` 로 묶는다
   (`node_modules`, `.next`, `.env` 는 애초에 포함되지 않는다)
2. `scp` 로 서버의 `/tmp` 에 올린다
3. `scripts/deploy-remote.sh` 를 SSH 표준입력으로 흘려보내 실행한다

덕분에 **서버에 GitHub 접근 권한(Deploy key, 토큰)이 전혀 필요 없다.**

---

## 3. 평소 운영

### 배포

```bash
git push origin main
```

Actions 탭에서 진행 상황을 볼 수 있다. 수동 재배포는
**Actions → Deploy to production → Run workflow**.

### 상담 접수 이메일 알림 켜기

`.env` 에 SMTP 값을 넣고 재배포(`git push` 또는 Actions 의 Run workflow)한다.
수신 주소는 관리자 페이지 > 기본 정보 > "알림 받을 이메일" 이 우선이고, 없으면 `NOTIFY_EMAIL` 을 쓴다.

발신은 개발자 Gmail 계정, 수신은 사장님 네이버 메일(`wnsgur0197@naver.com`)로 운용한다.

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=1
SMTP_USER=발신용계정@gmail.com
SMTP_PASS=16자리앱비밀번호
SMTP_FROM="준픽스 홈페이지 <발신용계정@gmail.com>"
NOTIFY_EMAIL=wnsgur0197@naver.com
```

Gmail 앱 비밀번호 발급: 구글 계정(myaccount.google.com) > 보안 > **2단계 인증을 켠 뒤** > 앱 비밀번호 > 이름 입력 > 생성.
표시되는 16자리를 공백 없이 `SMTP_PASS` 에 넣는다. 일반 로그인 비밀번호로는 발송이 거부된다.
Gmail 발신 한도는 하루 500통이라 상담 알림 용도로는 충분하다.

네이버 계정으로 보내려면 `SMTP_HOST=smtp.naver.com` 으로 바꾸고, 네이버 메일 > 환경설정 > POP3/IMAP 설정을 "사용함"으로 켠다.
설정이 없으면 `docker compose logs next-app` 에 `[notify] SMTP 설정이 없어 ...` 경고만 남고 접수는 정상 저장된다.

테스트: 홈페이지 상담 폼을 제출한 뒤 메일이 오는지 확인한다.

### 사이트 주소 (SITE_URL)

사이트맵·OG·robots 에 쓰이는 공개 주소는 `SITE_URL` 환경변수(없으면 `https://${DOMAIN}`)이고,
관리자 페이지 > 기본 정보 > "홈페이지 주소" 를 입력하면 그 값이 우선한다.

### 로그 확인

```bash
cd /opt/junpiks
docker compose logs -f next-app
docker compose logs -f nginx
```

### 인증서 상태 확인

```bash
cd /opt/junpiks
docker compose run --rm --entrypoint certbot certbot certificates
docker compose logs certbot | tail -20
```

갱신은 certbot 컨테이너가 12시간마다 자동으로 시도하고,
nginx 는 6시간마다 reload 해서 새 인증서를 집는다.
Let's Encrypt 인증서는 90일짜리이고 만료 30일 전부터 갱신된다.

수동으로 갱신을 시험해보려면:

```bash
docker compose run --rm --entrypoint certbot certbot renew --dry-run
```

### 도메인을 추가/변경할 때

`.env` 의 `SERVER_NAMES` 를 고치고 인증서를 다시 발급받는다.

```bash
vi .env                        # SERVER_NAMES 수정
./scripts/init-letsencrypt.sh  # 재발급
```

### migrate 가 `P1001: Can't reach database server` 로 실패할 때

MariaDB 는 최초 기동 시 `--skip-networking` 으로 임시 서버를 띄워
시스템 테이블과 계정을 만든다. 이 구간에는 유닉스 소켓으로만 붙을 수 있어
TCP 접속은 거부된다.

이 때문에 최초 배포(빈 볼륨)에서만 간헐적으로 실패할 수 있어 두 겹으로 막아두었다.

- `mariadb` 헬스체크가 소켓이 아니라 **TCP** 로 확인한다
- `migrate` 컨테이너가 `scripts/wait-for-db.js` 로 TCP 연결을 최대 2분 기다린다

그래도 같은 오류가 나면 DB 자체가 기동에 실패한 것이므로 아래를 본다.

```bash
cd /opt/junpiks
docker compose logs mariadb | tail -40
docker compose ps
df -h                      # 디스크 여유 확인
```

### 배포가 포트 충돌로 실패할 때

```
오류: 다른 컨테이너가 필요한 포트를 사용 중입니다.
    old-mariadb  (0.0.0.0:3306->3306/tcp)
```

이 스택 이전에 돌던 컨테이너가 80/443/3306 을 잡고 있는 경우다.
배포 스크립트가 빌드 전에 감지하고 정리할 명령을 그대로 출력한다.

```bash
docker ps                          # 무엇이 떠 있는지 확인
docker rm -f <컨테이너이름> ...      # 스크립트가 알려준 명령 그대로
```

> `docker stop` 만 하면 `restart: unless-stopped` 때문에 재부팅 시 되살아난다.
> `rm -f` 까지 해야 한다. 컨테이너를 지워도 볼륨(데이터)은 남는다.

### 수동 롤백

배포 실패 시에는 자동으로 직전 소스로 되돌아간다. 수동으로 되돌리려면
직전 스냅샷을 쓰거나, 로컬에서 이전 커밋을 다시 push 한다.

```bash
# 방법 1) 서버에 남아 있는 직전 소스로 복귀
cd /opt/junpiks
tar xzf .rollback/previous.tar.gz
docker compose build && docker compose up -d

# 방법 2) 로컬에서 되돌려 다시 배포 (이력이 남아 권장)
git revert <되돌릴커밋>
git push
```

> DB 마이그레이션은 어느 쪽으로도 되돌아가지 않는다.
> 스키마 변경이 원인이면 `backups/` 의 배포 직전 덤프로 복원해야 한다.

---

## 4. 데이터 관리

글·설정은 MariaDB(`mariadb_data` 볼륨)에, 관리자가 올린 **사진 파일은 `uploads_data` 볼륨**에 있다.
컨테이너를 지웠다 다시 만들어도 두 볼륨이 남아 있으면 데이터는 유지된다.
`docker compose down -v` 는 볼륨까지 지우므로 쓰지 않는다.

| 테이블 | 내용 |
| --- | --- |
| `admin_users` | 관리자 계정 (scrypt 해시) |
| `site_settings` | 사이트 기본 정보 (단일 행) |
| `services` | 서비스 안내 (관리자에서 추가/수정) |
| `case_studies` | 시공사례 (사진 URL 은 `/uploads/...`) |
| `pricing_items` | 작업비용 안내 |
| `reviews` | 고객 후기 |
| `site_photos` | 업체 사진 갤러리 |
| `media_assets` | 업로드 파일 목록 (실제 파일은 `uploads_data` 볼륨) |
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

사진 파일은 DB 덤프에 포함되지 않는다. 볼륨을 통째로 tar 로 묶는다.

```bash
cd /opt/junpiks
docker run --rm -v junpiks_uploads_data:/data -v "$PWD/backups":/backup alpine \
  tar czf "/backup/uploads_$(date +%F_%H%M).tar.gz" -C /data .
```

> 볼륨 이름은 `docker volume ls | grep uploads` 로 확인한다.
> compose 프로젝트 이름(기본: 디렉터리명 `junpiks`)이 앞에 붙는다.

### 복원

```bash
cd /opt/junpiks
docker compose exec -T mariadb sh -c \
  'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' \
  < backups/복원할파일.sql
docker compose restart next-app
```

사진 볼륨 복원:

```bash
docker run --rm -v junpiks_uploads_data:/data -v "$PWD/backups":/backup alpine \
  sh -c "cd /data && tar xzf /backup/uploads_복원할파일.tar.gz"
```

### 초기 데이터 적재 규칙

`migrate` 컨테이너는 배포할 때마다 `prisma migrate deploy && prisma db seed` 를 실행한다.
다만 **하는 일은 배포 차수에 따라 다르다.**

| 대상 | 언제 |
| --- | --- |
| 스키마 마이그레이션 | 적용되지 않은 것만 (`migrate deploy`) |
| 초기 데이터 (`data/junpiks_data.json`) | **최초 1회만** |
| 관리자 비밀번호 | **매 배포마다** `.env` 의 `ADMIN_PASSWORD` 로 동기화 |

초기 데이터 적재 여부는 `seed_state` 테이블의 마커로 판단한다.
"테이블이 비어 있으면 채운다" 방식이 아니므로,
**관리자가 UI 에서 후기나 시공사례를 전부 삭제해도 다음 배포 때 되살아나지 않는다.**

마커 `content-cleanup-v2` 는 v1 시드로 이미 적재된 서버를 한 번 정리한다.
예시용 가상 시공사례 5건·후기 4건·테스트 접수를 지우고, 자리표시 사업자번호·카톡·블로그 URL 을 비우며,
서비스 문구를 새 원본으로 갱신하고 "배관공사 및 배관교체" 서비스를 추가한다. 이후 배포에서는 건너뛴다.

관리자 비밀번호를 바꾸려면 `.env` 의 `ADMIN_PASSWORD` 를 고치고 재배포한다.
(비밀번호 변경 UI 가 없어서 `.env` 가 유일한 변경 수단이다)

### 초기 데이터를 다시 넣어야 할 때

마커를 지우면 비어 있는 테이블만 다시 채워진다.

```bash
cd /opt/junpiks
docker compose exec -T mariadb sh -c \
  'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE" \
   -e "DELETE FROM seed_state;"'
docker compose run --rm migrate
```

다른 파일에서 적재하려면:

```bash
docker compose run --rm -e SEED_SOURCE=/app/data/다른파일.json migrate
```

### 마이그레이션이 실패해 롤백된 경우

워크플로는 코드만 이전 커밋으로 되돌린다. **DB 스키마는 되돌아가지 않는다.**
스키마 변경이 원인이었다면 `backups/` 의 배포 직전 덤프로 수동 복원해야 한다.

---

## 5. 보안 참고

정리된 것:

- **HTTPS 적용.** Let's Encrypt 인증서로 443 을 열고 HTTP 는 전부
  301 리다이렉트한다. TLS 1.2/1.3 + ECDHE 만 허용하고 HSTS(180일)를 건다.
  관리자 비밀번호가 더 이상 평문으로 전송되지 않는다.

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

- 기존 `docker-compose.yml` 에 평문으로 들어 있던 DB 비밀번호는
  커밋 이력에 남을 수 있으므로 교체를 권한다.
- 관리자 비밀번호 변경 UI 가 없다. `.env` 의 `ADMIN_PASSWORD` 를 바꾸고
  재배포하는 방식으로 운용한다.
- 로그인 시도 횟수 제한(brute-force 방어)이 없다.
  (상담 접수 `POST /api/inquiries` 에는 IP 당 분당 5건 제한이 있다)

추가로 정리된 것:

- 로그인 페이지에 기본 관리자 계정·비밀번호가 안내문으로 노출되던 것을 제거했다.
- `GET /api/settings` 를 관리자 전용으로 바꿨다 (알림 이메일 등이 공개되지 않도록).
- 업로드는 관리자만 가능하고, 파일 내용을 sharp 로 판별해 이미지가 아니면 거부한다.
  저장 파일명은 랜덤이며 `/uploads/` 서빙 라우트는 업로드 폴더 밖 경로를 404 로 막는다.
