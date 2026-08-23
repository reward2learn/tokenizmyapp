/**
 * POST /api/admin/cms/ensure-hero-routes
 * Provision app_pages + navigation for hero CTA hrefs.
 */

import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWrite, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { normalizeCmsScope } from '@shared/lib/cms-scope';
import { ensureHeroNavRoutes } from '@/domain/cms/ensure-hero-nav-routes';
import { resolvePage } from '@/lib/page-catalog';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const bodySchema = z.object({
  heroConfig: z.record(z.unknown()).optional(),
  navButtons: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .optional(),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

function getClient(url: string) {
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

export async function POST(request: Request) {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireWrite('pages', request);
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Invalid request body', 400);
  }

  if (!body.heroConfig && (!body.navButtons || body.navButtons.length === 0)) {
    return jsonError('heroConfig or navButtons required', 400);
  }

  const cmsScope = normalizeCmsScope({
    tenantSlug: body.tenantSlug ?? getTenantConfig().slug,
    appId: body.appId ?? getCurrentAppId() || undefined,
  });
  const dbUrl = await resolveTenantDbUrl(cmsScope.tenantSlug, cmsScope.appId);
  const prisma = getClient(dbUrl);

  try {
    await addTenantColumnsIfMissing(prisma);
    const payload = body.navButtons ?? body.heroConfig ?? {};
    const result = await ensureHeroNavRoutes(prisma, payload, {
      tenantSlug: cmsScope.deploymentSlug,
      appId: cmsScope.appId,
      resolveCatalogPage: (slug) => {
        const page = resolvePage(slug);
        if (!page) return null;
        return {
          slug: page.slug,
          title: page.title,
          authTier: page.authTier,
          navLabel: page.navLabel ?? page.title,
          showInNav: page.showInNav,
          sections: page.sections.map((s) => ({
            blockType: s.blockType,
            config: s.config as Record<string, unknown>,
          })),
        };
      },
    });
    return jsonOk(result);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
