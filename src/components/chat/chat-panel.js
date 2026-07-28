'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicNoneIcon from '@mui/icons-material/MicNone';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { chatApi, useCreateAiFindingMutation, useSaveConversationMutation, useSynthesizeVoiceMutation, useUpdateReviewMutation, } from '@/store/apis/chat-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearMessages, clearPendingSessionActions, sendStreamingMessage, } from '@/store/chat-stream-slice';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { isClientClearSessionAction, isExplicitSessionRequest } from '@/lib/chat/session-tools';
import { listReviewParts, getReviewPartDisplayTitle } from '@/lib/page-catalog';
import { useTtsVoicePreference } from '@/hooks/use-tts-voice-preference';
import { useVoiceConversation } from '@/hooks/use-voice-conversation';
import { VoiceProfileMenu } from '@/components/chat/voice-profile-menu';
import { readFileAsAttachment } from '@/lib/chat/read-attachment';
import { attachmentDataUrl, formatFileSize, } from '@/lib/chat/attachments';
const ICON_BUTTON_SX = { width: 48, height: 48 };
const VOICE_PHASE_LABEL = {
    listening: 'Listening…',
    processing: 'Processing…',
    speaking: 'Speaking…',
};
function formatTranscript(messages) {
    const tenant = getClientTenantConfig();
    const assistant = tenant.displayName;
    const lines = [
        `${assistant} — AI Chat Transcript`,
        `Generated: ${new Date().toLocaleString()}`,
        '',
    ];
    for (const msg of messages) {
        const role = msg.role === 'user' ? 'You' : `${assistant} AI`;
        lines.push(`── ${role} ──`);
        lines.push(msg.content);
        lines.push('');
    }
    return lines.join('\n');
}
export function ChatPanel() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const { messages, isStreaming, error, pendingSessionActions } = useAppSelector((s) => s.chatStream);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [attachmentLoading, setAttachmentLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [saveConversation, { isLoading: isSaving }] = useSaveConversationMutation();
    const [synthesizeVoiceMutation] = useSynthesizeVoiceMutation();
    const [ttsVoice, setTtsVoice] = useTtsVoicePreference();
    const [updateReview] = useUpdateReviewMutation();
    const [createFinding] = useCreateAiFindingMutation();
    const lastAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant' && msg.content.trim());
    // ── Message action menu ───────────────────────────────
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuMessageIndex, setMenuMessageIndex] = useState(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedPartSlug, setSelectedPartSlug] = useState('');
    const [actionStatus, setActionStatus] = useState(null);
    const [findingTitle, setFindingTitle] = useState('');
    const [findingTitleDialogOpen, setFindingTitleDialogOpen] = useState(false);
    const [pendingFindingContent, setPendingFindingContent] = useState(null);
    const reviewParts = listReviewParts();
    // ── Rate limit countdown ──────────────────────────────
    const [rateLimitCountdown, setRateLimitCountdown] = useState(null);
    const [lastFailedMessage, setLastFailedMessage] = useState(null);
    const countdownRef = useRef(null);
    useEffect(() => {
        if (rateLimitCountdown === null || rateLimitCountdown <= 0) {
            if (countdownRef.current)
                clearInterval(countdownRef.current);
            countdownRef.current = null;
            // Auto-retry when countdown expires
            if (rateLimitCountdown === 0 && lastFailedMessage) {
                const msg = lastFailedMessage;
                setLastFailedMessage(null);
                setRateLimitCountdown(null);
                dispatch(clearMessages());
                // Re-send the failed message after a brief delay
                setTimeout(() => {
                    setInput(msg);
                    // Auto-send after a moment
                    setTimeout(() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                            nativeInputValueSetter?.call(textarea, msg);
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }, 100);
                }, 500);
            }
            return;
        }
        const id = setInterval(() => {
            setRateLimitCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
        countdownRef.current = id;
        return () => clearInterval(id);
    }, [rateLimitCountdown, lastFailedMessage, dispatch]);
    // Detect rate limit errors and start countdown
    useEffect(() => {
        if (error && /rate limit|too large|TPM|tokens per min|max_tokens/i.test(error)) {
            setRateLimitCountdown(60);
            // Save the last user message for auto-retry
            const lastUser = [...messages].reverse().find((m) => m.role === 'user');
            if (lastUser)
                setLastFailedMessage(lastUser.content);
        }
    }, [error, messages]);
    const handleUseInChat = useCallback(() => {
        if (menuMessageIndex === null)
            return;
        const msg = messages[menuMessageIndex];
        if (!msg)
            return;
        setMenuAnchor(null);
        setMenuMessageIndex(null);
        setInput(msg.content);
    }, [menuMessageIndex, messages]);
    const handleRetry = useCallback(() => {
        if (menuMessageIndex === null)
            return;
        const msg = messages[menuMessageIndex];
        if (!msg || msg.role !== 'user')
            return;
        setMenuAnchor(null);
        setMenuMessageIndex(null);
        setInput(msg.content);
        // Auto-send after a short delay
        setTimeout(() => void handleSend(), 100);
    }, [menuMessageIndex, messages]);
    // Prefill from ?prompt= (e.g. when arriving from a task's "Ask AI" button).
    useEffect(() => {
        const prefill = searchParams.get('prompt');
        if (prefill && !input) {
            setInput(prefill);
        }
    }, [searchParams]);
    // Prefill from AI Findings context (stored by AiFindingsBlock "Use in Chat").
    useEffect(() => {
        const context = sessionStorage.getItem('ai_findings_context');
        if (context && !input) {
            setInput(context);
            sessionStorage.removeItem('ai_findings_context');
        }
    }, []);
    const sendMessage = useCallback(async (message) => {
        const trimmed = message.trim();
        if (!trimmed)
            return;
        const attachmentNote = attachments.length
            ? `\n\nAttached files: ${attachments.map((a) => a.name).join(', ')}`
            : '';
        await dispatch(sendStreamingMessage({
            message: `${trimmed}${attachmentNote}`,
            history: messages,
            ...(attachments.length ? { attachments } : {}),
        }));
        setAttachments([]);
    }, [attachments, dispatch, messages]);
    const synthesizeVoice = useCallback(async (args) => {
        const payload = await synthesizeVoiceMutation({ ...args, voice: ttsVoice }).unwrap();
        return { data: payload.data };
    }, [synthesizeVoiceMutation, ttsVoice]);
    const { voiceMode, voicePhase, voicePaused, sttSupported, voiceStatus, isSpeaking, assistantMuted, assistantVolume, micUnavailableMessage, toggleVoiceMode, toggleVoicePause, toggleAssistantMuted, setAssistantVolume, dismissMicUnavailableDialog, speakText, resetVoiceTranscript, } = useVoiceConversation({
        isStreaming,
        lastAssistantText: lastAssistant?.content,
        onTranscriptChange: setInput,
        onSend: sendMessage,
        synthesizeVoice,
    });
    useEffect(() => {
        if (isStreaming || !pendingSessionActions.length)
            return;
        const actions = [...pendingSessionActions];
        dispatch(clearPendingSessionActions());
        let shouldClear = false;
        const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
        const explicitSessionRequest = isExplicitSessionRequest(lastUserMessage?.content ?? '');
        for (const action of actions) {
            if (action === 'save_conversation') {
                dispatch(chatApi.util.invalidateTags(['Conversations']));
                setStatus('Conversation saved.');
            }
            if (isClientClearSessionAction(action) && explicitSessionRequest) {
                shouldClear = true;
            }
        }
        if (shouldClear) {
            dispatch(clearMessages());
            setInput('');
            if (voiceMode)
                resetVoiceTranscript();
        }
    }, [dispatch, isStreaming, pendingSessionActions, resetVoiceTranscript, voiceMode]);
    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isStreaming)
            return;
        setStatus(null);
        setInput('');
        if (voiceMode)
            resetVoiceTranscript();
        await sendMessage(trimmed);
    };
    const handleAttachmentChange = async (event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (!files.length)
            return;
        setAttachmentLoading(true);
        setStatus(null);
        const nextAttachments = [];
        const errors = [];
        for (const file of files) {
            const result = await readFileAsAttachment(file);
            if (result.attachment)
                nextAttachments.push(result.attachment);
            if (result.error)
                errors.push(result.error);
        }
        setAttachments((prev) => [...prev, ...nextAttachments]);
        setAttachmentLoading(false);
        if (errors.length)
            setStatus(errors.join(' '));
    };
    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };
    const handleSave = async () => {
        if (!messages.length)
            return;
        const firstUser = messages.find((msg) => msg.role === 'user')?.content ?? 'Chat Conversation';
        await saveConversation({
            title: firstUser.slice(0, 80),
            messages,
        }).unwrap();
        setStatus('Conversation saved.');
    };
    const handleStartNewChat = useCallback(async () => {
        // Stop rate limit countdown
        if (countdownRef.current)
            clearInterval(countdownRef.current);
        countdownRef.current = null;
        setRateLimitCountdown(null);
        setLastFailedMessage(null);
        // Save current conversation before clearing
        if (messages.length > 0) {
            try {
                const firstUser = messages.find((msg) => msg.role === 'user')?.content ?? 'Chat Conversation';
                await saveConversation({
                    title: firstUser.slice(0, 80),
                    messages,
                }).unwrap();
            }
            catch {
                // non-critical — proceed with clear anyway
            }
        }
        dispatch(clearMessages());
        setInput('');
        if (voiceMode)
            resetVoiceTranscript();
        setStatus('Started new chat.');
    }, [messages, saveConversation, dispatch, voiceMode, resetVoiceTranscript]);
    const handleSpeakReply = async () => {
        if (!lastAssistant)
            return;
        setStatus(null);
        try {
            await speakText(lastAssistant.content);
        }
        catch {
            setStatus('Could not play the spoken reply.');
        }
    };
    const handleCopy = async () => {
        if (!messages.length)
            return;
        const assistant = getClientTenantConfig().displayName;
        const text = messages.map((msg) => {
            const role = msg.role === 'user' ? 'You' : `${assistant} AI`;
            return `[${role}]\n${msg.content}`;
        }).join('\n\n');
        try {
            await globalThis.navigator.clipboard.writeText(text);
            setStatus('Conversation copied to clipboard.');
        }
        catch {
            setStatus('Could not copy to clipboard.');
        }
    };
    const handleDownload = () => {
        if (!messages.length)
            return;
        const blob = new Blob([formatTranscript(messages)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = globalThis.document.createElement('a');
        anchor.href = url;
        const tenantSlug = getClientTenantConfig().slug;
        anchor.download = `${tenantSlug}-chat-${new Date().toISOString().slice(0, 10)}.txt`;
        globalThis.document.body.appendChild(anchor);
        anchor.click();
        globalThis.document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        setStatus('Transcript downloaded.');
    };
    // ── Message action handlers ────────────────────────────
    const handleUpdateReview = useCallback(() => {
        setMenuAnchor(null);
        setSelectedPartSlug('');
        setActionStatus(null);
        setReviewDialogOpen(true);
    }, []);
    const handleConfirmUpdateReview = useCallback(async () => {
        if (menuMessageIndex === null || !selectedPartSlug)
            return;
        const msg = messages[menuMessageIndex];
        if (!msg || msg.role !== 'assistant')
            return;
        setActionStatus('Updating...');
        try {
            await updateReview({
                messages: [{ role: 'assistant', content: msg.content }],
                summary: `Update ${selectedPartSlug} with findings from AI chat.`,
            }).unwrap();
            setActionStatus(`✅ Review section updated.`);
        }
        catch {
            setActionStatus('❌ Update failed');
        }
    }, [menuMessageIndex, selectedPartSlug, messages, updateReview]);
    const handleUpdateExecutiveSummary = useCallback(async () => {
        setMenuAnchor(null);
        setMenuMessageIndex(null);
        setActionStatus('Updating Executive Summary...');
        const msg = menuMessageIndex !== null ? messages[menuMessageIndex] : null;
        if (!msg || msg.role !== 'assistant') {
            setActionStatus('❌ No assistant message selected.');
            return;
        }
        try {
            await updateReview({
                messages: [{ role: 'assistant', content: msg.content }],
                summary: 'Update Executive Summary with findings from AI chat.',
                target: 'executive_summary',
            }).unwrap();
            setActionStatus('✅ Executive Summary updated.');
        }
        catch {
            setActionStatus('❌ Update failed');
        }
    }, [menuMessageIndex, messages, updateReview]);
    const handleAddToDashboard = useCallback(() => {
        if (menuMessageIndex === null)
            return;
        const msg = messages[menuMessageIndex];
        if (!msg || msg.role !== 'assistant')
            return;
        setMenuAnchor(null);
        setMenuMessageIndex(null);
        // Save the content for the confirm handler
        setPendingFindingContent(msg.content);
        // Extract first line as default title
        const firstLine = msg.content.split('\n')[0]?.replace(/^#{1,3}\s+/, '').replace(/^\*\*|\*\*$/g, '').trim() ?? '';
        setFindingTitle(firstLine.slice(0, 80));
        setFindingTitleDialogOpen(true);
    }, [menuMessageIndex, messages]);
    const handleConfirmAddToDashboard = useCallback(async () => {
        if (!pendingFindingContent)
            return;
        setFindingTitleDialogOpen(false);
        setActionStatus('Saving...');
        try {
            await createFinding({
                content: pendingFindingContent,
                title: findingTitle || undefined,
            }).unwrap();
            setActionStatus('✅ Added to Dashboard as AI Findings.');
        }
        catch {
            setActionStatus('❌ Save failed');
        }
        finally {
            setPendingFindingContent(null);
        }
    }, [pendingFindingContent, findingTitle, createFinding]);
    const displayStatus = voiceStatus ?? status;
    const voicePhaseLabel = voiceMode ? VOICE_PHASE_LABEL[voicePhase] : null;
    return (_jsxs(_Fragment, { children: [_jsxs(Dialog, { open: Boolean(micUnavailableMessage), onClose: dismissMicUnavailableDialog, "aria-labelledby": "mic-unavailable-title", maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { id: "mic-unavailable-title", sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(MicNoneIcon, { color: "warning" }), "Microphone unavailable"] }), _jsx(DialogContent, { children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: micUnavailableMessage }) }), _jsx(DialogActions, { sx: { px: 3, pb: 2 }, children: _jsx(Button, { onClick: dismissMicUnavailableDialog, variant: "contained", autoFocus: true, children: "OK" }) })] }), _jsx(Box, { component: "section", sx: { maxWidth: 980, mx: 'auto', px: 3, py: 2 }, children: _jsx(Paper, { elevation: 0, sx: { p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.03)' }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(Box, { sx: { minHeight: 320, maxHeight: 520, overflowY: 'auto', pr: 1 }, children: messages.length ? messages.map((msg, index) => (_jsx(Box, { sx: {
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        mb: 1.5,
                                    }, children: _jsxs(Box, { sx: { maxWidth: '82%', position: 'relative' }, children: [msg.role === 'assistant' || msg.role === 'user' ? (_jsx(IconButton, { size: "small", onClick: (e) => {
                                                    setMenuAnchor(e.currentTarget);
                                                    setMenuMessageIndex(index);
                                                }, sx: {
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    zIndex: 1,
                                                    color: 'text.disabled',
                                                    '&:hover': { color: 'text.primary' },
                                                }, "aria-label": "Message actions", children: _jsx(MoreVertIcon, { fontSize: "small" }) })) : null, _jsxs(Paper, { elevation: 0, sx: {
                                                    p: 1.5,
                                                    pt: msg.role === 'assistant' ? 3 : 1.5,
                                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255,255,255,0.06)',
                                                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                                    whiteSpace: 'pre-wrap',
                                                }, children: [_jsx(Typography, { variant: "body2", children: msg.content || (isStreaming ? '...' : '') }), msg.attachments?.length ? (_jsx(Stack, { direction: "row", spacing: 1, sx: { flexWrap: 'wrap', mt: 1, gap: 1 }, children: msg.attachments.map((attachment) => {
                                                            const dataUrl = attachment.kind === 'image' ? attachmentDataUrl(attachment) : null;
                                                            if (dataUrl) {
                                                                return (_jsx(Box, { component: "img", src: dataUrl, alt: attachment.name, sx: {
                                                                        maxWidth: 160,
                                                                        maxHeight: 160,
                                                                        borderRadius: 1,
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        objectFit: 'cover',
                                                                    } }, `${attachment.name}-${attachment.size}`));
                                                            }
                                                            return (_jsx(Chip, { label: `${attachment.name} (${formatFileSize(attachment.size)})`, size: "small", variant: "outlined" }, `${attachment.name}-${attachment.size}`));
                                                        }) })) : null] })] }) }, `${msg.role}-${index}`))) : (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { py: 8, textAlign: 'center' }, children: "Start with \u201CHow are we tracking against the June 2027 plan?\u201D" })) }), error ? (_jsx(Paper, { elevation: 0, sx: {
                                    p: 1.5,
                                    bgcolor: rateLimitCountdown !== null ? 'rgba(235, 61, 40, 0.08)' : 'error.main',
                                    color: rateLimitCountdown !== null ? 'text.primary' : 'error.contrastText',
                                    border: '1px solid',
                                    borderColor: rateLimitCountdown !== null ? 'error.main' : 'transparent',
                                    borderRadius: 1,
                                }, children: _jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "body2", role: "alert", children: rateLimitCountdown !== null
                                                ? `⏳ Rate limit reached — auto-retry in ${rateLimitCountdown}s`
                                                : error }), _jsxs(Stack, { direction: "row", spacing: 1, children: [rateLimitCountdown !== null ? (_jsx(Button, { size: "small", variant: "contained", color: "error", onClick: () => void handleStartNewChat(), children: "Start New Chat" })) : null, _jsx(Button, { size: "small", variant: "outlined", color: rateLimitCountdown !== null ? 'error' : 'inherit', onClick: () => void handleStartNewChat(), children: "New Chat" })] })] }) })) : null, displayStatus ? (_jsx(Typography, { role: "status", color: voiceStatus ? 'warning.main' : 'success.main', variant: "body2", children: displayStatus })) : null, _jsxs(Menu, { anchorEl: menuAnchor, open: Boolean(menuAnchor), onClose: () => { setMenuAnchor(null); setMenuMessageIndex(null); }, children: [menuMessageIndex !== null && messages[menuMessageIndex]?.role === 'user' ? (_jsx(MenuItem, { onClick: handleRetry, children: "Retry" })) : (_jsx(MenuItem, { onClick: handleUseInChat, children: "Use in Chat" })), menuMessageIndex !== null && messages[menuMessageIndex]?.role === 'assistant' ? ([
                                        _jsx(MenuItem, { onClick: handleUpdateReview, children: "Update Review Section" }, "review"),
                                        _jsx(MenuItem, { onClick: handleUpdateExecutiveSummary, children: "Update Executive Summary" }, "exec"),
                                        _jsx(MenuItem, { onClick: handleAddToDashboard, children: "Add to Dashboard" }, "dashboard"),
                                    ]) : null] }), _jsxs(Dialog, { open: reviewDialogOpen, onClose: () => setReviewDialogOpen(false), maxWidth: "xs", fullWidth: true, children: [_jsx(DialogTitle, { children: "Update Review Section" }), _jsxs(DialogContent, { dividers: true, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Select which review section to update with this message content:" }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Review Section" }), _jsx(Select, { value: selectedPartSlug, label: "Review Section", onChange: (e) => setSelectedPartSlug(e.target.value), children: reviewParts.map((p) => (_jsx(MenuItem, { value: p.partSlug, children: getReviewPartDisplayTitle(p.title) }, p.partSlug))) })] }), actionStatus ? (_jsx(Typography, { variant: "caption", sx: { mt: 1, display: 'block', color: actionStatus.includes('✅') ? 'success.main' : 'error.main' }, children: actionStatus })) : null] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setReviewDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "contained", disabled: !selectedPartSlug, onClick: handleConfirmUpdateReview, children: "Update" })] })] }), _jsxs(Dialog, { open: findingTitleDialogOpen, onClose: () => setFindingTitleDialogOpen(false), maxWidth: "xs", fullWidth: true, children: [_jsx(DialogTitle, { children: "Add to AI Findings" }), _jsxs(DialogContent, { dividers: true, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Give this finding a title:" }), _jsx(TextField, { fullWidth: true, size: "small", label: "Title", value: findingTitle, onChange: (e) => setFindingTitle(e.target.value), autoFocus: true })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setFindingTitleDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "contained", disabled: !findingTitle.trim(), onClick: handleConfirmAddToDashboard, children: "Save" })] })] }), _jsxs(Dialog, { open: actionStatus !== null && !reviewDialogOpen && !findingTitleDialogOpen, onClose: () => setActionStatus(null), maxWidth: "xs", fullWidth: true, children: [_jsx(DialogTitle, { children: "AI Findings" }), _jsx(DialogContent, { dividers: true, children: actionStatus ? (_jsx(Typography, { variant: "body2", color: actionStatus.includes('✅') ? 'success.main' : 'error.main', children: actionStatus })) : null }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setActionStatus(null), children: "Close" }) })] }), _jsx(TextField, { label: "Message", value: input, onChange: (event) => setInput(event.target.value), onKeyDown: (event) => {
                                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                                        void handleSend();
                                    }
                                }, multiline: true, minRows: 3, fullWidth: true, helperText: voiceMode
                                    ? 'Voice mode: speak naturally — your message sends automatically after 2 seconds of silence.'
                                    : undefined }), _jsxs(Accordion, { elevation: 0, sx: {
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'transparent',
                                    '&:before': { display: 'none' },
                                }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, { sx: { color: 'text.disabled', fontSize: '1rem' } }), sx: { minHeight: 36, py: 0, '& .MuiAccordionSummary-content': { my: 0.5 } }, children: _jsx(Typography, { variant: "caption", color: "text.disabled", sx: { fontWeight: 600 }, children: "Tools & Options" }) }), _jsxs(AccordionDetails, { sx: { pt: 0, pb: 1 }, children: [_jsxs(Stack, { direction: "row", spacing: 0.5, sx: { alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(Tooltip, { title: isStreaming ? 'Streaming…' : 'Send', children: _jsx("span", { children: _jsx(IconButton, { color: "primary", onClick: () => void handleSend(), disabled: isStreaming || !input.trim(), "aria-label": "Send", sx: ICON_BUTTON_SX, children: _jsx(SendIcon, {}) }) }) }), sttSupported ? (_jsx(Tooltip, { title: voiceMode ? 'Stop voice chat' : 'Voice chat', children: _jsx(IconButton, { color: voiceMode ? 'error' : 'default', onClick: toggleVoiceMode, "aria-label": voiceMode ? 'Stop voice chat' : 'Voice chat', "aria-pressed": voiceMode, sx: ICON_BUTTON_SX, children: voiceMode ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) }) })) : null, voicePhaseLabel ? (_jsx(Chip, { label: voicePhaseLabel, size: "small", color: voicePhase === 'speaking' ? 'secondary' : 'primary', variant: "outlined" })) : null, _jsx(Tooltip, { title: "Clear", children: _jsx("span", { children: _jsx(IconButton, { onClick: () => void handleStartNewChat(), disabled: isStreaming || !messages.length, "aria-label": "Clear", sx: ICON_BUTTON_SX, children: _jsx(ClearAllIcon, {}) }) }) }), _jsx(Tooltip, { title: "Copy", children: _jsx("span", { children: _jsx(IconButton, { onClick: () => void handleCopy(), disabled: !messages.length, "aria-label": "Copy", sx: ICON_BUTTON_SX, children: _jsx(ContentCopyIcon, {}) }) }) }), _jsx(Tooltip, { title: "Download", children: _jsx("span", { children: _jsx(IconButton, { onClick: handleDownload, disabled: !messages.length, "aria-label": "Download", sx: ICON_BUTTON_SX, children: _jsx(DownloadIcon, {}) }) }) }), _jsx(Tooltip, { title: "Save", children: _jsx("span", { children: _jsx(IconButton, { onClick: () => void handleSave(), disabled: isSaving || !messages.length, "aria-label": "Save", sx: ICON_BUTTON_SX, children: _jsx(SaveIcon, {}) }) }) }), _jsx(Tooltip, { title: "Speak reply", children: _jsx("span", { children: _jsx(IconButton, { onClick: () => void handleSpeakReply(), disabled: isSpeaking || !lastAssistant, "aria-label": "Speak reply", sx: ICON_BUTTON_SX, children: _jsx(RecordVoiceOverIcon, {}) }) }) }), _jsx(Tooltip, { title: voicePaused ? 'Resume conversation' : 'Pause conversation', children: _jsx("span", { children: _jsx(IconButton, { onClick: toggleVoicePause, disabled: !voiceMode && !isSpeaking, "aria-label": voicePaused ? 'Resume conversation' : 'Pause conversation', "aria-pressed": voicePaused, sx: ICON_BUTTON_SX, children: voicePaused ? _jsx(PlayCircleIcon, {}) : _jsx(PauseCircleIcon, {}) }) }) }), _jsx(VoiceProfileMenu, { voice: ttsVoice, onVoiceChange: setTtsVoice }), _jsx(Tooltip, { title: assistantMuted ? 'Unmute assistant voice' : 'Mute assistant voice', children: _jsx(IconButton, { onClick: toggleAssistantMuted, "aria-label": assistantMuted ? 'Unmute assistant voice' : 'Mute assistant voice', "aria-pressed": assistantMuted, sx: ICON_BUTTON_SX, children: assistantMuted ? _jsx(VolumeOffIcon, {}) : _jsx(VolumeUpIcon, {}) }) }), _jsx(Box, { sx: { width: { xs: 120, sm: 150 }, px: 1, display: 'flex', alignItems: 'center' }, children: _jsx(Slider, { "aria-label": "Assistant voice volume", value: Math.round(assistantVolume * 100), min: 0, max: 100, step: 5, size: "small", disabled: assistantMuted, onChange: (_event, value) => {
                                                                const nextValue = Array.isArray(value) ? value[0] : value;
                                                                setAssistantVolume(nextValue / 100);
                                                            } }) }), _jsx(Tooltip, { title: attachmentLoading ? 'Reading files…' : 'Add attachment', children: _jsx("span", { children: _jsxs(IconButton, { component: "label", disabled: attachmentLoading || isStreaming, "aria-label": "Add attachment", sx: ICON_BUTTON_SX, children: [_jsx(AttachFileIcon, {}), _jsx("input", { hidden: true, multiple: true, type: "file", accept: "image/*,.csv,.xlsx,.xls,.pdf,.txt", onChange: (event) => void handleAttachmentChange(event) })] }) }) }), isStreaming ? _jsx(CircularProgress, { size: 22, sx: { ml: 0.5 } }) : null] }), attachments.length ? (_jsx(Stack, { direction: "row", spacing: 1, sx: { flexWrap: 'wrap', gap: 1 }, children: attachments.map((attachment, index) => {
                                                    const dataUrl = attachment.kind === 'image' ? attachmentDataUrl(attachment) : null;
                                                    return (_jsxs(Box, { sx: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            p: 0.75,
                                                            pr: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            borderRadius: 1,
                                                            bgcolor: 'rgba(255,255,255,0.04)',
                                                        }, children: [dataUrl ? (_jsx(Box, { component: "img", src: dataUrl, alt: attachment.name, sx: { width: 40, height: 40, borderRadius: 0.5, objectFit: 'cover' } })) : null, _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { display: 'block', fontWeight: 600 }, children: attachment.name }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: [formatFileSize(attachment.size), attachment.extractedText ? ' · text extracted' : '', attachment.truncated ? ' · too large to embed' : ''] })] }), _jsx(IconButton, { size: "small", color: "inherit", onClick: () => removeAttachment(index), sx: { minWidth: 0, px: 1 }, "aria-label": `Remove ${attachment.name}`, children: "\u00D7" })] }, `${attachment.name}-${index}`));
                                                }) })) : null] })] })] }) }) })] }));
}
