/**
 * Admin Pages API — list AppPage rows and unlock CMS-locked content.
 *
 * GET  /api/admin/pages  — list pages (requires pages:read)
 * PUT  /api/admin/pages  — set contentLocked (requires pages:write)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRead, requireWrite, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensurePageCmsColumns, getPageCmsClient } from '@/lib/page-cms-db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const unlockSchema = z.object({
  slug: z.string().min(1).max(100),
  contentLocked: z.boolean(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireRead('pages', request);
  if (!guard.ok) return guard.response;

  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);

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
       ORDER BY p.sort_order ASC, p.slug ASC`,
    );

    return jsonOk({ pages });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireWrite('pages', request);
  if (!guard.ok) return guard.response;

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

  const { slug, contentLocked } = parsed.data;
  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);
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
