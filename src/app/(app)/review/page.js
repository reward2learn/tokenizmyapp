import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { resolvePage } from '@/lib/page-catalog';
export default function ReviewPage() {
    const page = resolvePage('review');
    if (!page) {
        return null;
    }
    return (_jsx(AuthGate, { requiredTier: page.authTier, fallback: _jsx(SignInPanelGate, { requiredTier: page.authTier }), children: _jsx(Suspense, { fallback: null, children: _jsx(DynamicPage, { page: page }) }) }));
}
