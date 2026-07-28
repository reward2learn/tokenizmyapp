'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { ChatSettingsForm } from '@/components/config/chat-settings-form';
import { OpenAiKeyForm } from '@/components/config/openai-key-form';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { getTemplate } from '@/domain/tenant/template-catalog';
const AiContentTab = dynamic(() => import('@/components/ops-admin/ai-content-tab').then((m) => ({ default: m.AiContentTab })), { ssr: false });
const SourceUploadForm = dynamic(() => import('@/components/config/source-upload-form').then((m) => ({ default: m.SourceUploadForm })), { ssr: false });
const DataViewTab = dynamic(() => import('@/components/config/data-view-tab').then((m) => ({ default: m.DataViewTab })), { ssr: false });
function TemplateConfigPlaceholder({ template }) {
    return (_jsx(Paper, { variant: "outlined", sx: { p: 3 }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: [template.label, " Configuration"] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: template.description }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 600 }, children: "Template Pages:" }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, children: template.defaultPages.map((p) => (_jsx(Chip, { label: p.title, size: "small", variant: "outlined" }, p.slug))) }), _jsx(Typography, { variant: "caption", color: "text.disabled", sx: { mt: 2 }, children: "Template-specific configuration will be available after implementing the stub blocks." })] }) }));
}
function ConfigPageInner() {
    const searchParams = useSearchParams();
    const tenant = getClientTenantConfig();
    const template = getTemplate(tenant.slug === 'tokenizmyapp' ? 'default' : tenant.slug);
    const initialTab = searchParams.get('tab');
    const [tab, setTab] = useState(initialTab ? Math.min(Math.max(parseInt(initialTab, 10) || 0, 0), 3) : 0);
    useEffect(() => {
        const t = searchParams.get('tab');
        if (t) {
            setTab(Math.min(Math.max(parseInt(t, 10) || 0, 0), 3));
        }
    }, [searchParams]);
    return (_jsx(AuthGate, { requiredTier: "pin", fallback: _jsx(SignInPanelGate, { requiredTier: "pin" }), children: _jsx(Box, { sx: { mx: 'auto', px: 3, py: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 800 }, children: "Config" }), _jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'flex', gap: 1, alignItems: 'center', mt: 1 }, children: ["Template: ", _jsx(Chip, { label: template.label, size: "small", variant: "outlined", color: "info" })] }), _jsxs(Tabs, { value: tab, onChange: (_e, v) => setTab(v), variant: "scrollable", scrollButtons: "auto", children: [_jsx(Tab, { label: "AI Chat" }), _jsx(Tab, { label: "Source" }), _jsx(Tab, { label: "Data View" }), _jsx(Tab, { label: "AI Content Generation" }), template.id === 'nightclub-bar' ? _jsx(Tab, { label: "Nightclub Config" }) : null, template.id === 'restaurant' ? _jsx(Tab, { label: "Restaurant Config" }) : null, template.id === 'hotel' ? _jsx(Tab, { label: "Hotel Config" }) : null] }), tab === 0 ? (_jsxs(Stack, { spacing: 3, children: [_jsx(OpenAiKeyForm, {}), _jsx(ChatSettingsForm, {})] })) : null, tab === 1 ? _jsx(SourceUploadForm, {}) : null, tab === 2 ? _jsx(DataViewTab, {}) : null, tab === 3 ? _jsx(AiContentTab, {}) : null, tab === 4 && template.id === 'nightclub-bar' ? _jsx(TemplateConfigPlaceholder, { template: template }) : null, tab === 4 && template.id === 'restaurant' ? _jsx(TemplateConfigPlaceholder, { template: template }) : null, tab === 4 && template.id === 'hotel' ? _jsx(TemplateConfigPlaceholder, { template: template }) : null] }) }) }));
}
export default function ConfigPage() {
    return (_jsx(Suspense, { fallback: null, children: _jsx(ConfigPageInner, {}) }));
}
