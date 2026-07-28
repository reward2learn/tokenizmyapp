import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { AuthGate } from '@/components/auth/auth-gate';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
const tenantConfig = getClientTenantConfig();
const FALLBACK_TITLE = tenantConfig.displayName;
const FALLBACK_SUBTITLE = 'Business Operations';
export function HeroBlock({ config }) {
    const { headline, subtitle, badge } = parseBlockConfig('hero', config);
    return (_jsxs(Box, { component: "section", sx: {
            textAlign: 'center',
            py: { xs: 7, md: 9 },
            px: 3,
            background: (theme) => `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(235, 61, 40, 0.08) 0%, transparent 70%), ${theme.palette.background.default}`,
        }, children: [badge ? (_jsx(Chip, { label: badge, size: "small", sx: {
                    mb: 2.5,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'text.primary',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                } })) : null, _jsxs(Typography, { variant: "h2", component: "h1", sx: {
                    fontWeight: 800,
                    fontSize: { xs: '2.2rem', md: '3.4rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.08,
                }, children: [headline ?? FALLBACK_TITLE, _jsx("br", {}), _jsx(Box, { component: "span", sx: { color: 'primary.main' }, children: headline ? '& Turnaround Strategy' : FALLBACK_SUBTITLE })] }), subtitle ? (_jsx(Typography, { variant: "body1", sx: { mt: 1.75, color: 'text.secondary', maxWidth: 600, mx: 'auto' }, children: subtitle })) : null, _jsx(AuthGate, { requiredTier: "pin", fallback: null, children: _jsx(Grid, { container: true, spacing: 2, sx: { mt: 6, maxWidth: 560, mx: 'auto' }, children: _jsxs(AuthGate, { requiredTier: "google", fallback: _jsx(Grid, { size: { xs: 12 }, children: _jsx(ReportCard, { href: "/ops-admin", title: "Ops Admin" }) }), children: [_jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsx(ReportCard, { href: "/summary", title: "Executive Summary" }) }), _jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsx(ReportCard, { href: "/review/part-a", title: "Full Business Review" }) })] }) }) })] }));
}
function ReportCard({ href, title }) {
    return (_jsx(Paper, { component: Link, href: href, elevation: 0, sx: {
            display: 'block',
            p: 3,
            textDecoration: 'none',
            color: 'inherit',
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            transition: 'all 0.25s ease',
            '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(235, 61, 40, 0.06)',
                transform: 'translateY(-2px)',
            },
        }, children: _jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: title }) }));
}
