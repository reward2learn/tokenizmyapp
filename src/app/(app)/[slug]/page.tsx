import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { resolvePage } from '@/lib/page-catalog';
import type { PageDefinition, AuthTier } from '@/lib/page-catalog';

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

async function resolvePageWithDb(slug: string): Promise<PageDefinition | null> {
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
    // DB unavailable
  }
  return null;
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const page = await resolvePageWithDb(slug);
  if (!page) {
    notFound();
  }
  return (
    <AuthGate requiredTier={page.authTier} fallback={<SignInPanelGate requiredTier={page.authTier} />}>
      <Suspense fallback={null}>
        <DynamicPage page={page} />
      </Suspense>
    </AuthGate>
  );
}
