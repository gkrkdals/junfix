# 프록시 공통 헤더.
# nginx 는 location 에 proxy_set_header 가 하나라도 있으면 상위 레벨 헤더를
# 전부 무시하므로, 모든 location 에서 이 파일을 include 해야 한다.
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host  $host;
