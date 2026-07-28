'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignInPanel } from '@/components/auth/sign-in-panel';
function SignInErrorOverlayInner() {
    const searchParams = useSearchParams();
    const hasAuthError = searchParams.get('auth') === 'error';
    const showSignIn = searchParams.get('show') === 'signin';
    if (!hasAuthError && !showSignIn)
        return null;
    return _jsx(SignInPanel, { requiredTier: "public" });
}
export function SignInErrorOverlay() {
    return (_jsx(Suspense, { fallback: null, children: _jsx(SignInErrorOverlayInner, {}) }));
}
