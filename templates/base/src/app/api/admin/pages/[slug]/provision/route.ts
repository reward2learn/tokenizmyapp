/**
 * Provision a catalog-only page into Neon (app_pages + page_sections).
 *
 * POST /api/admin/pages/[slug]/provision
 */

import { NextResponse } from 'next/server';
import { requireWrite, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensurePageCmsColumns, getPageCmsClient } from '@/lib/page-cms-db';
import { getCmsTenantAppScope } from '@shared/lib/cms-scope';
import { provisionAppPageFromCatalog } from '@shared/lib/page-cms-provision';
import { resolvePage } from '@/lib/page-catalog';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireWrite('pages', request);
  if (!guard.ok) return guard.response;

  const { slug: routeSlug } = await context.params;
  const catalogPage = resolvePage(routeSlug);
  if (!catalogPage) {
    return jsonError(`Page "${routeSlug}" is not defined in the page catalog`, 400);
  }

  const cmsScope = getCmsTenantAppScope();
  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);
    const result = await provisionAppPageFromCatalog(
      prisma,
      {
        slug: catalogPage.slug,
        title: catalogPage.title,
        authTier: catalogPage.authTier,
        navLabel: catalogPage.navLabel ?? null,
        showInNav: catalogPage.showInNav,
        sections: catalogPage.sections.map((s) => ({
          blockType: s.blockType,
          config: s.config as Record<string, unknown>,
        })),
      },
      { deploymentTenantSlug: cmsScope.deploymentSlug, appId: cmsScope.appId },
    );

    return jsonOk({
      slug: routeSlug,
      provisioned: true,
      created: result.created,
      sectionCount: result.sectionCount,
      pageId: result.id,
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
