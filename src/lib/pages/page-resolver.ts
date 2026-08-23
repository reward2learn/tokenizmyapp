/**
 * Shared page resolver — prefers Neon (AppPage + PageSection) when a row
 * exists so seeded AI copy and CMS edits render. Falls back to the code-first
 * catalog when the DB has no page for that slug.
 *
 * Platform-app exception: `home` stays catalog-owned (factory brand SSoT).
 *
 * Used by:
 *  - app/(app)/[slug]/page.tsx (dynamic page routes)
 *  - app/page.tsx (root Home '/' rendering when it is the default route)
 */

import { getCurrentAppId, isPlatformApp } from '@shared/lib/config/tenant';
import { pageSlugLookupCandidates, toRoutePageSlug } from '@shared/lib/page-slug';
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
  const { PrismaClient } = await import('@/generated/prisma');
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return null;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    for (const storageSlug of pageSlugLookupCandidates(routeSlug, appId)) {
      const row = await prisma.appPage.findFirst({
        where: {
          slug: storageSlug,
          ...(appId ? { appId } : {}),
        },
        include: { sections: { orderBy: { sortOrder: 'asc' } } },
      });
      if (row) return mapDbPage(row, appId);
    }
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function resolvePageWithDb(slug: string): Promise<PageDefinition | null> {
  // Factory home: prefer Neon CMS when populated so SSR matches live edits;
  // fall back to the code catalog when the DB has no sections yet.
  if (isPlatformApp() && slug === 'home') {
    try {
      const fromDb = await loadPageFromDb(slug);
      if (fromDb && fromDb.sections.length > 0) {
        return {
          ...fromDb,
          sections: fromDb.sections.filter((s) => s.blockType !== 'sheet_viewer'),
        };
      }
    } catch {
      // DB unavailable — fall through to catalog.
    }
    return resolvePage('home');
  }

  try {
    const fromDb = await loadPageFromDb(slug);
    // A DB row with zero sections is treated as "not populated yet" so we can
    // fall back to the code catalog (tenant home after AI Content, etc.).
    if (fromDb && fromDb.sections.length > 0) {
      if (slug === 'home') {
        return {
          ...fromDb,
          sections: fromDb.sections.filter((s) => s.blockType !== 'sheet_viewer'),
        };
      }
      return fromDb;
    }
  } catch {
    // DB unavailable — fall through to catalog.
  }

  return resolvePage(slug);
}
