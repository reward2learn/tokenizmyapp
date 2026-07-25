/**
 * Media List API — GET with optional filters.
 *
 * GET /api/media?type=image|video&tag=foo   — list media assets
 *
 * Query params:
 *   type  — "image" maps to mimeType prefix "image/", "video" → "video/"
 *   tag   — filter by a single tag
 *
 * Requires write auth (pin | google tier).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { MediaService, type MediaListFilter } from '@/domain/media/media-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TYPE_PREFIXES: Record<string, string> = {
  image: 'image/',
  video: 'video/',
};

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const tagParam = searchParams.get('tag');

  const filter: MediaListFilter = {};
  if (typeParam && TYPE_PREFIXES[typeParam]) {
    filter.mimeTypePrefix = TYPE_PREFIXES[typeParam];
  }
  if (tagParam) {
    filter.tags = [tagParam];
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new MediaService(db);

  try {
    const assets = await service.list(filter);
    return jsonOk({ assets });
  } catch (err) {
    console.error('[media] GET error:', err);
    return jsonError('Failed to list media assets', 500);
  }
}
