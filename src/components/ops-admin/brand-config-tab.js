'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetAdminBrandConfigQuery, useUpdateAdminBrandConfigMutation } from '@/store/apis/admin-api';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;
function isValidHex(c) {
    return HEX_REGEX.test(c);
}
export function BrandConfigTab() {
    const { data: brandData, isLoading } = useGetAdminBrandConfigQuery();
    const [updateBrandConfig, { isLoading: isSaving }] = useUpdateAdminBrandConfigMutation();
    const [config, setConfig] = useState({
        tenantSlug: '',
        tenantDisplayName: '',
        tenantTemplate: 'default',
        brandLogoText: '',
        brandLogoUrl: '',
        brandPrimaryColor: '#eb3d28',
        brandSecondaryColor: '#0af9fe',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);
    // ── Map RTK Query response into local config state ────
    useEffect(() => {
        if (brandData?.success && brandData.data) {
            const c = brandData.data;
            setConfig(c);
            setLogoPreview(c.brandLogoUrl || null);
        }
        else if (brandData?.success === false) {
            setError(brandData.error ?? 'Failed to load brand config');
        }
    }, [brandData]);
    const handleSave = useCallback(async () => {
        setError(null);
        setSuccess(false);
        // Validate hex colors
        if (!isValidHex(config.brandPrimaryColor)) {
            setError('Primary color must be a valid hex color (e.g. #eb3d28)');
            return;
        }
        if (!isValidHex(config.brandSecondaryColor)) {
            setError('Secondary color must be a valid hex color (e.g. #0af9fe)');
            return;
        }
        try {
            const formData = new FormData();
            if (config.tenantSlug)
                formData.append('tenantSlug', config.tenantSlug);
            if (config.tenantDisplayName)
                formData.append('tenantDisplayName', config.tenantDisplayName);
            if (config.tenantTemplate)
                formData.append('tenantTemplate', config.tenantTemplate);
            formData.append('brandLogoText', config.brandLogoText);
            formData.append('brandPrimaryColor', config.brandPrimaryColor);
            formData.append('brandSecondaryColor', config.brandSecondaryColor);
            // Include the logo URL if we have one (either existing or newly uploaded)
            if (logoPreview && logoPreview.startsWith('data:')) {
                formData.append('brandLogoUrl', logoPreview);
            }
            else if (config.brandLogoUrl && config.brandLogoUrl.startsWith('data:')) {
                formData.append('brandLogoUrl', config.brandLogoUrl);
            }
            const payload = await updateBrandConfig(formData).unwrap();
            if (payload.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
            else {
                throw new Error(payload.error ?? 'Save failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }, [config.tenantSlug, config.tenantDisplayName, config.tenantTemplate, config.brandLogoText, config.brandPrimaryColor, config.brandSecondaryColor, logoPreview, updateBrandConfig]);
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (file.size > 2 * 1024 * 1024) {
            setError('Logo image must be under 2 MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result;
            setLogoPreview(dataUrl);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);
    const handleRemoveLogo = useCallback(() => {
        setLogoPreview(null);
        setConfig((prev) => ({ ...prev, brandLogoUrl: '' }));
    }, []);
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsx(Stack, { spacing: 3, children: _jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: "Brand Configuration" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Configure the tenant identity, logo, colors, and branding displayed across the application. Changes take effect immediately." }), _jsxs(Stack, { spacing: 3, children: [_jsxs(Paper, { variant: "outlined", sx: { p: 2, bgcolor: 'rgba(255,255,255,0.02)' }, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: "Tenant Identity" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "These settings define the tenant's identity. The slug is used for subdomain URL derivation (e.g. \"redrubybali\" \u2192 redrubybali.vercel.app)." }), _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Tenant Slug", placeholder: "e.g. redrubybali", value: config.tenantSlug, onChange: (e) => setConfig((prev) => ({ ...prev, tenantSlug: e.target.value })), fullWidth: true, helperText: "Subdomain identifier \u2014 lowercase, no spaces (e.g. 'mybusiness'). Leave empty to use env var default." }), _jsx(TextField, { label: "Display Name", placeholder: "e.g. Red Ruby Bali", value: config.tenantDisplayName, onChange: (e) => setConfig((prev) => ({ ...prev, tenantDisplayName: e.target.value })), fullWidth: true, helperText: "Human-readable business name shown in the header, chat labels, and page titles." }), _jsx(TextField, { label: "Template", placeholder: "e.g. nightclub-bar", value: config.tenantTemplate, onChange: (e) => setConfig((prev) => ({ ...prev, tenantTemplate: e.target.value })), fullWidth: true, helperText: "Template category for default pages and navigation (e.g. 'nightclub-bar', 'restaurant', 'hotel')." })] })] }), _jsx(TextField, { label: "Logo Text", placeholder: "e.g. Red Ruby Bali", value: config.brandLogoText, onChange: (e) => setConfig((prev) => ({ ...prev, brandLogoText: e.target.value })), fullWidth: true, helperText: "This text appears in the top-left header when no logo image is set." }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 1 }, children: "Logo Image" }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1.5, display: 'block' }, children: "Upload a logo image (PNG, JPG, SVG, WebP \u2014 max 2 MB). Replaces the text logo in the header." }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(Avatar, { src: logoPreview ?? undefined, variant: "rounded", sx: {
                                                width: 60,
                                                height: 60,
                                                bgcolor: 'action.hover',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                '& img': { objectFit: 'contain' },
                                            }, children: _jsx(ImageIcon, { color: "disabled" }) }), _jsxs(Button, { variant: "outlined", component: "label", startIcon: _jsx(ImageIcon, {}), children: [logoPreview ? 'Replace Image' : 'Upload Logo', _jsx("input", { hidden: true, type: "file", accept: "image/png,image/jpeg,image/svg+xml,image/webp,image/gif", ref: fileInputRef, onChange: handleFileSelect })] }), logoPreview ? (_jsx(Button, { variant: "text", color: "error", startIcon: _jsx(DeleteIcon, {}), onClick: handleRemoveLogo, children: "Remove" })) : null] }), config.brandLogoText || logoPreview ? (_jsxs(Paper, { variant: "outlined", sx: {
                                        mt: 2,
                                        p: 2,
                                        bgcolor: 'background.default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                    }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { flexShrink: 0 }, children: "Preview:" }), logoPreview ? (_jsx(Box, { component: "img", src: logoPreview, alt: "Logo preview", sx: { height: 28, width: 'auto', maxWidth: 160, objectFit: 'contain' } })) : (_jsx(Typography, { variant: "subtitle1", sx: { pl: 1, fontWeight: 800, color: config.brandPrimaryColor }, children: config.brandLogoText || '(no logo text set)' }))] })) : null] }), _jsxs(Box, { children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', mb: 1 }, children: [_jsx(PaletteIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle2", children: "Brand Colors" })] }), _jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mb: 2, display: 'block' }, children: ["These colors are used as the application's primary and secondary theme colors (buttons, links, highlights, accents). Enter hex values (e.g. ", _jsx("code", { children: "#eb3d28" }), ")."] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, children: [_jsxs(Box, { sx: { flex: 1 }, children: [_jsx(TextField, { label: "Primary Color", placeholder: "#eb3d28", value: config.brandPrimaryColor, onChange: (e) => setConfig((prev) => ({ ...prev, brandPrimaryColor: e.target.value })), error: config.brandPrimaryColor.length > 0 && !isValidHex(config.brandPrimaryColor), helperText: config.brandPrimaryColor.length > 0 && !isValidHex(config.brandPrimaryColor)
                                                        ? 'Invalid hex color'
                                                        : 'Used for buttons, links, and highlights', fullWidth: true, slotProps: {
                                                        input: {
                                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Box, { sx: {
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: '4px',
                                                                        bgcolor: isValidHex(config.brandPrimaryColor) ? config.brandPrimaryColor : '#eb3d28',
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        flexShrink: 0,
                                                                    } }) })),
                                                        },
                                                    } }), _jsx("input", { type: "color", value: isValidHex(config.brandPrimaryColor) ? config.brandPrimaryColor : '#eb3d28', onChange: (e) => setConfig((prev) => ({ ...prev, brandPrimaryColor: e.target.value })), style: {
                                                        width: '100%',
                                                        height: 32,
                                                        marginTop: 4,
                                                        padding: 0,
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        borderRadius: 6,
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                    } })] }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(TextField, { label: "Secondary Color", placeholder: "#0af9fe", value: config.brandSecondaryColor, onChange: (e) => setConfig((prev) => ({ ...prev, brandSecondaryColor: e.target.value })), error: config.brandSecondaryColor.length > 0 && !isValidHex(config.brandSecondaryColor), helperText: config.brandSecondaryColor.length > 0 && !isValidHex(config.brandSecondaryColor)
                                                        ? 'Invalid hex color'
                                                        : 'Used for accents and secondary elements', fullWidth: true, slotProps: {
                                                        input: {
                                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Box, { sx: {
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: '4px',
                                                                        bgcolor: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe',
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        flexShrink: 0,
                                                                    } }) })),
                                                        },
                                                    } }), _jsx("input", { type: "color", value: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe', onChange: (e) => setConfig((prev) => ({ ...prev, brandSecondaryColor: e.target.value })), style: {
                                                        width: '100%',
                                                        height: 32,
                                                        marginTop: 4,
                                                        padding: 0,
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        borderRadius: 6,
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                    } })] })] }), _jsxs(Paper, { variant: "outlined", sx: {
                                        mt: 2,
                                        p: 2,
                                        bgcolor: 'background.default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flexWrap: 'wrap',
                                    }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Preview:" }), _jsx(Box, { sx: {
                                                px: 2,
                                                py: 0.75,
                                                borderRadius: 1,
                                                bgcolor: isValidHex(config.brandPrimaryColor) ? config.brandPrimaryColor : '#eb3d28',
                                                color: '#fff',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            }, children: "Primary Button" }), _jsx(Box, { sx: {
                                                px: 2,
                                                py: 0.75,
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe',
                                                color: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            }, children: "Secondary Accent" })] })] }), error ? (_jsx(Alert, { severity: "error", onClose: () => setError(null), children: error })) : null, success ? (_jsx(Alert, { severity: "success", icon: _jsx(CheckCircleIcon, {}), children: "Brand configuration saved. Refresh any page to see the changes." })) : null, _jsx(Box, { children: _jsx(Button, { variant: "contained", onClick: handleSave, disabled: isSaving, startIcon: isSaving ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(SaveIcon, {}), sx: { py: 1.25 }, children: isSaving ? 'Saving...' : 'Save Brand Configuration' }) })] })] }) }));
}
