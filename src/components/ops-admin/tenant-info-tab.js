'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { getTemplate } from '@/domain/tenant/template-catalog';
export function TenantInfoTab() {
    const tenant = getClientTenantConfig();
    const template = getTemplate(tenant.slug === 'tokenizmyapp' ? 'default' : tenant.slug);
    const { data: brandData } = useGetBrandConfigQuery();
    const brand = brandData?.data;
    const effectiveTemplate = template?.label ?? brand?.tenantTemplate ?? 'default';
    return (_jsx(Paper, { variant: "outlined", sx: { p: 3 }, children: _jsxs(Stack, { spacing: 2.5, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Tenant Information" }), _jsxs(Stack, { spacing: 1.5, sx: { maxWidth: 500 }, children: [_jsx(InfoRow, { label: "Slug", value: tenant.slug }), _jsx(InfoRow, { label: "Display Name", value: brand?.tenantDisplayName ?? tenant.displayName }), _jsx(InfoRow, { label: "Template", value: effectiveTemplate, chip: effectiveTemplate !== 'default' ? effectiveTemplate : undefined }), _jsx(InfoRow, { label: "App URL", value: `https://${tenant.slug}.vercel.app`, link: `https://${tenant.slug}.vercel.app` }), brand?.brandPrimaryColor ? (_jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { minWidth: 120, fontWeight: 600 }, children: "Brand Colors" }), _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx(Box, { sx: { width: 24, height: 24, borderRadius: '50%', bgcolor: brand.brandPrimaryColor, border: '1px solid rgba(255,255,255,0.2)' } }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace' }, children: brand.brandPrimaryColor }), _jsx(Box, { sx: { width: 24, height: 24, borderRadius: '50%', bgcolor: brand.brandSecondaryColor, border: '1px solid rgba(255,255,255,0.2)' } }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace' }, children: brand.brandSecondaryColor })] })] })) : null, template && template.defaultPages.length > 0 ? (_jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'flex-start' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { minWidth: 120, fontWeight: 600, pt: 0.5 }, children: "Pages" }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap', gap: 0.5 }, children: template.defaultPages.map((p) => (_jsx(Chip, { label: p.title, size: "small", variant: "outlined" }, p.slug))) })] })) : null] })] }) }));
}
function InfoRow({ label, value, chip, link }) {
    return (_jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { minWidth: 120, fontWeight: 600 }, children: label }), link ? (_jsx(Button, { size: "small", variant: "text", href: link, target: "_blank", endIcon: _jsx(OpenInNewIcon, { fontSize: "small" }), sx: { fontSize: '0.8rem', textTransform: 'none' }, children: value })) : chip ? (_jsx(Chip, { label: chip, size: "small", variant: "outlined", color: "info" })) : (_jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: value }))] }));
}
