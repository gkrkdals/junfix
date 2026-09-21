#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# 서버에서 실행되는 배포 스크립트.
# GitHub Actions 가 SSH 로 stdin 에 흘려넣어 실행한다 (서버에 미리 둘 필요 없음).
#
#   사용법: bash -s -- <배포경로> <업로드된 tar.gz 경로>
#
# 하는 일:
#   1) DB 덤프 백업          4) 이미지 빌드
#   2) 롤백용 스냅샷 보관     5) 컨테이너 교체 + 헬스체크
#   3) 새 소스 전개          6) 실패 시 직전 소스로 자동 롤백
# ---------------------------------------------------------------------------
set -euo pipefail

DEPLOY_PATH="${1:?배포 경로가 필요합니다}"
UPLOAD_TARBALL="${2:?업로드된 소스 경로가 필요합니다}"

# 배포가 건드리면 안 되는 것들 (서버에서만 관리되는 상태)
PRESERVE=(.env backups .rollback)

log() { echo ""; echo "── $* ────────────────────────────────────────"; }

# compose up 이 실패하면 원인은 컨테이너 안에 있다.
# 그대로 두면 Actions 로그에 "exit 1" 만 남아 서버에 직접 들어가야 하므로,
# 실패한 서비스의 출력을 여기서 끌어낸다.
dump_failure_logs() {
  echo "" >&2
  echo "──────────── 실패 원인 (컨테이너 로그) ────────────" >&2

  # 종료된 컨테이너의 종료 코드부터 보여준다
  docker compose ps -a --format '  {{.Service}}\t{{.Status}}' 2>/dev/null >&2 || true

  # mariadb 는 부팅 로그가 길어 원인을 밀어내므로 짧게.
  # 가장 흔한 원인인 migrate 를 맨 뒤(가장 잘 보이는 위치)에 둔다.
  for entry in "mariadb 12" "nginx 20" "next-app 30" "migrate 60"; do
    svc="${entry%% *}"
    lines="${entry##* }"
    out="$(docker compose logs --no-color --tail="$lines" "$svc" 2>/dev/null)" || continue
    [ -z "$out" ] && continue
    echo "" >&2
    echo "[$svc] ─────────────────────────────────────────" >&2
    echo "$out" >&2
  done
  echo "" >&2
  echo "──────────────────────────────────────────────────" >&2
}

# ---------------------------------------------------------------------------
# 사전 점검 - 실패하면 무엇을 고쳐야 하는지 명확히 알려준다
# ---------------------------------------------------------------------------
WHOAMI="$(id -un)"

if [ ! -d "$DEPLOY_PATH" ]; then
  if ! mkdir -p "$DEPLOY_PATH" 2>/dev/null; then
    echo "오류: 배포 디렉터리를 만들 수 없습니다: $DEPLOY_PATH (계정: $WHOAMI)" >&2
    echo "" >&2
    echo "  서버에서 아래를 실행하세요:" >&2
    echo "    sudo mkdir -p $DEPLOY_PATH" >&2
    echo "    sudo chown -R $WHOAMI:$WHOAMI $DEPLOY_PATH" >&2
    exit 1
  fi
fi

cd "$DEPLOY_PATH"

# 소유권이 root 로 남아 있는 경우가 가장 흔한 실패 원인이다.
if ! touch .deploy-write-test 2>/dev/null; then
  echo "오류: $DEPLOY_PATH 에 쓸 수 없습니다. (계정: $WHOAMI, 소유자: $(stat -c '%U' . 2>/dev/null || stat -f '%Su' . 2>/dev/null || echo '?'))" >&2
  echo "" >&2
  echo "  서버에서 아래를 실행하세요:" >&2
  echo "    sudo chown -R $WHOAMI:$WHOAMI $DEPLOY_PATH" >&2
  exit 1
fi
rm -f .deploy-write-test

if ! docker compose version >/dev/null 2>&1; then
  echo "오류: docker compose 를 실행할 수 없습니다. (계정: $WHOAMI)" >&2
  echo "" >&2
  echo "  docker 미설치라면 설치하고, 권한 문제라면 아래 후 재로그인하세요:" >&2
  echo "    sudo usermod -aG docker $WHOAMI" >&2
  exit 1
fi

