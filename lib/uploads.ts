// 사진 업로드 저장소.
//
// 파일은 UPLOAD_DIR(기본 ./uploads) 아래 "YYYYMM/<랜덤>.jpg" 로 저장하고,
// /uploads/YYYYMM/<랜덤>.jpg 경로로 서빙한다 (app/uploads/[...path]/route.ts).
// 휴대폰 사진은 수 MB 가 넘으므로 sharp 로 최대 1600px 로 줄이고 EXIF 회전을 적용한다.

import 'server-only';

import { randomBytes } from 'crypto';
import { mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const UPLOAD_URL_PREFIX = '/uploads';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 82;

const ALLOWED_INPUT = new Set(['jpeg', 'png', 'webp', 'heif', 'avif', 'gif', 'tiff']);

export function uploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return path.resolve(configured || path.join(process.cwd(), 'uploads'));
}

export interface StoredImage {
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

function yearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 업로드된 바이너리를 검증·리사이즈해서 저장한다.
 * 이미지가 아니거나 손상된 파일이면 예외를 던진다.
 */
export async function storeImage(buffer: Buffer): Promise<StoredImage> {
  if (buffer.length === 0) throw new Error('빈 파일입니다.');
  if (buffer.length > MAX_UPLOAD_BYTES) throw new Error('파일이 10MB 를 넘습니다.');

  // 확장자나 Content-Type 은 신뢰하지 않고 실제 내용으로 판별한다.
  const image = sharp(buffer, { failOn: 'error' });
  const meta = await image.metadata();
  if (!meta.format || !ALLOWED_INPUT.has(meta.format)) {
    throw new Error('지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP, HEIC)');
  }

  // 회전 정보 반영 + 축소 + JPEG 저장. 투명 PNG 도 흰 배경으로 합친다.
  const output = await image
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const folder = yearMonth();
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.jpg`;
  const absDir = path.join(uploadDir(), folder);
  await mkdir(absDir, { recursive: true });
  await writeFile(path.join(absDir, name), output.data);

  return {
    url: `${UPLOAD_URL_PREFIX}/${folder}/${name}`,
    width: output.info.width,
    height: output.info.height,
    size: output.info.size,
    mimeType: 'image/jpeg',
  };
}

/**
 * /uploads/... URL 을 디스크 경로로 바꾼다.
 * 업로드 폴더 밖을 가리키면 null (경로 탈출 방지).
 */
export function resolveUploadPath(urlOrRelative: string): string | null {
  let rel = urlOrRelative;
  if (rel.startsWith(UPLOAD_URL_PREFIX + '/')) rel = rel.slice(UPLOAD_URL_PREFIX.length + 1);
  rel = rel.replace(/^\/+/, '');

  // 세그먼트에 ".." 이나 이상한 문자가 있으면 거부
  if (!/^[A-Za-z0-9_\-./]+$/.test(rel) || rel.split('/').some((seg) => seg === '' || seg === '..' || seg === '.')) {
    return null;
  }

  const base = uploadDir();
  const abs = path.resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + path.sep)) return null;
  return abs;
}

export async function readUpload(urlOrRelative: string): Promise<{ data: Buffer; size: number } | null> {
  const abs = resolveUploadPath(urlOrRelative);
  if (!abs) return null;
  try {
    const info = await stat(abs);
    if (!info.isFile()) return null;
    return { data: await readFile(abs), size: info.size };
  } catch {
    return null;
  }
}

export async function deleteUpload(urlOrRelative: string): Promise<void> {
  const abs = resolveUploadPath(urlOrRelative);
  if (!abs) return;
  try {
    await unlink(abs);
  } catch {
    // 이미 없으면 무시
  }
}

export function contentTypeFor(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}
