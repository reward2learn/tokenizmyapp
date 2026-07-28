import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { resolvePage } from '@/lib/page-catalog';
async function resolvePageWithDb(slug) {
    const fromCatalog = resolvePage(slug);
    if (fromCatalog)
        return fromCatalog;
    try {
        const { PrismaClient } = await import('@/generated/prisma');
        const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
        if (!url)
            return null;
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
                    authTier: (row.authTier ?? 'google'),
                    sections: row.sections.map((s) => ({
                        blockType: s.blockType,
                        config: (s.config ?? {}),
                    })),
                };
            }
        }
        finally {
            await prisma.$disconnect();
        }
    }
    catch {
        // DB unavailable
    }
    return null;
}
export default async function SlugPage({ params }) {
    const { slug } = await params;
    const page = await resolvePageWithDb(slug);
    if (!page) {
        notFound();
    }
    return (_jsx(AuthGate, { requiredTier: page.authTier, fallback: _jsx(SignInPanelGate, { requiredTier: page.authTier }), children: _jsx(Suspense, { fallback: null, children: _jsx(DynamicPage, { page: page }) }) }));
}