# 다른 스택이 80/443/3306 을 잡고 있으면 빌드를 다 끝낸 뒤에야 실패한다.
# 4분짜리 빌드를 낭비하지 않도록 먼저 확인한다.
# (우리 컨테이너는 모두 junpiks-* 이므로 재배포 시 자기 자신은 걸러진다)
PORT_CONFLICTS="$(docker ps --format '{{.Names}}|{{.Ports}}' 2>/dev/null \
  | grep -E ':(80|443|3306)->' \
  | grep -v '^junpiks-' || true)"

if [ -n "$PORT_CONFLICTS" ]; then
  echo "오류: 다른 컨테이너가 필요한 포트를 사용 중입니다." >&2
  echo "" >&2
  echo "$PORT_CONFLICTS" | while IFS='|' read -r name ports; do
    echo "    $name  ($ports)" >&2
  done
  echo "" >&2
  echo "  서버에서 아래로 정리하세요 (볼륨은 유지됩니다):" >&2
  echo "$PORT_CONFLICTS" | cut -d'|' -f1 | tr '\n' ' ' | \
    sed 's/^/    docker rm -f /' >&2
  echo "" >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "오류: $DEPLOY_PATH/.env 가 없습니다." >&2
  echo "     DEPLOY.md 의 '서버 최초 세팅' 을 먼저 수행하세요." >&2
  exit 1
fi

# 업로드가 중간에 끊겼을 수도 있으므로, 무엇을 건드리기 전에 먼저 검사한다.
if [ ! -s "$UPLOAD_TARBALL" ]; then
  echo "오류: 업로드된 소스를 찾을 수 없습니다: $UPLOAD_TARBALL" >&2
  exit 1
fi
if ! tar tzf "$UPLOAD_TARBALL" >/dev/null 2>&1; then
  echo "오류: 업로드된 소스가 손상되었습니다: $UPLOAD_TARBALL" >&2
  exit 1
fi

