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

import { isPlatformApp } from '@shared/lib/config/tenant';
import { resolvePage } from '@/lib/page-catalog';
import type { PageDefinition, AuthTier } from '@/lib/page-catalog';

async function loadPageFromDb(slug: string): Promise<PageDefinition | null> {
  const { PrismaClient } = await import('@/generated/prisma');
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return null;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const row = await prisma.appPage.findUnique({
      where: { slug },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!row) return null;
    return {
      slug: row.slug,
      title: row.title,
      authTier: (row.authTier ?? 'google') as AuthTier,
      navLabel: row.navLabel ?? undefined,
      showInNav: row.showInNav,
      sections: row.sections.map((s) => ({
        blockType: s.blockType as PageDefinition['sections'][number]['blockType'],
        config: (s.config ?? {}) as Record<string, unknown>,
      })),
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function resolvePageWithDb(slug: string): Promise<PageDefinition | null> {
  // Factory marketing homepage is authored in page-catalog — not CMS/Neon.
  if (isPlatformApp() && slug === 'home') {
    return resolvePage('home');
  }

  try {
    const fromDb = await loadPageFromDb(slug);
    if (fromDb) return fromDb;
  } catch {
    // DB unavailable — fall through to catalog.
  }

  return resolvePage(slug);
}
