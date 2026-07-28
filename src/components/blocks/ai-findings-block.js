'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { MarkdownBody } from '@/components/blocks/markdown-body';
import { useGetAiFindingsQuery, useCreateAiFindingMutation, useDeleteAiFindingsMutation, useSaveAiFindingsBatchMutation, useSummarizeFindingMutation, } from '@/store/apis/chat-api';
function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    }
    catch {
        return iso.slice(0, 10);
    }
}
function FindingAccordion({ finding, expanded, selected, onToggle, onToggleSelect, onCopy, onSummarize, isSummarizing, }) {
    return (_jsxs(Accordion, { expanded: expanded, onChange: onToggle, elevation: 0, sx: {
            border: '1px solid',
            borderColor: selected ? 'primary.main' : 'divider',
            '&:before': { display: 'none' },
            bgcolor: selected ? 'rgba(235, 61, 40, 0.06)' : 'rgba(235, 61, 40, 0.03)',
        }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, { sx: { color: 'primary.main' } }), children: _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', width: '100%', pr: 2 }, children: [_jsx(Checkbox, { size: "small", checked: selected, onChange: (e) => { e.stopPropagation(); onToggleSelect(); }, onClick: (e) => e.stopPropagation(), sx: { p: 0.25 } }), _jsx(Box, { sx: { flex: 1, minWidth: 0 }, children: _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: finding.title }) }), _jsx(Chip, { label: formatDate(finding.createdAt), size: "small", variant: "outlined", sx: { height: 20, fontSize: '0.65rem' } }), _jsx(Button, { size: "small", variant: "text", onClick: (e) => { e.stopPropagation(); onCopy(); }, startIcon: _jsx(ContentCopyIcon, { fontSize: "small" }), sx: { minWidth: 0, p: 0.5 }, children: "Copy" }), _jsx(Button, { size: "small", variant: "text", onClick: (e) => { e.stopPropagation(); onSummarize(); }, disabled: isSummarizing, startIcon: isSummarizing ? _jsx(CircularProgress, { size: 12 }) : _jsx(AutoFixHighIcon, { fontSize: "small" }), sx: { minWidth: 0, p: 0.5 }, children: isSummarizing ? '...' : 'Summarize' })] }) }), _jsx(AccordionDetails, { sx: { borderTop: '1px solid', borderColor: 'divider', pt: 2 }, children: _jsx(MarkdownBody, { markdown: finding.content }) })] }));
}
export function AiFindingsBlock() {
    const router = useRouter();
    // RTK Query hooks
    const { data: findingsData, isLoading } = useGetAiFindingsQuery();
    const [createFinding] = useCreateAiFindingMutation();
    const [deleteFindings, { isLoading: isDeleting }] = useDeleteAiFindingsMutation();
    const [saveBatch] = useSaveAiFindingsBatchMutation();
    const [summarizeMutation] = useSummarizeFindingMutation();
    // Local state
    const [findings, setFindings] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [summarizingId, setSummarizingId] = useState(null);
    const [summarizingAll, setSummarizingAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [, forceUpdate] = useState(0);
    // Sync RTK Query data into local state
    useEffect(() => {
        if (findingsData) {
            // findingsData.data is typed loosely as unknown[] but at runtime is { findings: AiFinding[] }
            const payload = findingsData.data;
            setFindings(payload?.findings ?? []);
        }
    }, [findingsData]);
    const toggleExpand = useCallback((id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const expandAll = useCallback(() => {
        setExpandedIds(new Set(findings.map((f) => f.id)));
    }, [findings]);
    const collapseAll = useCallback(() => {
        setExpandedIds(new Set());
    }, []);
    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const selectAll = useCallback(() => {
        setSelectedIds(new Set(findings.map((f) => f.id)));
    }, [findings]);
    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);
    const copyToClipboard = useCallback(async (content) => {
        try {
            await navigator.clipboard.writeText(content);
        }
        catch {
            const ta = document.createElement('textarea');
            ta.value = content;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
    }, []);
    const copyAll = useCallback(async () => {
        const text = findings.map((f) => `## ${f.title}\n\n${f.content}`).join('\n\n---\n\n');
        await copyToClipboard(text);
        forceUpdate((n) => n + 1);
    }, [findings, copyToClipboard]);
    const summarize = useCallback(async (finding) => {
        setSummarizingId(finding.id);
        try {
            const summaryResult = await summarizeMutation({ content: finding.content }).unwrap();
            if (summaryResult.data?.summary) {
                const updated = `**AI Summary:** ${summaryResult.data.summary}\n\n---\n\n${finding.content}`;
                await createFinding({ content: updated, title: finding.title }).unwrap();
                // Mutation invalidates AiFindings tag → auto-refetch → useEffect syncs local state
                setExpandedIds((prev) => new Set(prev).add(finding.id));
            }
        }
        catch {
            // silent
        }
        finally {
            setSummarizingId(null);
        }
    }, [summarizeMutation, createFinding]);
    const summarizeAll = useCallback(async () => {
        setSummarizingAll(true);
        try {
            // Combine selected (or all) findings into one text
            const targetFindings = selectedIds.size > 0
                ? findings.filter((f) => selectedIds.has(f.id))
                : findings;
            if (targetFindings.length === 0) {
                setSummarizingAll(false);
                return;
            }
            const combinedText = targetFindings
                .map((f) => `## ${f.title}\n\n${f.content}`)
                .join('\n\n---\n\n');
            const summaryPayload = await summarizeMutation({ content: combinedText }).unwrap();
            if (summaryPayload.success && summaryPayload.data?.summary) {
                // Remove the original findings that were summarized
                const idsToRemove = new Set(targetFindings.map((f) => f.id));
                const remaining = findings.filter((f) => !idsToRemove.has(f.id));
                // Add one combined summary finding at the top
                const summaryFinding = {
                    id: `find-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    title: `AI Summary — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    content: `**Combined AI Summary:** ${summaryPayload.data.summary}\n\n---\n\n${combinedText}`,
                    createdAt: new Date().toISOString(),
                };
                remaining.unshift(summaryFinding);
                // Save via batch endpoint
                await saveBatch({ findings: remaining }).unwrap();
                setFindings(remaining);
                setSelectedIds(new Set());
                setExpandedIds(new Set([summaryFinding.id]));
            }
        }
        catch {
            // silent
        }
        finally {
            setSummarizingAll(false);
        }
    }, [findings, selectedIds, summarizeMutation, saveBatch]);
    const deleteSelected = useCallback(async () => {
        if (selectedIds.size === 0)
            return;
        try {
            const ids = Array.from(selectedIds);
            await deleteFindings(ids).unwrap();
            setSelectedIds(new Set());
            // Mutation invalidates AiFindings tag → auto-refetch → useEffect syncs local state
        }
        catch {
            // silent
        }
    }, [selectedIds, deleteFindings]);
    const useInChat = useCallback(() => {
        const selected = findings.filter((f) => selectedIds.has(f.id));
        const text = selected.length > 0
            ? selected.map((f) => `## ${f.title}\n\n${f.content}`).join('\n\n---\n\n')
            : findings.map((f) => `## ${f.title}\n\n${f.content}`).join('\n\n---\n\n');
        sessionStorage.setItem('ai_findings_context', text.slice(0, 5000));
        router.push('/ops-chat');
    }, [findings, selectedIds, router]);
    const generateReviewWithSelected = useCallback(() => {
        const selected = findings.filter((f) => selectedIds.has(f.id));
        const text = selected.length > 0
            ? selected.map((f) => `## ${f.title}\n\n${f.content}`).join('\n\n---\n\n')
            : findings.map((f) => `## ${f.title}\n\n${f.content}`).join('\n\n---\n\n');
        sessionStorage.setItem('ai_findings_generation_context', text.slice(0, 10000));
        router.push('/config?tab=3');
    }, [findings, selectedIds, router]);
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 24 }) }));
    }
    if (!findings.length)
        return null;
    const allExpanded = expandedIds.size === findings.length;
    const allSelected = selectedIds.size === findings.length;
    return (_jsx(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 4 }, children: _jsx(Paper, { elevation: 0, sx: {
                p: { xs: 2, md: 3 },
                border: '1px solid',
                borderColor: 'primary.main',
                bgcolor: 'rgba(235, 61, 40, 0.04)',
            }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", sx: { alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }, children: [_jsxs(Typography, { variant: "h5", component: "h2", sx: { fontWeight: 800, color: 'primary.main' }, children: ["AI Findings (", findings.length, ")"] }), _jsx(Stack, { direction: "row", spacing: 1, sx: { flexWrap: 'wrap' }, children: _jsx(Button, { size: "small", variant: "outlined", onClick: allExpanded ? collapseAll : expandAll, children: allExpanded ? 'Collapse All' : 'Expand All' }) })] }), selectedIds.size > 0 || findings.length > 0 ? (_jsxs(Paper, { variant: "outlined", sx: { p: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', bgcolor: 'action.selected' }, children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, mr: 0.5 }, children: selectedIds.size > 0 ? `${selectedIds.size} selected` : `${findings.length} findings` }), _jsx(Button, { size: "small", variant: "text", onClick: copyAll, startIcon: _jsx(ContentCopyIcon, {}), children: "Copy All" }), _jsx(Button, { size: "small", variant: "text", onClick: summarizeAll, disabled: summarizingAll, startIcon: summarizingAll ? _jsx(CircularProgress, { size: 14 }) : _jsx(AutoFixHighIcon, {}), children: summarizingAll ? 'Summarizing...' : 'Summarize All' }), _jsxs(Button, { size: "small", variant: "text", color: "error", onClick: deleteSelected, disabled: selectedIds.size === 0 || isDeleting, startIcon: _jsx(DeleteIcon, {}), children: ["Delete", selectedIds.size > 0 ? ` (${selectedIds.size})` : ''] }), _jsx(Button, { size: "small", variant: "text", onClick: useInChat, startIcon: _jsx(SendIcon, {}), children: "Use in Chat" }), _jsx(Button, { size: "small", variant: "text", onClick: generateReviewWithSelected, startIcon: _jsx(AutoAwesomeIcon, {}), children: "Generate Review" }), _jsx(Box, { sx: { flex: 1 } }), _jsx(Button, { size: "small", onClick: allSelected ? clearSelection : selectAll, children: allSelected ? 'Clear' : 'Select All' })] })) : null, findings.map((finding) => (_jsx(FindingAccordion, { finding: finding, expanded: expandedIds.has(finding.id), selected: selectedIds.has(finding.id), onToggle: () => toggleExpand(finding.id), onToggleSelect: () => toggleSelect(finding.id), onCopy: () => copyToClipboard(finding.content), onSummarize: () => summarize(finding), isSummarizing: summarizingId === finding.id }, finding.id)))] }) }) }));
}
