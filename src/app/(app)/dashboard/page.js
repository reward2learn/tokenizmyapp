import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { AiFindingsBlock } from '@/components/blocks/ai-findings-block';
import { resolvePage } from '@/lib/page-catalog';
export default function DashboardPage() {
    const page = resolvePage('dashboard');
    if (!page) {
        return null;
    }
    return (_jsxs(AuthGate, { requiredTier: page.authTier, fallback: _jsx(SignInPanelGate, { requiredTier: page.authTier }), children: [_jsx(Suspense, { fallback: null, children: _jsx(DynamicPage, { page: page }) }), _jsx(AiFindingsBlock, {})] }));
}
