/**
 * DB 가 TCP 로 연결을 받아줄 때까지 기다린다.
 *
 * MariaDB 는 최초 기동 시 --skip-networking 으로 임시 서버를 띄워
 * 시스템 테이블과 계정을 만든다. 이 구간에서는 유닉스 소켓으로만 붙을 수 있어
 * healthcheck 는 통과하는데 TCP 접속은 거부된다.
 * 그 사이에 prisma 가 붙으려다 P1001 로 죽는 것을 막는다.
 */

const net = require('net');

const HOST = process.env.DB_HOST || 'mariadb';
const PORT = Number(process.env.DB_PORT || 3306);
const TIMEOUT_MS = Number(process.env.DB_WAIT_TIMEOUT_MS || 120000);
const INTERVAL_MS = 2000;

function tryConnect() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: HOST, port: PORT });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(3000);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

(async () => {
  const deadline = Date.now() + TIMEOUT_MS;
  let attempt = 0;

  while (Date.now() < deadline) {
    attempt += 1;
    if (await tryConnect()) {
      console.log(`DB 연결 가능 (${HOST}:${PORT}, ${attempt}번째 시도)`);
      process.exit(0);
    }
    console.log(`DB 기동 대기 중... (${HOST}:${PORT}, ${attempt}번째 시도)`);
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  console.error(
    `오류: ${TIMEOUT_MS / 1000}초 안에 ${HOST}:${PORT} 에 연결하지 못했습니다.`
  );
  process.exit(1);
})();
