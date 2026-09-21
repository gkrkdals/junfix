#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Let's Encrypt 인증서 최초 발급 스크립트 (서버에서 1회만 실행)
#
# nginx 는 ssl_certificate 파일이 없으면 기동 자체가 실패한다.
# 그래서 임시 자체서명 인증서로 먼저 띄운 뒤, 실제 인증서를 받아 교체한다.
#
#   사용법:  ./scripts/init-letsencrypt.sh
#   사전조건: .env 에 DOMAIN / CERTBOT_EMAIL 이 설정되어 있을 것
#            도메인 A 레코드가 이 서버 IP 를 가리키고 있을 것
#            80/443 포트가 방화벽에서 열려 있을 것
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "오류: .env 가 없습니다. cp .env.example .env 후 값을 채우세요." >&2
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
CERTBOT_EMAIL="$(read_env CERTBOT_EMAIL)"
SERVER_NAMES="$(read_env SERVER_NAMES)"
STAGING="$(read_env CERTBOT_STAGING)"

[ -n "$DOMAIN" ]        || { echo "오류: .env 에 DOMAIN 을 설정하세요 (예: junpiks.com)" >&2; exit 1; }
[ -n "$CERTBOT_EMAIL" ] || { echo "오류: .env 에 CERTBOT_EMAIL 을 설정하세요 (만료 알림 수신용)" >&2; exit 1; }
SERVER_NAMES="${SERVER_NAMES:-$DOMAIN}"
STAGING="${STAGING:-0}"

# SERVER_NAMES 의 각 호스트를 -d 인자로 변환
CERT_DOMAINS=()
for host in $SERVER_NAMES; do
  CERT_DOMAINS+=(-d "$host")
done

echo "도메인      : $SERVER_NAMES"
echo "인증서 경로 : /etc/letsencrypt/live/$DOMAIN"
echo "연락 이메일 : $CERTBOT_EMAIL"
[ "$STAGING" != "0" ] && echo "※ staging 모드 (테스트용 인증서, 브라우저 신뢰 안 됨)"
echo
read -r -p "진행할까요? [y/N] " answer
[ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo "취소"; exit 1; }

LIVE_PATH="/etc/letsencrypt/live/$DOMAIN"

echo
echo "── 1/5 임시 자체서명 인증서 생성 ──────────────────────────────"
# nginx 가 일단 뜰 수 있도록 자리를 채운다.
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p '$LIVE_PATH' &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '$LIVE_PATH/privkey.pem' \
    -out    '$LIVE_PATH/fullchain.pem' \
    -subj '/CN=localhost' 2>/dev/null
"

echo
echo "── 2/5 앱 스택 기동 ───────────────────────────────────────────"
docker compose up -d

echo "   nginx 가 80 포트에 응답할 때까지 대기..."
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1/healthz"; then
    echo "   준비됨"
    break
  fi
  [ "$i" = "30" ] && { echo "   nginx 기동 실패"; docker compose logs --tail=50 nginx; exit 1; }
  sleep 2
done

echo
echo "── 3/5 임시 인증서 제거 ───────────────────────────────────────"
docker compose run --rm --entrypoint sh certbot -c "
  rm -rf /etc/letsencrypt/live/$DOMAIN \
         /etc/letsencrypt/archive/$DOMAIN \
         /etc/letsencrypt/renewal/$DOMAIN.conf
"

echo
echo "── 4/5 Let's Encrypt 인증서 발급 ──────────────────────────────"
STAGING_ARG=""
[ "$STAGING" != "0" ] && STAGING_ARG="--staging"

docker compose run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
  $STAGING_ARG \
  --email "$CERTBOT_EMAIL" \
  "${CERT_DOMAINS[@]}" \
  --rsa-key-size 4096 \
  --agree-tos \
  --no-eff-email \
  --non-interactive

echo
echo "── 5/5 nginx 재적용 ───────────────────────────────────────────"
docker compose exec nginx nginx -s reload

echo
echo "완료. 아래로 확인하세요."
echo "  curl -I https://$DOMAIN/"
echo
echo "갱신은 certbot 컨테이너가 12시간마다 자동으로 수행합니다."
