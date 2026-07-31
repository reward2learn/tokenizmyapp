/**
 * Shared page resolver — resolves a page definition from the code-first
 * catalog first, then falls back to the DB (AppPage + PageSection).
 *
 * Used by:
 *  - app/(app)/[slug]/page.tsx (dynamic page routes)
 *  - app/page.tsx (root Home '/' rendering when it is the default route)
 */

import { resolvePage } from '@/lib/page-catalog';
import type { PageDefinition, AuthTier } from '@/lib/page-catalog';

export async function resolvePageWithDb(slug: string): Promise<PageDefinition | null> {
  const fromCatalog = resolvePage(slug);
  if (fromCatalog) return fromCatalog;

  try {
    const { PrismaClient } = await import('@/generated/prisma');
    const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!url) return null;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const row = await prisma.appPage.findUnique({
        where: { slug },
        include: { sections: { orderBy: { sortOrder: 'asc' } } },
      });
      if (row) {
        return {
          slug: row.slug,
          title: row.title,
          authTier: (row.authTier ?? 'google') as AuthTier,
          sections: row.sections.map((s) => ({
            blockType: s.blockType as PageDefinition['sections'][number]['blockType'],
            config: (s.config ?? {}) as Record<string, unknown>,
          })),
        };
      }
    } finally {
      await prisma.$disconnect();
    }
  } catch {
    // DB unavailable — catalog-only resolution still applies above.
  }
  return null;
}
