/**
 * Restore Catalog Content — deletes DB page_sections and app_pages rows for
 * the platform app (tokenizmyapp) so the runtime resolver falls back to the
 * in-memory code catalog (PLATFORM_HOME, PLATFORM_PAGE_OVERRIDES).
 *
 * POST /api/admin/pages/restore-catalog
 * Body: { slugs?: string[] }  — pages to restore (default: ['home', 'dashboard'])
 *
 * Only works for the platform app (tokenizmyapp).
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { getTenantConfig } from '@shared/lib/config/tenant';

export const dynamic = 'force-dynamic';

const DEFAULT_SLUGS = ['home', 'dashboard'];

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;

  // Only the platform app can restore catalog content
  const tenantConfig = getTenantConfig();
  if (tenantConfig.slug !== 'tokenizmyapp') {
    return jsonError('Restore catalog is only available for the platform app (tokenizmyapp)', 403);
  }

  let body: { slugs?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is fine — use defaults
  }

  const slugs = body.slugs && body.slugs.length > 0 ? body.slugs : DEFAULT_SLUGS;

  const dbUrl = await resolveTenantDbUrl(tenantConfig.slug);
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    await addTenantColumnsIfMissing(prisma);

    const results: Array<{ slug: string; pagesDeleted: number; sectionsDeleted: number }> = [];

    for (const slug of slugs) {
      // Find the page row
      const pages = await prisma.$queryRawUnsafe<Array<{ id: string; slug: string }>>(
        `SELECT id, slug FROM app_pages WHERE slug = $1 AND (tenant_slug = $2 OR tenant_slug IS NULL) LIMIT 1;`,
        slug,
        tenantConfig.slug,
      );

      if (pages.length === 0) {
        results.push({ slug, pagesDeleted: 0, sectionsDeleted: 0 });
        continue;
      }

      const pageId = pages[0].id;

      // Delete page_sections first (FK constraint)
      const sectionsResult = await prisma.$executeRawUnsafe(
        `DELETE FROM page_sections WHERE page_id = $1;`,
        pageId,
      );

      // Delete the app_pages row
      const pagesResult = await prisma.$executeRawUnsafe(
        `DELETE FROM app_pages WHERE id = $1;`,
        pageId,
      );

      results.push({
        slug,
        pagesDeleted: Number(pagesResult),
        sectionsDeleted: Number(sectionsResult),
      });

      console.log(
        `[restore-catalog] Deleted ${sectionsResult} sections + ${pagesResult} page row for "${slug}" (tenant: ${tenantConfig.slug})`,
      );
    }

    return jsonOk({
      restored: true,
      slugs,
      results,
      message: `Restored catalog content for ${slugs.join(', ')}. The runtime resolver will now use the in-memory code catalog.`,
    });
  } catch (err) {
    console.error('[restore-catalog] Error:', err);
    return jsonError(`Failed to restore catalog content: ${(err as Error).message}`, 500);
  } finally {
    await prisma.$disconnect();
  }
}
