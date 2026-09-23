// 업로드된 사진 서빙. 파일명이 랜덤이라 내용이 바뀌지 않으므로 오래 캐시한다.

import { contentTypeFor, readUpload } from '@/lib/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  const relative = (segments ?? []).join('/');

  const file = await readUpload(relative);
  if (!file) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(new Uint8Array(file.data), {
    status: 200,
    headers: {
      'Content-Type': contentTypeFor(relative),
      'Content-Length': String(file.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
