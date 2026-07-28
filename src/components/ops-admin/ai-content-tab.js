'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetAiContentQuery, useGenerateAiContentMutation, useClearSeedMutation } from '@/store/apis/admin-api';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TableChartIcon from '@mui/icons-material/TableChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
/** Ordered list of steps for the timeline visualiser */
const STEPS = [
    { key: 'extracting', label: 'Reading Excel workbook' },
    { key: 'prompt', label: 'Building AI prompt' },
    { key: 'openai', label: 'Calling OpenAI' },
    { key: 'parsing', label: 'Parsing AI response' },
    { key: 'saving', label: 'Saving to database' },
    { key: 'saving_exec', label: 'Saving Executive Summary' },
];
/** Map step → 0-based index for timeline ordering */
const STEP_INDEX = {};
STEPS.forEach((s, i) => {
    STEP_INDEX[s.key] = i;
});
STEP_INDEX['complete'] = STEPS.length;
STEP_INDEX['error'] = -1;
// ── Helper: fuzzy step label for the notification ──────
function stepLabel(step) {
    const found = STEPS.find((s) => s.key === step);
    if (found)
        return found.label;
    if (step === 'complete')
        return 'Complete';
    if (step === 'error')
        return 'Error';
    return step;
}
// ── Component ───────────────────────────────────────────
export function AiContentTab() {
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);
    const [generateError, setGenerateError] = useState(null);
    const [showFullPrompt, setShowFullPrompt] = useState(false);
    const [showFullDataSummary, setShowFullDataSummary] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState(null);
    // RTK Query: GET /api/admin/ai-content — auto-fetches status on mount
    const { data: aiContentData, isLoading: loading, isError: fetchError, error: queryError, refetch: fetchStatus, } = useGetAiContentQuery();
    // RTK Query: POST /api/admin/ai-content — blocking JSON mode (non-SSE)
    const [generateContent, { isLoading: generating }] = useGenerateAiContentMutation();
    // RTK Query: POST /api/admin/clear-seed
    const [clearSeed, { isLoading: clearing }] = useClearSeedMutation();
    // Derive a human-readable fetch error message
    const fetchErrorMsg = useMemo(() => {
        if (!queryError)
            return null;
        if ('status' in queryError)
            return `HTTP ${queryError.status}`;
        return queryError.message || 'Failed to load';
    }, [queryError]);
    // Sync RTK Query data → local status state
    useEffect(() => {
        if (aiContentData?.data) {
            setStatus(aiContentData.data);
        }
    }, [aiContentData]);
    // Sync edited prompt when full prompt loads
    useEffect(() => {
        if (status?.fullPrompt && editedPrompt === null) {
            setEditedPrompt(status.fullPrompt);
        }
    }, [status?.fullPrompt]);
    // Clear-seed state
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [clearConfirmText, setClearConfirmText] = useState('');
    const [clearError, setClearError] = useState(null);
    const [clearResult, setClearResult] = useState(null);
    // ── Additional context from AI Findings ───────────────
    const [additionalContext, setAdditionalContext] = useState(null);
    // ── Generate confirm dialog ────────────────────────────
    const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
    useEffect(() => {
        const ctx = sessionStorage.getItem('ai_findings_generation_context');
        if (ctx) {
            setAdditionalContext(ctx);
            sessionStorage.removeItem('ai_findings_generation_context');
        }
    }, []);
    const clearAdditionalContext = useCallback(() => {
        setAdditionalContext(null);
    }, []);
    // ── Generation handler ────────────────────────────────
    const openGenerateConfirm = useCallback(() => {
        setGenerateConfirmOpen(true);
    }, []);
    const runGeneration = useCallback(async () => {
        setGenerateConfirmOpen(false);
        // Reset state
        setGenerateError(null);
        setResult(null);
        setProgress({ step: 'openai', message: 'Starting generation...', pct: 25 });
        try {
            const body = {};
            if (additionalContext)
                body.additionalContext = additionalContext;
            if (editedPrompt && editedPrompt !== status?.fullPrompt)
                body.overridePrompt = editedPrompt;
            const response = await generateContent(body).unwrap();
            const data = response.data;
            setProgress({ step: 'complete', message: 'Generation complete.', pct: 100, detail: data });
            setResult({
                saved: data.saved ?? { businessReviewParts: [], executiveSummarySaved: false },
                contentLengths: data.contentLengths ?? { businessReview: 0, executiveSummary: 0 },
                model: data.model,
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setProgress({
                step: 'error',
                message: msg,
                pct: 0,
            });
            setGenerateError(msg);
        }
        finally {
            // Refresh status after generation completes or fails
            void fetchStatus();
        }
    }, [generateContent, fetchStatus, additionalContext, editedPrompt, status?.fullPrompt]);
    // ── Clear seeded data ────────────────────────────────
    const handleClearSeed = useCallback(async () => {
        setClearError(null);
        setClearResult(null);
        try {
            const response = await clearSeed({ mode: 'all', confirm: clearConfirmText }).unwrap();
            const deleted = response.data.deleted;
            setClearResult(deleted);
            setClearConfirmOpen(false);
            setClearConfirmText('');
            // Refresh status after clearing
            void fetchStatus();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setClearError(msg);
        }
    }, [clearSeed, clearConfirmText, fetchStatus]);
    // ── Helpers ───────────────────────────────────────────
    const copyPrompt = useCallback(() => {
        if (!status?.fullPrompt && !status?.promptPreview)
            return;
        void navigator.clipboard.writeText(status.fullPrompt ?? status.promptPreview);
    }, [status]);
    /** Determine which steps are completed / active / pending */
    function stepState(key) {
        if (!progress)
            return 'pending';
        if (progress.step === 'error')
            return key === progress.step ? 'error' : 'pending';
        const currentIdx = STEP_INDEX[progress.step] ?? -1;
        const stepIdx = STEP_INDEX[key] ?? -1;
        if (stepIdx < currentIdx)
            return 'completed';
        if (stepIdx === currentIdx)
            return 'active';
        return 'pending';
    }
    // ── Loading state ─────────────────────────────────────
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) }));
    }
    if (fetchError && !status) {
        return (_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: fetchErrorMsg }), _jsx(Button, { variant: "outlined", onClick: () => { void fetchStatus(); }, children: "Retry" })] }));
    }
    // ── Render ────────────────────────────────────────────
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: "AI Content Generation" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Automatically generate the Business Review and Executive Summary from the June 2026 Excel workbook. The system reads the workbook, builds a comprehensive data prompt, calls OpenAI, and saves the generated Markdown to the database. No manual file uploads needed." }), status ? (_jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Chip, { icon: _jsx(TableChartIcon, {}), label: `Period: ${status.excelPeriod}`, size: "small" }), _jsx(Chip, { label: status.excelCompany, size: "small" }), _jsx(Chip, { label: `${status.tabs.length} sheets`, size: "small" }), _jsx(Chip, { icon: _jsx(DescriptionIcon, {}), label: `Prompt: ${(status.promptLength / 1000).toFixed(0)}K chars`, size: "small", variant: "outlined" })] }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["Sheets: ", status.tabs.join(', ')] })] })) : null] }), status?.existingContent ? (_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1 }, children: "Currently Saved Content" }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { flexWrap: 'wrap' }, children: [_jsx(Chip, { icon: status.existingContent.reviewParts > 0 ? (_jsx(CheckCircleIcon, { color: "success" })) : (_jsx(WarningAmberIcon, { color: "warning" })), label: `${status.existingContent.reviewParts} Business Review part(s)`, color: status.existingContent.reviewParts > 0 ? 'success' : 'warning', variant: "outlined" }), _jsx(Chip, { icon: status.existingContent.executiveSummary ? (_jsx(CheckCircleIcon, { color: "success" })) : (_jsx(WarningAmberIcon, { color: "warning" })), label: status.existingContent.executiveSummary
                                    ? 'Executive Summary saved'
                                    : 'No Executive Summary', color: status.existingContent.executiveSummary ? 'success' : 'warning', variant: "outlined" })] }), status.existingContent.executiveSummary ? (_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1, fontStyle: 'italic' }, children: ["Preview: ", status.existingContent.executiveSummary] })) : null] })) : null, generating || progress ? (_jsxs(Paper, { variant: "outlined", sx: {
                    p: 3,
                    borderColor: progress?.step === 'error' ? 'error.main' : progress?.step === 'complete' ? 'success.main' : 'primary.main',
                }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 2 }, children: progress?.step === 'complete'
                            ? 'Generation Complete'
                            : progress?.step === 'error'
                                ? 'Generation Failed'
                                : 'Generating Content...' }), _jsxs(Box, { sx: { mb: 2.5 }, children: [_jsx(LinearProgress, { variant: "determinate", value: progress?.pct ?? 0, color: progress?.step === 'error'
                                    ? 'error'
                                    : progress?.step === 'complete'
                                        ? 'success'
                                        : 'primary', sx: { height: 8, borderRadius: 4 } }), _jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 0.5, display: 'block', textAlign: 'right' }, children: [progress?.pct ?? 0, "%"] })] }), progress && progress.step !== 'complete' && progress.step !== 'error' ? (_jsxs(Alert, { severity: "info", icon: _jsx(AutoFixHighIcon, {}), sx: { mb: 2, '& .MuiAlert-message': { width: '100%' } }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: stepLabel(progress.step) }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: progress.message })] })) : null, progress?.step === 'complete' ? (_jsx(Alert, { severity: "success", icon: _jsx(CheckCircleIcon, {}), sx: { mb: 2 }, children: _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: progress.message }) })) : null, progress?.step === 'error' && generateError ? (_jsxs(Alert, { severity: "error", sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: generateError }), progress.detail?.hint ? (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["Tip: ", progress.detail.hint] })) : null] })) : null, _jsx(Stack, { spacing: 1, children: STEPS.map((step) => {
                            const state = stepState(step.key);
                            return (_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center', opacity: state === 'pending' ? 0.4 : 1 }, children: [state === 'completed' ? (_jsx(CheckCircleIcon, { fontSize: "small", color: "success", sx: { flexShrink: 0 } })) : state === 'active' ? (_jsx(CircularProgress, { size: 18, sx: { flexShrink: 0 } })) : state === 'error' ? (_jsx(WarningAmberIcon, { fontSize: "small", color: "error", sx: { flexShrink: 0 } })) : (_jsx(RadioButtonUncheckedIcon, { fontSize: "small", color: "disabled", sx: { flexShrink: 0 } })), _jsx(Typography, { variant: "body2", sx: {
                                            fontWeight: state === 'active' ? 700 : 400,
                                            color: state === 'active'
                                                ? 'primary.main'
                                                : state === 'completed'
                                                    ? 'success.main'
                                                    : state === 'error'
                                                        ? 'error.main'
                                                        : 'text.secondary',
                                        }, children: step.label }), state === 'active' && progress ? (_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { ml: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: progress.message })) : null] }, step.key));
                        }) }), result ? (_jsxs(Box, { sx: { mt: 2 }, children: [_jsxs(Stack, { direction: "row", spacing: 2, sx: { flexWrap: 'wrap' }, children: [_jsx(Chip, { icon: _jsx(DescriptionIcon, {}), label: `Business Review: ${((result.contentLengths?.businessReview ?? 0) / 1000).toFixed(0)}K chars`, size: "small" }), _jsx(Chip, { icon: _jsx(SummarizeIcon, {}), label: `Executive Summary: ${((result.contentLengths?.executiveSummary ?? 0) / 1000).toFixed(0)}K chars`, size: "small" }), result.model ? (_jsx(Chip, { label: `Model: ${result.model}`, size: "small", variant: "outlined" })) : null] }), result.saved ? (_jsxs(Box, { sx: { mt: 1 }, children: [_jsx(Typography, { variant: "body2", color: "success.main", sx: { fontWeight: 600 }, children: "Saved to Database:" }), _jsxs("ul", { style: { margin: 0, paddingLeft: 20 }, children: [result.saved.businessReviewParts.map((part) => (_jsx("li", { children: _jsx(Typography, { variant: "body2", children: part.title }) }, part.slug))), result.saved.executiveSummarySaved ? (_jsx("li", { children: _jsx(Typography, { variant: "body2", children: "Executive Summary" }) })) : null] })] })) : null] })) : null] })) : null, _jsxs(Accordion, { children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsx(Typography, { sx: { fontWeight: 700 }, children: "Excel Data Summary" }) }), _jsx(AccordionDetails, { children: _jsx(Typography, { variant: "body2", component: "pre", sx: {
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                bgcolor: 'rgba(0,0,0,0.3)',
                                p: 2,
                                borderRadius: 1,
                            }, children: status?.dataSummary ?? 'No data extracted.' }) })] }), additionalContext ? (_jsxs(Accordion, { defaultExpanded: true, elevation: 0, sx: {
                    border: '1px solid',
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(235, 61, 40, 0.06)',
                    '&:before': { display: 'none' },
                }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Typography, { sx: { fontWeight: 700, color: 'primary.main' }, children: "\uD83D\uDCCB AI Findings Context" }), _jsx(Chip, { label: `${additionalContext.length.toLocaleString()} chars`, size: "small", variant: "outlined", color: "primary" }), _jsx(Button, { size: "small", variant: "text", color: "inherit", onClick: (e) => { e.stopPropagation(); clearAdditionalContext(); }, sx: { minWidth: 0, p: 0.5, color: 'text.disabled' }, children: "\u2715 Remove" })] }) }), _jsx(AccordionDetails, { children: _jsx(Typography, { variant: "body2", component: "pre", sx: {
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                bgcolor: 'rgba(0,0,0,0.3)',
                                p: 2,
                                borderRadius: 1,
                                maxHeight: 300,
                                overflow: 'auto',
                            }, children: additionalContext }) })] })) : null, _jsxs(Accordion, { expanded: showFullPrompt, onChange: () => setShowFullPrompt((p) => !p), children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { sx: { fontWeight: 700 }, children: ["AI Generation Prompt (", status
                                    ? `${(status.promptLength / 1000).toFixed(0)}K chars`
                                    : '...', ")"] }) }), _jsx(AccordionDetails, { children: _jsxs(Stack, { spacing: 1, children: [_jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(ContentCopyIcon, {}), onClick: copyPrompt, sx: { alignSelf: 'flex-start' }, children: "Copy Preview" }), _jsx(Typography, { variant: "body2", component: "pre", sx: {
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        bgcolor: 'rgba(0,0,0,0.3)',
                                        p: 2,
                                        borderRadius: 1,
                                        maxHeight: 400,
                                        overflow: 'auto',
                                    }, children: status?.promptPreview ?? 'Loading...' })] }) })] }), _jsxs(Accordion, { expanded: showFullDataSummary || showFullPrompt, onChange: () => setShowFullPrompt((p) => !p), children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { sx: { fontWeight: 700 }, children: ["Full Generation Prompt", status ? ` (${(status.promptLength / 1000).toFixed(0)}K chars)` : ''] }) }), _jsx(AccordionDetails, { children: _jsxs(Stack, { spacing: 1, children: [_jsx(Stack, { direction: "row", spacing: 1, children: _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(ContentCopyIcon, {}), onClick: () => {
                                            if (status?.fullPrompt)
                                                navigator.clipboard.writeText(status.fullPrompt);
                                        }, children: "Copy Full Prompt" }) }), _jsx(TextField, { fullWidth: true, multiline: true, minRows: 10, maxRows: 30, value: editedPrompt ?? status?.fullPrompt ?? status?.promptPreview ?? '', onChange: (e) => setEditedPrompt(e.target.value), variant: "outlined", size: "small", sx: {
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                            fontFamily: 'monospace',
                                            fontSize: '0.7rem',
                                        },
                                        '& textarea': {
                                            whiteSpace: 'pre-wrap !important',
                                        },
                                    } })] }) })] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, children: [_jsx(Button, { variant: "contained", size: "large", disabled: generating, onClick: openGenerateConfirm, startIcon: generating ? (_jsx(CircularProgress, { size: 20, color: "inherit" })) : (_jsx(AutoFixHighIcon, {})), sx: { py: 1.5 }, children: generating
                            ? 'Generating...'
                            : 'Generate Business Review & Executive Summary' }), _jsx(Button, { variant: "outlined", onClick: () => { void fetchStatus(); }, disabled: generating, startIcon: _jsx(TableChartIcon, {}), children: "Refresh Data Status" })] }), _jsx(Divider, { sx: { my: 1 } }), _jsx(Paper, { variant: "outlined", sx: {
                    p: 3,
                    borderColor: 'error.main',
                    borderStyle: 'dashed',
                    bgcolor: 'rgba(211,47,47,0.04)',
                }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(DeleteSweepIcon, { color: "error" }), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, color: 'error.main' }, children: "Danger Zone: Clear All Seeded Data" })] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Delete all seeded content from the database \u2014 financial projections, business review parts, knowledge snippets, tasks, roles, monthly targets, and app pages.", _jsx("strong", { children: " This cannot be undone." }), " Operational data (Z-reports, conversations, user accounts) is preserved."] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "After clearing, upload a new workbook via the Config page and re-seed to regenerate everything from scratch." }), _jsx(Box, { children: _jsx(Button, { variant: "outlined", color: "error", onClick: () => setClearConfirmOpen(true), disabled: clearing, startIcon: clearing ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(DeleteSweepIcon, {}), sx: { borderColor: 'error.main', '&:hover': { borderColor: 'error.dark' } }, children: clearing ? 'Clearing...' : 'Clear All Seeded Data' }) }), clearError ? (_jsx(Alert, { severity: "error", onClose: () => setClearError(null), children: clearError })) : null, clearResult ? (_jsxs(Alert, { severity: "success", icon: _jsx(CheckCircleIcon, {}), children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Seeded data cleared successfully." }), _jsx(Typography, { variant: "caption", component: "div", children: Object.entries(clearResult)
                                        .filter(([, count]) => count > 0)
                                        .map(([table, count]) => `${table}: ${count} rows deleted`)
                                        .join('\n') })] })) : null] }) }), _jsxs(Dialog, { open: generateConfirmOpen, onClose: () => setGenerateConfirmOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(AutoFixHighIcon, { color: "primary" }), "Generate Business Review, Executive Summary & Dashboard"] }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["This will generate the Business Review, Executive Summary, and Dashboard content", additionalContext ? ' incorporating your selected AI Findings.' : '.'] }), _jsx(Box, { sx: { pl: 1 }, children: _jsx(Typography, { variant: "body2", component: "div", sx: { '& li': { mb: 0.5 } }, children: _jsxs("ol", { style: { margin: 0, paddingLeft: '1.2rem' }, children: [_jsx("li", { children: "Read the June 2026 Excel workbook data seeded" }), additionalContext ? _jsx("li", { children: "Add the AI findings to the data to generate response" }) : null, _jsx("li", { children: "Build a comprehensive AI prompt from the data and instructions" }), _jsx("li", { children: "Call OpenAI to generate all documents" }), _jsx("li", { children: "Save to the database: Executive Summary, Detailed Review, and Dashboard content (overwriting existing content)" })] }) }) }), additionalContext ? (_jsxs(Alert, { severity: "info", icon: _jsx(AutoFixHighIcon, {}), children: ["AI Findings context (", additionalContext.length.toLocaleString(), " chars) will be included in the generation."] })) : null, _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontWeight: 600 }, children: "Existing content will be overwritten. This cannot be undone." })] }) }), _jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [_jsx(Button, { onClick: () => setGenerateConfirmOpen(false), color: "inherit", children: "Cancel" }), _jsx(Button, { variant: "contained", onClick: runGeneration, startIcon: _jsx(AutoFixHighIcon, {}), children: "Generate" })] })] }), _jsxs(Dialog, { open: clearConfirmOpen, onClose: () => { if (!clearing) {
                    setClearConfirmOpen(false);
                    setClearConfirmText('');
                } }, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { fontWeight: 700 }, children: "\u26A0\uFE0F Clear All Seeded Data?" }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, children: [_jsx(DialogContentText, { children: "This will permanently delete all seeded content from the database:" }), _jsx(Typography, { variant: "body2", component: "div", sx: { pl: 2 }, children: _jsxs("ul", { style: { margin: 0 }, children: [_jsx("li", { children: "Financial projections" }), _jsx("li", { children: "Business Review parts" }), _jsx("li", { children: "Knowledge snippets & workbook cache" }), _jsx("li", { children: "Tasks, roles, and task assignments" }), _jsx("li", { children: "Action items and levers" }), _jsx("li", { children: "Monthly targets" }), _jsx("li", { children: "App pages and page sections" }), _jsx("li", { children: "Daily metrics and monthly actuals" })] }) }), _jsx(DialogContentText, { sx: { fontWeight: 600, color: 'error.main' }, children: "This action cannot be undone." }), _jsxs(DialogContentText, { children: ["Type ", _jsx("strong", { children: "CLEAR ALL SEEDED DATA" }), " below to confirm:"] }), _jsx(TextField, { fullWidth: true, size: "small", placeholder: "CLEAR ALL SEEDED DATA", value: clearConfirmText, onChange: (e) => setClearConfirmText(e.target.value), autoFocus: true, error: clearConfirmText.length > 0 && clearConfirmText !== 'CLEAR ALL SEEDED DATA', helperText: clearConfirmText.length > 0 && clearConfirmText !== 'CLEAR ALL SEEDED DATA'
                                        ? 'Type the exact phrase to confirm'
                                        : '' })] }) }), _jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [_jsx(Button, { onClick: () => {
                                    setClearConfirmOpen(false);
                                    setClearConfirmText('');
                                }, disabled: clearing, children: "Cancel" }), _jsx(Button, { variant: "contained", color: "error", disabled: clearConfirmText !== 'CLEAR ALL SEEDED DATA' || clearing, onClick: handleClearSeed, startIcon: clearing ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(DeleteSweepIcon, {}), children: clearing ? 'Clearing...' : 'Clear All Seeded Data' })] })] })] }));
}
