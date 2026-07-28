'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import { useSearchParams } from 'next/navigation';
import { getBlockComponent } from '@/lib/block-registry';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { PdfExportButton } from '@/components/ui/pdf-export-button';
import { useAppSelector } from '@/store/hooks';
function DashboardSignInPrompt() {
    return _jsx(SignInPanelGate, { requiredTier: "google" });
}
function BlockSection({ blockType, config, index, }) {
    const Component = getBlockComponent(blockType);
    const parsed = parseBlockConfig(blockType, config);
    const minTier = 'minTier' in parsed ? parsed.minTier : undefined;
    const block = _jsx(Component, { config: config });
    if (!minTier || minTier === 'public') {
        return _jsx(Box, { children: block }, `${blockType}-${index}`);
    }
    return (_jsx(AuthGate, { requiredTier: minTier, fallback: null, children: block }, `${blockType}-${index}`));
}
export function DynamicPage({ page }) {
    const tier = useAppSelector((s) => s.auth.tier);
    const platformAdmin = useAppSelector((s) => s.auth.platformAdmin);
    const searchParams = useSearchParams();
    const isPdf = searchParams.get('pdf') === '1';
    const showSignIn = page.slug === 'dashboard' && tier === 'public';
    return (_jsxs(Box, { component: "main", id: "pdfCapture", children: [_jsx(Box, { component: "h1", sx: {
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    whiteSpace: 'nowrap',
                }, children: page.title }), !isPdf && page.pdfExport && platformAdmin ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'flex-end', px: 3, pt: 2 }, children: _jsx(PdfExportButton, { page: `/${page.slug}`, label: "PDF" }) })) : null, page.sections.map((section, index) => (_jsx(BlockSection, { blockType: section.blockType, config: section.config, index: index }, `${section.blockType}-${index}`))), showSignIn ? _jsx(DashboardSignInPrompt, {}) : null] }));
}
