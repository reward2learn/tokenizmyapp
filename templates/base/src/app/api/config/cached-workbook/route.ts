/**
 * GET /api/config/cached-workbook
 *
 * Returns metadata for the last successfully cached workbook (filename, size,
 * upload time) so Config → Upload & Seed can offer "reseed from cache"
 * without forcing a re-upload.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  findCachedWorkbookInfo,
  type WorkbookCacheMeta,
} from '@/lib/workbook-cache';

export const dynamic = 'force-dynamic';

export interface CachedWorkbookInfoResponse {
  cached: true;
  appId: string;
  sizeBytes: number;
  meta: WorkbookCacheMeta;
  /** Primary display name (first file). */
  fileName: string;
}

export interface CachedWorkbookEmptyResponse {
  cached: false;
}

export type CachedWorkbookResponse = CachedWorkbookInfoResponse | CachedWorkbookEmptyResponse;

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const capabilityGuard = await requireCapability('config:write', request);
  if (!capabilityGuard.ok) return capabilityGuard.response;

  const prisma = new PrismaClient();
  try {
    const info = await findCachedWorkbookInfo(prisma);
    if (!info) {
      const empty: CachedWorkbookEmptyResponse = { cached: false };
      return jsonOk(empty);
    }

    const payload: CachedWorkbookInfoResponse = {
      cached: true,
      appId: info.appId,
      sizeBytes: info.sizeBytes,
      meta: info.meta,
      fileName: info.meta.files[0]?.fileName ?? 'workbook.xlsx',
    };
    return jsonOk(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read cached workbook';
    return jsonError(message, 500);
  } finally {
    await prisma.$disconnect();
  }
}
