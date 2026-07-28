'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
export function VercelConnectButton() {
    const [status, setStatus] = useState('loading');
    const [oauthUrl, setOauthUrl] = useState(null);
    useEffect(() => {
        fetch('/api/config/vercel-token')
            .then((res) => res.json())
            .then((data) => {
            if (data.success && data.data) {
                setStatus(data.data.status || 'not_configured');
                setOauthUrl(data.data.oauthUrl || null);
            }
            else {
                setStatus('not_configured');
            }
        })
            .catch(() => setStatus('not_configured'));
    }, []);
    if (status === 'loading') {
        return (_jsx(Tooltip, { title: "Checking Vercel connection\u2026", children: _jsx(Chip, { label: "Vercel\u2026", size: "small", variant: "outlined" }) }));
    }
    if (status === 'configured') {
        return (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [_jsx(Tooltip, { title: "Vercel is connected and ready for auto-deploy", children: _jsx(Chip, { label: "Vercel \u2713", size: "small", color: "success", variant: "outlined" }) }), oauthUrl && (_jsx(Tooltip, { title: "Reconnect to Vercel", children: _jsx(Button, { component: "a", href: oauthUrl, size: "small", variant: "text", sx: { minWidth: 'auto', px: 0.5, fontSize: '0.75rem', textTransform: 'none' }, children: "Reconnect" }) }))] }));
    }
    return (_jsx(Tooltip, { title: status === 'expired' ? 'Vercel token expired — reconnect' : 'Connect to Vercel for auto-deploy', children: _jsx(Button, { component: "a", href: oauthUrl || '/api/auth/vercel/authorize', size: "small", variant: "outlined", color: status === 'expired' ? 'warning' : 'primary', startIcon: _jsx(OpenInNewIcon, {}), sx: { textTransform: 'none', whiteSpace: 'nowrap' }, children: status === 'expired' ? 'Reconnect Vercel' : 'Connect Vercel' }) }));
}
