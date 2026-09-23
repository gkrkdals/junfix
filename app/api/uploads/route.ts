import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteUpload, MAX_UPLOAD_BYTES, storeImage } from '@/lib/uploads';
import {
  createMediaAsset,
  deleteMediaAsset,
  findMediaAsset,
  listMediaAssets,
  mediaUsage,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 업로드 목록 (관리자 사진 보관함) */
export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    return NextResponse.json(await listMediaAssets());
  } catch (error) {
    console.error('[uploads] GET 실패:', error);
    return NextResponse.json({ error: '업로드 목록 조회 실패' }, { status: 500 });
  }
}

/**
 * multipart/form-data 로 사진을 받는다. 필드명은 "files" (여러 개 가능).
 * 응답: { assets: [{ id, url, width, height }] , errors: [{ name, message }] }
 */
export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const form = await request.formData();
    const files = form
      .getAll('files')
      .concat(form.getAll('file'))
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const assets = [];
    const errors: { name: string; message: string }[] = [];

    for (const file of files) {
      try {
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error('파일이 10MB 를 넘습니다.');
        }
        const stored = await storeImage(Buffer.from(await file.arrayBuffer()));
        const asset = await createMediaAsset({
          url: stored.url,
          originalName: file.name.slice(0, 255),
          mimeType: stored.mimeType,
          width: stored.width,
          height: stored.height,
          size: stored.size,
        });
        assets.push(asset);
      } catch (error) {
        errors.push({
          name: file.name,
          message: error instanceof Error ? error.message : '처리 실패',
        });
      }
    }

    if (assets.length === 0) {
      return NextResponse.json({ error: errors[0]?.message || '업로드 실패', errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, assets, errors });
  } catch (error) {
    console.error('[uploads] POST 실패:', error);
    return NextResponse.json({ error: '업로드 처리 중 오류' }, { status: 500 });
  }
}

/** 파일과 메타데이터 삭제. 어딘가에서 쓰이는 사진은 force=1 이 없으면 거부한다. */
export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    const force = url.searchParams.get('force') === '1';
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 });
    }

    const asset = await findMediaAsset(id);
    if (!asset) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const usedIn = await mediaUsage(asset.url);
    if (usedIn.length > 0 && !force) {
      return NextResponse.json(
        { error: '사용 중인 사진입니다.', usedIn },
        { status: 409 }
      );
    }

    await deleteUpload(asset.url);
    await deleteMediaAsset(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[uploads] DELETE 실패:', error);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
