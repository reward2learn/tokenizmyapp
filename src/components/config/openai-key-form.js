'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useClearOpenAiKeyMutation, useGetOpenAiKeyStatusQuery, useSaveOpenAiKeyMutation, } from '@/store/apis/config-api';
function sourceLabel(source) {
    if (source === 'db')
        return 'Stored in database';
    if (source === 'env')
        return 'Using server environment variable';
    return 'Not configured';
}
export function OpenAiKeyForm() {
    const { data, isLoading, isError, refetch } = useGetOpenAiKeyStatusQuery();
    const [saveKey, { isLoading: isSaving }] = useSaveOpenAiKeyMutation();
    const [clearKey, { isLoading: isClearing }] = useClearOpenAiKeyMutation();
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const statusPayload = data?.data;
    const configured = statusPayload?.configured ?? false;
    const source = statusPayload?.source ?? null;
    const handleSave = async () => {
        setStatus(null);
        setError(null);
        try {
            await saveKey({ apiKey }).unwrap();
            setApiKey('');
            setStatus('OpenAI API key saved.');
            await refetch();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save API key.');
        }
    };
    const handleClear = async () => {
        setStatus(null);
        setError(null);
        try {
            await clearKey().unwrap();
            setApiKey('');
            setStatus('Database API key removed. The server environment variable will be used if set.');
            await refetch();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Could not remove API key.');
        }
    };
    return (_jsx(Paper, { elevation: 0, sx: { p: 3, border: '1px solid', borderColor: 'divider' }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "OpenAI API key" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Powers the ops chat assistant and voice synthesis. Keys are encrypted in the database." })] }), isLoading ? (_jsx(CircularProgress, { size: 24 })) : (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(Chip, { label: configured ? 'Configured' : 'Not configured', color: configured ? 'success' : 'warning', size: "small" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: sourceLabel(source) })] })), isError ? (_jsx(Alert, { severity: "error", children: "Could not load API key status." })) : null, error ? _jsx(Alert, { severity: "error", children: error }) : null, status ? _jsx(Alert, { severity: "success", children: status }) : null, _jsx(TextField, { label: "OpenAI API key", type: "password", value: apiKey, onChange: (event) => setApiKey(event.target.value), placeholder: "sk-...", fullWidth: true, autoComplete: "off", helperText: "Paste a new key to replace the stored value. The key is never shown after saving." }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, children: [_jsx(Button, { variant: "contained", onClick: () => void handleSave(), disabled: isSaving || !apiKey.trim(), children: isSaving ? 'Saving…' : 'Save API key' }), _jsx(Button, { variant: "outlined", color: "inherit", onClick: () => void handleClear(), disabled: isClearing || source !== 'db', children: isClearing ? 'Removing…' : 'Remove database key' })] })] }) }));
}
