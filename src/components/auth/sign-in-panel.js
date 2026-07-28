'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PERSONS } from '@/domain/security/persons';
import { useGetSessionQuery, useVerifyPinMutation, useListPinUsersQuery } from '@/store/apis/auth-api';
/** Options derived from the live PIN-users RTK Query endpoint, falling back to PERSONS. */
function usePinUsers() {
    const { data, isLoading } = useListPinUsersQuery();
    if (isLoading || !data) {
        return {
            options: PERSONS.map((p) => ({ value: p.name, sub: p.sub })),
            lastUsedName: null,
            isLoading,
        };
    }
    if (data?.success && Array.isArray(data.data?.users)) {
        const active = data.data.users
            .filter((u) => u.pinConfigured ?? u.hasPin)
            .map((u) => ({ value: u.name, sub: u.sub }));
        return {
            options: active.length > 0 ? active : PERSONS.map((p) => ({ value: p.name, sub: p.sub })),
            lastUsedName: data.data.lastUsedName ?? null,
            isLoading: false,
        };
    }
    return {
        options: PERSONS.map((p) => ({ value: p.name, sub: p.sub })),
        lastUsedName: null,
        isLoading: false,
    };
}
export function SignInPanel({ requiredTier }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pin, setPin] = useState('');
    const { options: personOptions, lastUsedName } = usePinUsers();
    const [personName, setPersonName] = useState('');
    // Prefer the last PIN user persisted in Neon (user_accounts.last_seen_at).
    useEffect(() => {
        if (personOptions.length === 0)
            return;
        if (lastUsedName && personOptions.some((o) => o.value === lastUsedName)) {
            setPersonName((prev) => (prev === lastUsedName ? prev : lastUsedName));
            return;
        }
        setPersonName((prev) => prev && personOptions.some((o) => o.value === prev) ? prev : personOptions[0].value);
    }, [personOptions, lastUsedName]);
    const [verifyPin, { isLoading, isError, error }] = useVerifyPinMutation();
    const { refetch: refetchSession } = useGetSessionQuery();
    const oauthError = searchParams.get('auth') === 'error';
    const showPin = requiredTier !== 'google';
    const googleHref = googleAuthHref(pathname || '/dashboard');
    const handlePinSubmit = async (event) => {
        event.preventDefault();
        if (!pin.trim())
            return;
        // Send the person's name so the endpoint can resolve the sub from PERSONS.
        // Successful verify-pin upserts user_accounts.last_seen_at in Neon.
        const result = await verifyPin({ name: personName, pin: pin.trim() });
        if ('data' in result && result.data?.ok) {
            // Cookie is set on the verify-pin response; force a session refetch so
            // AuthProvider updates Redux state and the gate reveals admin content.
            await refetchSession();
        }
    };
    return (_jsx(Box, { component: "section", sx: { textAlign: 'center', py: 6, px: 3 }, "data-testid": "sign-in-panel", children: _jsxs(Box, { sx: { maxWidth: 420, mx: 'auto' }, children: [_jsx(Typography, { variant: "h5", sx: { fontWeight: 700, mb: 1 }, children: requiredTier === 'google' ? 'Sign in to Access' : 'Ops Sign-In' }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: requiredTier === 'google'
                        ? 'Sign in with Google to view the full business review, AI chat, and operations tracking.'
                        : 'Enter the ops PIN or sign in with Google for full access.' }), oauthError ? (_jsx(Alert, { severity: "error", sx: { mb: 2, textAlign: 'left' }, children: "Google sign-in failed. Try again or use the ops PIN." })) : null, isError ? (_jsx(Alert, { severity: "error", sx: { mb: 2, textAlign: 'left' }, children: 'data' in error && error && typeof error === 'object'
                        ? String(error.data?.error ?? 'Incorrect PIN')
                        : 'Incorrect PIN' })) : null, _jsx(Button, { component: "a", href: googleHref, variant: "contained", color: "inherit", fullWidth: true, sx: {
                        bgcolor: '#fff',
                        color: '#1a1a22',
                        fontWeight: 600,
                        mb: showPin ? 2 : 0,
                        '&:hover': { bgcolor: '#f0f0f0' },
                    }, children: "Sign in with Google" }), showPin ? (_jsxs(_Fragment, { children: [_jsx(Divider, { sx: { my: 2.5 }, children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: "or" }) }), _jsxs(Stack, { component: "form", direction: "column", spacing: 1.5, onSubmit: handlePinSubmit, children: [_jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { id: "pin-role-label", children: "User Account" }), _jsx(Select, { labelId: "pin-role-label", label: "User Account", value: personName, onChange: (e) => setPersonName(e.target.value), "data-testid": "pin-role-select", children: personOptions.map((opt) => (_jsx(MenuItem, { value: opt.value, children: opt.value }, opt.sub))) })] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(TextField, { type: "password", placeholder: "PIN", value: pin, onChange: (e) => setPin(e.target.value), size: "small", fullWidth: true, autoComplete: "off", slotProps: {
                                                htmlInput: { 'data-testid': 'pin-input', maxLength: 12 },
                                            } }), _jsx(Button, { type: "submit", variant: "contained", color: "primary", disabled: !pin.trim() || isLoading, "data-testid": "pin-submit", children: isLoading ? '…' : 'Unlock' })] })] })] })) : null] }) }));
}
function googleAuthHref(redirectPath) {
    return `/api/auth?action=google&redirect=${encodeURIComponent(redirectPath)}`;
}
export function SignInPanelGate(props) {
    return (_jsx(Suspense, { fallback: _jsx(Box, { sx: { py: 6, textAlign: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "Loading sign-in\u2026" }) }), children: _jsx(SignInPanel, { ...props }) }));
}
