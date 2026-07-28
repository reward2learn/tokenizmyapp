'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/store/hooks';
function isPlatformAdminSession(platformAdmin, groups) {
    return Boolean(platformAdmin) || groups.includes('platform-admin');
}
/**
 * Renders children only when the signed-in session is a platform administrator
 * (claim or platform-admin group). Otherwise shows the fallback — or, when already
 * signed in without admin rights, an access-denied message instead of re-prompting
 * for sign-in.
 */
export function PlatformAdminGate({ children, fallback }) {
    const { platformAdmin, bootstrapped, tier, groups } = useAppSelector((s) => s.auth);
    if (!bootstrapped) {
        return _jsx("p", { children: "Checking session\u2026" });
    }
    if (isPlatformAdminSession(platformAdmin, groups ?? [])) {
        return _jsx(_Fragment, { children: children });
    }
    // Already authenticated but not platform admin — don't loop the sign-in form.
    if (tier !== 'public') {
        return (_jsxs(Box, { sx: { py: 6, px: 3, textAlign: 'center' }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 1 }, children: "Platform admin access required" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "You are signed in, but this page is limited to platform administrators. Sign out and use the Platform Admin role, or ask an admin to grant the platform-admin group." })] }));
    }
    return (fallback ?? (_jsx("p", { style: { padding: 24, textAlign: 'center', color: '#888' }, children: "Platform admin access required." })));
}
