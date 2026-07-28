'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useGetChatSettingsQuery, useUpdateChatSettingsMutation, } from '@/store/apis/config-api';
export function ChatSettingsForm() {
    const { data, isLoading, isError } = useGetChatSettingsQuery();
    const [updateSettings, { isLoading: isSaving }] = useUpdateChatSettingsMutation();
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (data?.data) {
            setWebSearchEnabled(data.data.webSearchEnabled);
        }
    }, [data]);
    const handleToggle = async (checked) => {
        setWebSearchEnabled(checked);
        setStatus(null);
        setError(null);
        try {
            await updateSettings({ webSearchEnabled: checked }).unwrap();
            setStatus(checked
                ? 'Web search enabled for the assistant.'
                : 'Web search disabled for the assistant.');
        }
        catch (err) {
            setWebSearchEnabled(!checked);
            setError(err instanceof Error ? err.message : 'Could not update chat settings.');
        }
    };
    return (_jsx(Paper, { elevation: 0, sx: { p: 3, border: '1px solid', borderColor: 'divider' }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Chat assistant" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Control whether the ops chat assistant can search the web for current information." })] }), isLoading ? (_jsx(CircularProgress, { size: 24 })) : (_jsx(FormControlLabel, { control: (_jsx(Switch, { checked: webSearchEnabled, onChange: (event) => void handleToggle(event.target.checked), disabled: isSaving })), label: "Enable web search" })), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "When enabled, the assistant can use OpenAI web search for live data, news, and current facts." }), isError ? (_jsx(Alert, { severity: "error", children: "Could not load chat settings." })) : null, error ? _jsx(Alert, { severity: "error", children: error }) : null, status ? _jsx(Alert, { severity: "success", children: status }) : null] }) }));
}
