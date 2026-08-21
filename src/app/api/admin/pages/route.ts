/**
 * Admin Pages API — list AppPage rows and unlock CMS-locked content.
 *
 * GET  /api/admin/pages?tenantSlug=&appId=  — list pages (with section counts)
 * PUT  /api/admin/pages                    — set contentLocked (e.g. unlock for re-seed)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient(url: string) {
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const unlockSchema = z.object({
  slug: z.string().min(1).max(100),
  contentLocked: z.boolean(),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const tenantSlug = isPlatformAdmin ? searchParams.get('tenantSlug') : null;
  const appId = isPlatformAdmin ? searchParams.get('appId') : null;

  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);

    const where: string[] = [];
    const params: unknown[] = [];
    if (tenantSlug) {
      params.push(tenantSlug);
      where.push(`tenant_slug = $${params.length}`);
    }
    if (appId) {
      params.push(appId);
      where.push(`app_id = $${params.length}`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const pages = await prisma.$queryRawUnsafe<
      {
        id: string;
        slug: string;
        title: string;
        authTier: string;
        navLabel: string | null;
        showInNav: boolean;
        contentLocked: boolean;
        sortOrder: number;
        sectionCount: number;
      }[]
    >(
      `SELECT p.id, p.slug, p.title, p.auth_tier AS "authTier",
              p.nav_label AS "navLabel", COALESCE(p.show_in_nav, true) AS "showInNav",
              COALESCE(p.content_locked, false) AS "contentLocked",
              p.sort_order AS "sortOrder",
              (SELECT COUNT(*)::int FROM page_sections s WHERE s.page_id = p.id) AS "sectionCount"
       FROM app_pages p
       ${whereClause}
       ORDER BY p.sort_order ASC, p.slug ASC`,
      ...params,
    );

    return jsonOk({ pages });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }
  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  const { slug, contentLocked, tenantSlug, appId } = parsed.data;
  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);
    const result = await prisma.$executeRawUnsafe(
      `UPDATE app_pages SET content_locked = $1 WHERE slug = $2`,
      contentLocked,
      slug,
    );
    if (Number(result) === 0) return jsonError(`Page "${slug}" not found`, 404);
    return jsonOk({ slug, contentLocked });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
