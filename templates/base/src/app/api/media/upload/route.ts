/**
 * Media Upload API — POST multipart form data.
 *
 * POST /api/media/upload   — upload a file, returns the created MediaAsset.
 *
 * Form fields:
 *   file      (required) — the file to upload
 *   altText   (optional) — alt text for accessibility
 *   tags      (optional) — comma-separated tag list
 *   width     (optional) — pixel width (images/video)
 *   height    (optional) — pixel height
 *   duration  (optional) — seconds (video/audio)
 *
 * Requires write auth (pin | google tier).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { MediaService } from '@/domain/media/media-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB hard cap

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('Invalid multipart form data', 400);
  }

  const fileEntry = formData.get('file');
  if (!fileEntry || !(fileEntry instanceof File)) {
    return jsonError('No file provided or "file" field is not a file', 400);
  }

  if (fileEntry.size > MAX_FILE_SIZE) {
    return jsonError(`File too large (max ${MAX_FILE_SIZE / (1024 * 1024)} MB)`, 413);
  }

  const altText = (formData.get('altText') as string | null) ?? undefined;
  const tagsRaw = formData.getAll('tags');
  const tags = tagsRaw
    .flatMap((t) => String(t).split(',').map((s) => s.trim()))
    .filter(Boolean);
  const width = formData.get('width') ? Number(formData.get('width')) : undefined;
  const height = formData.get('height') ? Number(formData.get('height')) : undefined;
  const duration = formData.get('duration') ? Number(formData.get('duration')) : undefined;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new MediaService(db);

  try {
    const asset = await service.upload(fileEntry, guard.session.sub, {
      altText,
      tags,
      width: Number.isFinite(width) ? width : undefined,
      height: Number.isFinite(height) ? height : undefined,
      duration: Number.isFinite(duration) ? duration : undefined,
    });
    return jsonOk({ asset }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/too large|1 MB|BLOB_READ_WRITE_TOKEN/i.test(msg)) {
      return jsonError(msg, 413);
    }
    console.error('[media/upload] POST error:', err);
    return jsonError('Failed to upload media', 500);
  }
}
