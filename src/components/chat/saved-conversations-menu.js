'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HistoryIcon from '@mui/icons-material/History';
import { useSavedConversations } from '@/hooks/use-saved-conversations';
export function SavedConversationsMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { conversations, conversationsLoading, isLoadingConversation, load, } = useSavedConversations();
    const open = Boolean(anchorEl);
    const disabled = conversationsLoading || isLoadingConversation || !conversations.length;
    const handleSelect = async (id) => {
        setAnchorEl(null);
        await load(id);
    };
    return (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", color: "inherit", startIcon: conversationsLoading || isLoadingConversation
                    ? _jsx(CircularProgress, { size: 16, color: "inherit" })
                    : _jsx(HistoryIcon, { fontSize: "small" }), endIcon: _jsx(ArrowDropDownIcon, {}), onClick: (event) => setAnchorEl(event.currentTarget), disabled: disabled, "aria-haspopup": "true", "aria-expanded": open ? 'true' : undefined, "aria-controls": open ? 'saved-conversations-menu' : undefined, sx: { textTransform: 'none', color: 'text.secondary', mr: 0.5 }, children: "Saved" }), _jsx(Menu, { id: "saved-conversations-menu", anchorEl: anchorEl, open: open, onClose: () => setAnchorEl(null), slotProps: {
                    paper: { sx: { maxWidth: 320 } },
                }, children: conversations.map((conversation) => (_jsxs(MenuItem, { onClick: () => void handleSelect(conversation.id), sx: { whiteSpace: 'normal' }, children: [conversation.title ?? `Conversation ${conversation.id}`, ' ', "(", conversation.message_count ?? 0, ")"] }, conversation.id))) })] }));
}
