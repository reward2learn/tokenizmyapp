/**
 * Shared page resolver — resolves a page definition from the code-first
 * catalog first, then falls back to the DB (AppPage + PageSection).
 *
 * Used by:
 *  - app/(app)/[slug]/page.tsx (dynamic page routes)
 *  - app/page.tsx (root Home '/' rendering when it is the default route)
 */

import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { resolveAppPageRow } from '@shared/lib/page-cms-resolve';
import { toRoutePageSlug } from '@shared/lib/page-slug';
import { resolvePage } from '@/lib/page-catalog';
import type { PageDefinition, AuthTier } from '@/lib/page-catalog';

function mapDbPage(
  row: {
    slug: string;
    title: string;
    authTier: string;
    navLabel: string | null;
    showInNav: boolean;
    sections: Array<{
      id: string;
      sortOrder: number;
      blockType: string;
      config: unknown;
    }>;
  },
  appId: string,
): PageDefinition {
  return {
    slug: toRoutePageSlug(row.slug, appId),
    title: row.title,
    authTier: (row.authTier ?? 'google') as AuthTier,
    navLabel: row.navLabel ?? undefined,
    showInNav: row.showInNav,
    sections: row.sections.map((s) => ({
      id: s.id,
      sortOrder: s.sortOrder,
      blockType: s.blockType as PageDefinition['sections'][number]['blockType'],
      config: (s.config ?? {}) as Record<string, unknown>,
    })),
  };
}

async function loadPageFromDb(routeSlug: string): Promise<PageDefinition | null> {
  const appId = getCurrentAppId();
  const tenantSlug = getTenantConfig().slug;
  const { PrismaClient } = await import('@/generated/prisma');
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return null;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const resolved = await resolveAppPageRow(prisma, routeSlug, { appId, tenantSlug });
    if (!resolved) return null;

    const row = await prisma.appPage.findFirst({
      where: { id: resolved.id },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!row) return null;
    return mapDbPage(row, appId);
  } finally {
    await prisma.$disconnect();
  }
}

export async function resolvePageWithDb(slug: string): Promise<PageDefinition | null> {
  const fromCatalog = resolvePage(slug);
  if (fromCatalog) return fromCatalog;

  try {
    return await loadPageFromDb(slug);
  } catch {
    // DB unavailable — catalog-only resolution still applies above.
  }
  return null;
}