# .env 에서 값 하나를 안전하게 읽는다.
# `. ./.env` 로 읽으면 공백이 든 값(SERVER_NAMES="a b")을 명령으로 실행해버린다.
read_env() {
  local key="$1" line
  line="$(grep -E "^[[:space:]]*${key}=" .env | tail -1)" || return 0
  line="${line#*=}"
  line="${line#"${line%%[![:space:]]*}"}"   # 앞 공백 제거
  line="${line%"${line##*[![:space:]]}"}"   # 뒤 공백 제거
  # 값을 감싼 따옴표 한 겹 제거
  if [ "${line#\"}" != "$line" ] && [ "${line%\"}" != "$line" ]; then
    line="${line#\"}"; line="${line%\"}"
  elif [ "${line#\'}" != "$line" ] && [ "${line%\'}" != "$line" ]; then
    line="${line#\'}"; line="${line%\'}"
  fi
  printf '%s' "$line"
}

DOMAIN="$(read_env DOMAIN)"
if [ -z "$DOMAIN" ]; then
  echo "오류: .env 에 DOMAIN 이 없습니다." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
log "1/6 DB 백업"
# ---------------------------------------------------------------------------
mkdir -p backups
if docker compose ps --status running --services 2>/dev/null | grep -qx mariadb; then
  DUMP="backups/pre-deploy-$(date +%F_%H%M%S).sql"
  if docker compose exec -T mariadb sh -c \
       'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines "$MARIADB_DATABASE"' \
       > "$DUMP"; then
    echo "백업 완료: $DUMP ($(wc -c < "$DUMP" | tr -d " ") bytes)"
    # 최근 14개만 보관
    ls -1t backups/*.sql 2>/dev/null | tail -n +15 | xargs -r rm --
  else
    rm -f "$DUMP"
    echo "DB 백업에 실패했습니다. 마이그레이션을 강행하지 않고 중단합니다." >&2
    exit 1
  fi
else
  echo "mariadb 컨테이너 없음 (최초 배포로 간주) - 백업 건너뜀"
fi

# ---------------------------------------------------------------------------
log "2/6 롤백용 스냅샷 보관"
# ---------------------------------------------------------------------------
mkdir -p .rollback
if [ -f docker-compose.yml ]; then
  tar czf .rollback/previous.tar.gz \
    --exclude=./.env --exclude=./backups --exclude=./.rollback . 2>/dev/null
  echo "직전 소스 보관: .rollback/previous.tar.gz"
else
  rm -f .rollback/previous.tar.gz
  echo "기존 소스 없음 - 롤백 스냅샷 생략"
fi

# ---------------------------------------------------------------------------
log "3/6 새 소스 전개"
# ---------------------------------------------------------------------------
# 삭제된 파일이 서버에 남지 않도록, 보존 대상만 빼고 전부 교체한다.
extract_over_workdir() {
  local tarball="$1"
  local staging=".incoming"

  rm -rf "$staging"
  mkdir -p "$staging"
  tar xzf "$tarball" -C "$staging"

  local find_args=()
  for keep in "${PRESERVE[@]}"; do
    find_args+=(! -name "$keep")
  done

  find . -mindepth 1 -maxdepth 1 \
    "${find_args[@]}" ! -name "$staging" \
    -exec rm -rf {} +

  cp -a "$staging"/. .
  rm -rf "$staging"
}

extract_over_workdir "$UPLOAD_TARBALL"
rm -f "$UPLOAD_TARBALL"
chmod +x scripts/*.sh 2>/dev/null || true
echo "전개 완료 ($(find . -mindepth 1 -maxdepth 1 | wc -l | tr -d " ") 항목)"

# ---------------------------------------------------------------------------
log "4/6 이미지 빌드"
# ---------------------------------------------------------------------------
# 빌드가 실패하면 아래 up 까지 가지 않으므로 기존 컨테이너가 계속 서비스한다.
docker compose build

# ---------------------------------------------------------------------------
log "5/6 컨테이너 교체"
# ---------------------------------------------------------------------------
# nginx 는 인증서 파일이 없으면 기동 자체가 실패한다.
# 최초 배포 시점에는 아직 인증서가 없으므로 앱까지만 올리고 안내하고 끝낸다.
if ! docker compose run --rm --entrypoint sh certbot \
       -c "test -s /etc/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null; then
  echo "HTTPS 인증서가 아직 없습니다. nginx 를 제외하고 앱만 기동합니다."
  if ! docker compose up -d --remove-orphans mariadb migrate next-app; then
    dump_failure_logs
    exit 1
  fi
  docker compose ps
  echo ""
  echo "===================================================================="
  echo " 다음 단계: 서버에 접속해 인증서를 발급받으세요."
  echo ""
  echo "   cd $DEPLOY_PATH && ./scripts/init-letsencrypt.sh"
  echo ""
  echo " 이후 push 부터는 전체 배포가 자동으로 진행됩니다."
  echo "===================================================================="
  exit 0
fi

# migrate 서비스가 prisma migrate deploy 를 끝내야 next-app 이 뜬다
if ! docker compose up -d --remove-orphans; then
  dump_failure_logs
  exit 1
fi

# ---------------------------------------------------------------------------
log "6/6 헬스 확인"
# ---------------------------------------------------------------------------
ok=0
for _ in $(seq 1 30); do
  # healthz 는 nginx 자체, /api/pricing 은 앱+DB 까지 살아있는지 본다.
  # -k 는 127.0.0.1 로 붙어 인증서 이름이 안 맞기 때문에 필요하다.
  if curl -fsS  -o /dev/null http://127.0.0.1/healthz \
  && curl -fsSk -o /dev/null https://127.0.0.1/api/pricing; then
    ok=1; break
  fi
  sleep 3
done

if [ "$ok" -ne 1 ]; then
  echo "헬스체크 실패. 직전 소스로 롤백합니다." >&2
  docker compose logs --tail=80 migrate next-app nginx certbot || true

  if [ -f .rollback/previous.tar.gz ]; then
    extract_over_workdir .rollback/previous.tar.gz
    docker compose build
    docker compose up -d --remove-orphans
    echo "롤백 완료." >&2
  else
    echo "롤백할 직전 소스가 없습니다 (최초 배포)." >&2
  fi

  echo "" >&2
  echo "주의: 코드는 롤백됐지만 DB 마이그레이션은 되돌아가지 않습니다." >&2
  echo "     스키마 변경이 원인이면 backups/ 의 배포 직전 덤프로 복원하세요." >&2
  exit 1
fi

docker compose ps
docker image prune -f >/dev/null
echo ""
echo "배포 완료: https://$DOMAIN/"
