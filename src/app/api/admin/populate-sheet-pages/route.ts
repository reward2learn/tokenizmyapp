import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureNavigationTable, syncSheetPagesIntoNavigation } from '@/lib/navigation/db';
import { getCurrentAppId, getTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const bodySchema = z.object({
  parentId: z.string().optional(),
  parentTitle: z.string().optional(),
});

/**
 * POST /api/admin/populate-sheet-pages
 *
 * Syncs navigation_items for all app_pages with slug LIKE 'sheet-%'.
 * Without parentId: creates/reuses a public Excel folder (empty route), clears its
 * children, and repopulates current sheet pages.
 * With parentId: replaces sheet children under that folder only.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (isPlatformApp() && !sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Invalid JSON', 400); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);

  const prisma = getClient();
  const scope = {
    tenantSlug: getTenantConfig().slug,
    appId: getCurrentAppId(),
  };

  try {
    await ensureNavigationTable(prisma);
    const result = await syncSheetPagesIntoNavigation(prisma, scope, {
      parentId: parsed.data.parentId,
    });
    return jsonOk({
      created: result.created,
      parentId: result.parentId,
      totalSheets: result.totalSheets,
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
