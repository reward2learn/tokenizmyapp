import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DocMarkdownBlock } from '@/components/blocks/doc-markdown-block';
import { ReviewNav } from '@/components/review/review-nav';
import { createClient } from '@/lib/db';
import { getReviewPartContent } from '@/domain/content/review-part-service';
import { resolveReviewPart, setDynamicReviewParts } from '@/lib/page-catalog';
/** Avoid Prisma/Neon calls during `next build` static generation. */
export const dynamic = 'force-dynamic';
export default async function ReviewPartPage({ params }) {
    const { partSlug } = await params;
    // 1) Try the in-memory catalog first (static A–G or dynamically registered H–O)
    let part = resolveReviewPart(partSlug);
    // 2) If not in catalog, try loading from the DB (e.g. AI-generated parts)
    if (!part && process.env.POSTGRES_URL) {
        try {
            const { PrismaClient } = await import('@/generated/prisma');
            const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
            if (url) {
                const prisma = new PrismaClient({ datasources: { db: { url } } });
                try {
                    const row = await prisma.businessReviewPart.findUnique({
                        where: { slug: partSlug },
                    });
                    if (row) {
                        part = {
                            partSlug: row.slug,
                            partKey: row.partKey,
                            title: row.title ?? '',
                            authTier: (row.authTier ?? 'google'),
                        };
                        // Register in the in-memory catalog for subsequent requests
                        setDynamicReviewParts([
                            ...Object.values((await import('@/lib/page-catalog')).getReviewPartCatalog()),
                            part,
                        ]);
                    }
                }
                finally {
                    await prisma.$disconnect();
                }
            }
        }
        catch {
            // DB unavailable — 404
        }
    }
    if (!part) {
        notFound();
    }
    let initialMarkdown;
    if (process.env.POSTGRES_URL) {
        const content = await getReviewPartContent(createClient(), partSlug);
        initialMarkdown = content?.markdown;
    }
    return (_jsx(AuthGate, { requiredTier: part.authTier, fallback: _jsx(SignInPanelGate, { requiredTier: part.authTier }), children: _jsxs(Box, { sx: {
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
                mx: 'auto',
                gap: { xs: 0, md: 2 },
            }, children: [_jsx(ReviewNav, { currentSlug: partSlug }), _jsx(Box, { sx: { flex: 1, minWidth: 0 }, children: _jsx(DocMarkdownBlock, { config: {
                            source: `review:${part.partSlug}`,
                            title: part.title,
                        }, initialMarkdown: initialMarkdown }) })] }) }));
}
