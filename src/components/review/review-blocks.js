'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { getReviewPartDisplayTitle, listReviewParts, setDynamicReviewParts } from '@/lib/page-catalog';
import { useGetReviewPartQuery } from '@/store/apis/content-api';
import { useGetSeedDetailsQuery } from '@/store/apis/config-api';
import { AiFindingsBlock } from '@/components/blocks/ai-findings-block';
import { useEffect, useMemo, useState } from 'react';
const reviewCardSx = {
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'rgba(255,255,255,0.03)',
    minWidth: 0,
    overflow: 'auto',
};
function excerpt(markdown) {
    if (!markdown)
        return 'Seeded review content is not available yet. Open the part page for the catalog title.';
    return markdown
        .replace(/^#+\s+/gm, '')
        .replace(/\|.+\|/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 260);
}
function ReviewPartBlock({ partSlug }) {
    const router = useRouter();
    const { data, isLoading } = useGetReviewPartQuery(partSlug);
    const href = `/review/${partSlug}`;
    return (_jsx(Paper, { id: partSlug, elevation: 0, onClick: () => router.push(href), onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(href);
        } }, tabIndex: 0, role: "button", "aria-label": `Open ${data?.title ?? partSlug}`, sx: {
            ...reviewCardSx,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            maxHeight: { xs: 'min(420px, 70dvh)', md: 360 },
            p: 2.5,
            cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 1px rgba(235,61,40,0.2)',
            },
            '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
            },
        }, children: _jsxs(Stack, { spacing: 1.5, sx: { flex: 1, minHeight: 0, minWidth: 0 }, children: [_jsx(Typography, { variant: "h6", component: "h2", sx: { fontWeight: 800, flexShrink: 0 }, children: data?.title ?? partSlug }), _jsx(Box, { sx: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }, children: isLoading ? (_jsx(CircularProgress, { size: 20 })) : (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { wordBreak: 'break-word' }, children: excerpt(data?.markdown) })) }), _jsx(Button, { component: Link, href: href, variant: "outlined", sx: { alignSelf: 'flex-start', flexShrink: 0 }, onClick: (e) => e.stopPropagation(), children: "Open Part" })] }) }));
}
const ANCHOR_SELECT_LABEL = 'Jump to review section';
const PART_GROUPS = [
    { range: 'A–D', slugs: ['part-a', 'part-b', 'part-c', 'part-d'], desc: 'current situation, action plan, projections, and risk register' },
    { range: 'E–H', slugs: ['part-e', 'part-f', 'part-g', 'part-h'], desc: 'menu, timeline, immediate actions, and website review' },
    { range: 'I–L', slugs: ['part-i', 'part-j', 'part-k', 'part-l'], desc: 'revenue drivers, competitive context, AI automation, and final assessment' },
    { range: 'M–O', slugs: ['part-m', 'part-n', 'part-o'], desc: 'partnerships, ecosystem strategy, and tax notes' },
];
export function ReviewBlocks() {
    const { data: seedData, isLoading: seedLoading } = useGetSeedDetailsQuery();
    const [dbState, setDbState] = useState('loading');
    // On mount, register all review parts from the DB in the catalog
    useEffect(() => {
        if (seedLoading)
            return;
        const details = seedData?.data?.reviewPartDetails;
        if (details?.length) {
            const parts = details.map((p) => ({
                partSlug: p.slug,
                partKey: p.partKey,
                title: p.title,
                authTier: 'google',
            }));
            setDynamicReviewParts(parts);
            setDbState('populated');
        }
        else {
            setDbState('empty');
        }
    }, [seedData, seedLoading]);
    const parts = useMemo(() => {
        if (dbState !== 'populated')
            return [];
        return listReviewParts();
    }, [dbState]);
    const scrollToPart = (partSlug) => {
        globalThis.document
            ?.getElementById(partSlug)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // ── Loading state ──────────────────────────────────────
    if (dbState === 'loading') {
        return (_jsx(Box, { component: "section", sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }, children: _jsx(CircularProgress, { size: 28 }) }));
    }
    // ── Empty state — no seeded content in database ────────
    if (dbState === 'empty') {
        return (_jsx(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 4 }, children: _jsx(Typography, { variant: "h6", color: "text.secondary", sx: { textAlign: 'center', py: 8 }, children: "No Business Review content available. Seed the database or generate content via the AI Content Generation tab." }) }));
    }
    // ── Populated — render all review blocks ───────────────
    return (_jsx(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 4, minWidth: 0 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "overline", color: "primary.main", sx: { fontWeight: 700 }, children: "Business Review" }), _jsx(Typography, { variant: "h4", component: "h1", sx: { fontWeight: 800 }, children: "Review Blocks A-O" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "The full June 2026 review is split into accessible blocks with dedicated part pages for deep reading and PDF export." })] }), _jsxs(Paper, { elevation: 0, sx: { ...reviewCardSx, p: 2.5 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1 }, children: "Anchor Navigation" }), _jsx(Box, { sx: { display: { xs: 'block', md: 'none' } }, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "review-anchor-select-label", children: ANCHOR_SELECT_LABEL }), _jsx(Select, { labelId: "review-anchor-select-label", id: "review-anchor-select", value: "", displayEmpty: true, label: ANCHOR_SELECT_LABEL, onChange: (event) => scrollToPart(event.target.value), inputProps: { 'aria-label': ANCHOR_SELECT_LABEL }, renderValue: () => ANCHOR_SELECT_LABEL, children: parts.map((part) => (_jsx(MenuItem, { value: part.partSlug, children: getReviewPartDisplayTitle(part.title) }, part.partSlug))) })] }) }), _jsx(Stack, { direction: "row", sx: { display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap', gap: 1, minWidth: 0 }, children: parts.map((part) => (_jsx(Button, { href: `#${part.partSlug}`, size: "small", variant: "text", sx: { textAlign: 'left', whiteSpace: 'normal', lineHeight: 1.35 }, children: getReviewPartDisplayTitle(part.title) }, part.partSlug))) })] }), _jsx(Grid, { container: true, spacing: 2, sx: { minWidth: 0 }, children: parts.map((part) => (_jsx(Grid, { size: { xs: 12, md: 6 }, sx: { display: 'flex', minWidth: 0, minHeight: 0 }, children: _jsx(ReviewPartBlock, { partSlug: part.partSlug }) }, part.partSlug))) }), _jsxs(Paper, { elevation: 0, sx: {
                        ...reviewCardSx,
                        p: 2.5,
                        bgcolor: 'rgba(235,61,40,0.08)',
                        maxHeight: { xs: 'min(320px, 50dvh)', md: 'none' },
                        '@media print': { breakInside: 'avoid' },
                    }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 800, mb: 1.5 }, children: "Review Operating Notes" }), _jsx(Stack, { spacing: 1, children: PART_GROUPS.map((group) => {
                                // Only show a group when all its slugs are present in the catalog
                                const existingSlugs = group.slugs.filter((slug) => parts.some((p) => p.partSlug === slug));
                                if (existingSlugs.length === 0)
                                    return null;
                                return (_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Use Parts", ' ', existingSlugs.map((slug, idx) => {
                                            const { title } = parts.find((p) => p.partSlug === slug) ?? {};
                                            const isLast = idx === existingSlugs.length - 1;
                                            const display = title ? getReviewPartDisplayTitle(title) : `Part ${slug.replace('part-', '').toUpperCase()}`;
                                            return (_jsxs("span", { children: [_jsx(Link, { href: `/review/${slug}`, style: { textDecoration: 'none' }, onClick: (e) => e.stopPropagation(), children: _jsx(Typography, { component: "span", variant: "body2", sx: {
                                                                color: 'primary.main',
                                                                fontWeight: 600,
                                                                '&:hover': { textDecoration: 'underline', color: 'primary.light' },
                                                            }, children: display }) }), isLast ? '' : ', '] }, slug));
                                        }), ' ', "for ", group.desc, "."] }, group.range));
                            }) })] }), _jsx(AiFindingsBlock, {})] }) }));
}
