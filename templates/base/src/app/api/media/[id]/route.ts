/**
 * Media Detail API — single asset by id.
 *
 * GET    /api/media/[id]   — read one media asset
 * DELETE /api/media/[id]   — delete one media asset (removes from Vercel Blob if applicable)
 *
 * Requires write auth (pin | google tier).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { MediaService } from '@/domain/media/media-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ── GET (detail) ───────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new MediaService(db);

  try {
    const asset = await service.getById(id);
    if (!asset) return jsonError('Media asset not found', 404);
    return jsonOk({ asset });
  } catch (err) {
    console.error(`[media] GET /${id} error:`, err);
    return jsonError('Failed to fetch media asset', 500);
  }
}

// ── DELETE ─────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new MediaService(db);

  try {
    await service.delete(id);
    return jsonOk({ deleted: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Media asset not found', 404);
    console.error(`[media] DELETE /${id} error:`, err);
    return jsonError('Failed to delete media asset', 500);
  }
}
