'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { TTS_VOICE_PROFILES } from '@/lib/chat/tts-voices';
const ICON_BUTTON_SX = { width: 48, height: 48 };
export function VoiceProfileMenu({ voice, onVoiceChange }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const selectedProfile = TTS_VOICE_PROFILES.find((profile) => profile.id === voice);
    return (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: `Voice: ${selectedProfile?.label ?? voice}`, children: _jsx(IconButton, { onClick: (event) => setAnchorEl(event.currentTarget), "aria-label": "Assistant voice profile", "aria-haspopup": "true", "aria-expanded": open ? 'true' : undefined, "aria-controls": open ? 'assistant-voice-menu' : undefined, sx: ICON_BUTTON_SX, children: _jsx(SettingsVoiceIcon, {}) }) }), _jsx(Menu, { id: "assistant-voice-menu", anchorEl: anchorEl, open: open, onClose: () => setAnchorEl(null), slotProps: {
                    paper: { sx: { minWidth: 240 } },
                }, children: TTS_VOICE_PROFILES.map((profile) => (_jsxs(MenuItem, { selected: profile.id === voice, onClick: () => {
                        onVoiceChange(profile.id);
                        setAnchorEl(null);
                    }, children: [_jsx(ListItemIcon, { sx: { minWidth: 32 }, children: profile.id === voice ? _jsx(CheckIcon, { fontSize: "small" }) : null }), _jsx(ListItemText, { primary: profile.label, secondary: profile.description, slotProps: {
                                secondary: { variant: 'caption' },
                            } })] }, profile.id))) })] }));
}
