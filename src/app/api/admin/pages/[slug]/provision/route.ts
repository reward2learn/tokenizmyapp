/**
 * Provision a catalog-only page into Neon (app_pages + page_sections).
 *
 * POST /api/admin/pages/[slug]/provision?tenantSlug=&appId=
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWrite, requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { normalizeCmsScope } from '@shared/lib/cms-scope';
import { provisionAppPageFromCatalog } from '@shared/lib/page-cms-provision';
import { resolvePage } from '@/lib/page-catalog';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient(url: string) {
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const bodySchema = z.object({
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

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

  const { searchParams } = new URL(request.url);
  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);

  let bodyTenantSlug: string | undefined;
  let bodyAppId: string | undefined;
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (parsed.success) {
      bodyTenantSlug = parsed.data.tenantSlug;
      bodyAppId = parsed.data.appId;
    }
  } catch {
    // empty body is fine
  }

  const cmsScope = normalizeCmsScope({
    tenantSlug: isPlatformAdmin
      ? bodyTenantSlug ?? searchParams.get('tenantSlug') ?? undefined
      : getTenantConfig().slug,
    appId: isPlatformAdmin
      ? bodyAppId ?? searchParams.get('appId') ?? undefined
      : getCurrentAppId() || undefined,
  });

  const dbUrl = await resolveTenantDbUrl(cmsScope.tenantSlug, cmsScope.appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);
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
