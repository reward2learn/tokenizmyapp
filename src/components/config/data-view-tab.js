'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useGetSeedDetailsQuery, useImportDataMutation } from '@/store/apis/config-api';
import { useClearSeedMutation } from '@/store/apis/admin-api';
// ── Table name to display label mapping ─────────────────
const TABLE_META = {
    financial_projections: { label: 'Financial Projections', icon: '📊' },
    business_review_parts: { label: 'Business Review Parts', icon: '📝' },
    knowledge_snippets: { label: 'Knowledge Snippets', icon: '🧠' },
    tasks: { label: 'Tasks', icon: '✅' },
    task_assignments: { label: 'Task Assignments', icon: '🔗' },
    roles: { label: 'Roles', icon: '👤' },
    monthly_targets: { label: 'Monthly Targets', icon: '🎯' },
    levers: { label: 'Levers', icon: '🔧' },
    action_items: { label: 'Action Items', icon: '📋' },
    app_pages: { label: 'App Pages', icon: '📄' },
    page_sections: { label: 'Page Sections', icon: '🧩' },
    daily_metrics: { label: 'Daily Metrics', icon: '📅' },
    monthly_actual_departments: { label: 'Monthly Actuals (Dept)', icon: '📁' },
    monthly_actual_inputs: { label: 'Monthly Actual Inputs', icon: '📥' },
    daily_z_reports: { label: 'Z-Reports', icon: '📋' },
};
function formatCount(n) {
    if (n < 0)
        return 'error';
    return String(n);
}
export function DataViewTab() {
    // ── RTK Query hooks ────────────────────────────────────
    const { data: seedData, isLoading: seedLoading, error: seedError, refetch: refetchDetails, } = useGetSeedDetailsQuery();
    const [clearSeed, { isLoading: clearing }] = useClearSeedMutation();
    const [importData, { isLoading: importing }] = useImportDataMutation();
    // ── Local state ────────────────────────────────────────
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [clearError, setClearError] = useState(null);
    const [clearResult, setClearResult] = useState(null);
    // Sync RTK Query seed data into local state
    useEffect(() => {
        if (seedData?.success) {
            setDetails(seedData);
            setError(null);
        }
        else if (seedData && !seedData.success) {
            setError(seedData.error ?? 'Failed to load seed details');
        }
    }, [seedData]);
    useEffect(() => {
        if (seedError) {
            const msg = typeof seedError === 'object' && 'message' in seedError
                ? String(seedError.message)
                : typeof seedError === 'object' && 'error' in seedError
                    ? String(seedError.error)
                    : String(seedError);
            setError(msg);
        }
    }, [seedError]);
    // ── Derived categories ────────────────────────────────
    const categories = details ? [
        {
            key: 'app_pages', table: 'app_pages', label: 'App Pages', icon: '📄',
            count: details.counts.appPages ?? 0, detail: details.pageDetails,
            renderDetail: () => {
                if (details.pageDetails.length === 0)
                    return _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No pages seeded." });
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Slug" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "Tier" }), _jsx(TableCell, { align: "right", children: "Sections" })] }) }), _jsx(TableBody, { children: details.pageDetails.map((p) => (_jsxs(TableRow, { hover: true, sx: { cursor: 'pointer' }, onClick: () => window.location.href = `/${p.slug}`, children: [_jsx(TableCell, { children: _jsx(Link, { href: `/${p.slug}`, style: { textDecoration: 'none', color: 'inherit' }, onClick: (e) => e.stopPropagation(), children: _jsx(Typography, { variant: "body2", sx: { fontWeight: 600, '&:hover': { textDecoration: 'underline' } }, children: p.slug }) }) }), _jsx(TableCell, { children: p.title }), _jsx(TableCell, { children: p.authTier }), _jsx(TableCell, { align: "right", children: p.sectionCount })] }, p.slug))) })] }));
            },
        },
        {
            key: 'business_review', table: 'business_review_parts', label: 'Business Review Parts', icon: '📝',
            count: details.reviewPartDetails.length, detail: details.reviewPartDetails,
            renderDetail: () => details.reviewPartDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Part" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { align: "right", children: "Length" })] }) }), _jsx(TableBody, { children: details.reviewPartDetails.map((p) => _jsxs(TableRow, { children: [_jsx(TableCell, { children: p.partKey }), _jsx(TableCell, { children: p.title }), _jsxs(TableCell, { align: "right", children: [(p.markdownLength / 1000).toFixed(1), "K"] })] }, p.slug)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No review parts seeded." }),
        },
        {
            key: 'knowledge_snippets', table: 'knowledge_snippets', label: 'Knowledge Snippets', icon: '🧠',
            count: details.snippetDetails.length, detail: details.snippetDetails,
            renderDetail: () => details.snippetDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Key" }), _jsx(TableCell, { children: "Category" }), _jsx(TableCell, { align: "right", children: "Length" })] }) }), _jsx(TableBody, { children: details.snippetDetails.map((s) => _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontFamily: 'monospace', fontSize: '0.75rem' }, children: s.key }), _jsx(TableCell, { children: s.category }), _jsxs(TableCell, { align: "right", children: [(s.contentLength / 1000).toFixed(1), "K"] })] }, s.key)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No snippets seeded." }),
        },
        {
            key: 'tasks', table: 'tasks', label: 'Tasks', icon: '✅',
            count: details.taskDetails.length, detail: details.taskDetails,
            renderDetail: () => details.taskDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Task" }), _jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Roles" })] }) }), _jsx(TableBody, { children: details.taskDetails.map((t, i) => _jsxs(TableRow, { children: [_jsx(TableCell, { children: t.title }), _jsx(TableCell, { children: t.priority }), _jsx(TableCell, { children: t.status }), _jsx(TableCell, { children: t.roles.join(', ') || '—' })] }, i)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No tasks seeded." }),
        },
        {
            key: 'roles', table: 'roles', label: 'Roles', icon: '👤',
            count: details.roleDetails.length, detail: details.roleDetails,
            renderDetail: () => details.roleDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Code" }), _jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Email" })] }) }), _jsx(TableBody, { children: details.roleDetails.map((r) => _jsxs(TableRow, { children: [_jsx(TableCell, { children: r.code }), _jsx(TableCell, { children: r.name }), _jsx(TableCell, { children: r.email ?? '—' })] }, r.code)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No roles seeded." }),
        },
        {
            key: 'monthly_targets', table: 'monthly_targets', label: 'Monthly Targets', icon: '🎯',
            count: details.targetDetails.length, detail: details.targetDetails,
            renderDetail: () => details.targetDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Month" }), _jsx(TableCell, { align: "right", children: "Revenue" }), _jsx(TableCell, { align: "right", children: "EBITDA" }), _jsx(TableCell, { align: "right", children: "Guests" })] }) }), _jsx(TableBody, { children: details.targetDetails.map((t) => _jsxs(TableRow, { children: [_jsx(TableCell, { children: t.month }), _jsx(TableCell, { align: "right", children: t.targetRevenue.toLocaleString('id-ID') }), _jsx(TableCell, { align: "right", children: t.targetEbitda.toLocaleString('id-ID') }), _jsx(TableCell, { align: "right", children: t.targetGuests })] }, t.month)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No targets seeded." }),
        },
        {
            key: 'levers', table: 'levers', label: 'Levers', icon: '🔧',
            count: details.leverDetails.length, detail: details.leverDetails,
            renderDetail: () => details.leverDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Impact" })] }) }), _jsx(TableBody, { children: details.leverDetails.map((l) => _jsxs(TableRow, { children: [_jsx(TableCell, { children: l.num }), _jsx(TableCell, { children: l.name }), _jsx(TableCell, { children: l.impact })] }, l.num)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No levers seeded." }),
        },
        {
            key: 'action_items', table: 'action_items', label: 'Action Items', icon: '📋',
            count: details.actionItemDetails.length, detail: details.actionItemDetails,
            renderDetail: () => details.actionItemDetails.length > 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Action" }), _jsx(TableCell, { children: "Done" })] }) }), _jsx(TableBody, { children: details.actionItemDetails.map((a, i) => _jsxs(TableRow, { children: [_jsx(TableCell, { children: a.priority }), _jsx(TableCell, { children: a.label }), _jsx(TableCell, { children: a.completed ? '✓' : '—' })] }, i)) })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No action items seeded." }),
        },
        {
            key: 'financial_projections', table: 'financial_projections', label: 'Financial Projections', icon: '📊',
            count: details.counts.financialProjections ?? 0, detail: [],
            renderDetail: () => _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Financial projections: ", details.counts.financialProjections ?? 0, " rows."] }),
        },
        {
            key: 'z_reports', table: 'daily_z_reports', label: 'Z-Reports', icon: '📋',
            count: details.zReportDetails.length, detail: details.zReportDetails,
            renderDetail: () => details.zReportDetails.length > 0 ? (_jsxs(Box, { children: [_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Date" }), _jsx(TableCell, { children: "Dept" }), _jsx(TableCell, { children: "Total Sales" }), _jsx(TableCell, { children: "Nett Sales" }), _jsx(TableCell, { children: "Covers" }), _jsx(TableCell, { children: "Bills" }), _jsx(TableCell, { children: "Cash" }), _jsx(TableCell, { children: "Card" }), _jsx(TableCell, { children: "Operator" })] }) }), _jsx(TableBody, { children: details.zReportDetails.map((z) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: String(z.report_date ?? '') }), _jsx(TableCell, { children: String(z.department ?? '') }), _jsx(TableCell, { children: String(z.total_sales ?? '') }), _jsx(TableCell, { children: String(z.nett_sales ?? '') }), _jsx(TableCell, { children: String(z.total_covers ?? '') }), _jsx(TableCell, { children: String(z.total_bills ?? '') }), _jsx(TableCell, { children: String(z.cash_amount ?? '') }), _jsx(TableCell, { children: String(z.total_card_amount ?? '') }), _jsx(TableCell, { children: String(z.operator ?? '') })] }, String(z.id)))) })] }), _jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 1, display: 'block' }, children: ["Full data with all ", details.zReportDetails.length, " row(s) and 70+ fields available via the ", _jsx("strong", { children: "JSON" }), " export button above."] })] })) : _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No Z-reports found." }),
        },
    ] : [];
    // ── Selection ─────────────────────────────────────────
    const toggleCategory = (key) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key))
                next.delete(key);
            else
                next.add(key);
            return next;
        });
    };
    const toggleAll = () => {
        if (selected.size === categories.length)
            setSelected(new Set());
        else
            setSelected(new Set(categories.map((c) => c.key)));
    };
    // ── Clear selected ────────────────────────────────────
    const handleClearSelected = useCallback(async () => {
        const selectedTables = categories
            .filter((c) => selected.has(c.key))
            .map((c) => c.table);
        setClearError(null);
        setClearResult(null);
        try {
            const result = await clearSeed({
                mode: 'selected',
                tables: selectedTables,
                confirm: 'CLEAR SELECTED',
            }).unwrap();
            setClearResult(result.data.deleted);
            setConfirmOpen(false);
            setConfirmText('');
            setSelected(new Set());
            void refetchDetails();
        }
        catch (err) {
            setClearError(err instanceof Error ? err.message : String(err));
        }
    }, [selected, categories, clearSeed, refetchDetails]);
    // ── Export / Import ──────────────────────────────────
    const exportCategoryAsJson = useCallback((cat) => {
        // Wrap in a portable format: { table: "<table_name>", data: [...] }
        // This ensures the import endpoint can identify which table to write to.
        const payload = { table: cat.table, data: cat.detail };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cat.key}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);
    const exportAllAsJson = useCallback(() => {
        const allData = {};
        for (const cat of categories) {
            allData[cat.table] = cat.detail;
        }
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-seeded-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [categories]);
    const [importingCategory, setImportingCategory] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [categoryImportResults, setCategoryImportResults] = useState({});
    const fileInputRef = useRef(null);
    const categoryFileInputs = useRef({});
    const handleImportJson = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        e.target.value = '';
        setImportResult(null);
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const errors = [];
            let totalImported = 0;
            // Resolve entries from the uploaded JSON.
            // Supports three formats:
            //   1. Wrapped:  { "table": "knowledge_snippets", "data": [...] }
            //   2. Bulk:     { "knowledge_snippets": [...], "business_review_parts": [...] }
            //   3. Raw:      [...]  (single category array — we can't know the table, so skip)
            let entries = [];
            if (parsed && typeof parsed === 'object') {
                if (parsed.table && Array.isArray(parsed.data)) {
                    // Format 1: single-category wrapped export
                    entries = [[parsed.table, parsed.data]];
                }
                else {
                    // Format 2: bulk export — keys are table names, values are arrays
                    entries = Object.entries(parsed).filter((entry) => {
                        const key = entry[0];
                        // Filter out non-table keys and non-array values
                        if (key === 'table' || key === 'data')
                            return false;
                        return Array.isArray(entry[1]);
                    });
                }
            }
            else if (Array.isArray(parsed)) {
                // Format 3: raw array — we don't know the table name
                errors.push('Raw array detected. Please use a file exported from the "JSON" button which includes the table name.');
            }
            if (entries.length === 0 && errors.length === 0) {
                errors.push('No importable data found in the JSON file.');
            }
            for (const [table, data] of entries) {
                if (!Array.isArray(data) || data.length === 0)
                    continue;
                try {
                    const result = await importData({ table, data }).unwrap();
                    totalImported += result.data.imported;
                }
                catch (err) {
                    errors.push(`${table}: ${err instanceof Error ? err.message : 'Request failed'}`);
                }
            }
            if (errors.length > 0) {
                setImportResult(`Imported ${totalImported} rows. Warnings/errors:\n${errors.join('\n')}`);
            }
            else {
                setImportResult(`Imported ${totalImported} rows successfully.`);
            }
            void refetchDetails();
        }
        catch (err) {
            setImportResult(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [importData, refetchDetails]);
    /** Import a file for a specific category only. */
    const handleCategoryImport = useCallback(async (cat, file) => {
        setImportingCategory(cat.key);
        setCategoryImportResults((prev) => ({ ...prev, [cat.key]: null }));
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            // Accept either wrapped { table, data } format or raw array
            const table = parsed.table || cat.table;
            const data = parsed.data || (Array.isArray(parsed) ? parsed : null);
            if (!data || !Array.isArray(data) || data.length === 0) {
                setCategoryImportResults((prev) => ({ ...prev, [cat.key]: 'No data found in file' }));
                return;
            }
            const result = await importData({ table, data }).unwrap();
            setCategoryImportResults((prev) => ({ ...prev, [cat.key]: `Imported ${result.data.imported} rows` }));
            void refetchDetails();
        }
        catch (err) {
            setCategoryImportResults((prev) => ({ ...prev, [cat.key]: `Error: ${err instanceof Error ? err.message : String(err)}` }));
        }
        finally {
            setImportingCategory(null);
        }
    }, [importData, refetchDetails]);
    // ── Loading / error ───────────────────────────────────
    if (seedLoading) {
        return _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) });
    }
    if (error && !details) {
        return _jsx(Alert, { severity: "error", children: error });
    }
    // ── Render ────────────────────────────────────────────
    return (_jsxs(Stack, { spacing: 3, children: [_jsx(Paper, { variant: "outlined", sx: { p: 3 }, children: _jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Seeded Data Overview" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: details?.seedStatus
                                        ? `${details.seedStatus.totalRows} rows across ${details.seedStatus.totalTables} tables`
                                        : 'Loading...' })] }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => { void refetchDetails(); }, children: "Refresh" })] }) }), details?.seedStatus?.warnings && details.seedStatus.warnings.length > 0 ? (_jsx(Alert, { severity: "warning", children: details.seedStatus.warnings.map((w, i) => _jsx("div", { children: w }, i)) })) : null, categories.map((cat) => (_jsxs(Accordion, { elevation: 0, sx: { border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center', width: '100%', pr: 2 }, children: [_jsx(Checkbox, { checked: selected.has(cat.key), onChange: () => toggleCategory(cat.key), onClick: (e) => e.stopPropagation(), size: "small" }), _jsx(Typography, { variant: "body2", sx: { fontSize: '1.1rem' }, children: cat.icon }), _jsx(Box, { sx: { flex: 1 }, children: _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: cat.label }) }), _jsx(Chip, { label: `${cat.count} rows`, size: "small", variant: "outlined", color: cat.count > 0 ? 'primary' : 'default' }), cat.detail.length > 0 ? (_jsx(Button, { size: "small", variant: "text", onClick: (e) => { e.stopPropagation(); exportCategoryAsJson(cat); }, startIcon: _jsx(DownloadIcon, {}), sx: { minWidth: 0, p: 0.5 }, children: "JSON" })) : null, _jsxs(Button, { size: "small", variant: "text", component: "label", disabled: importingCategory === cat.key, onClick: (e) => e.stopPropagation(), startIcon: importingCategory === cat.key ? _jsx(CircularProgress, { size: 14 }) : _jsx(UploadFileIcon, {}), sx: { minWidth: 0, p: 0.5 }, children: [importingCategory === cat.key ? '...' : 'Upload', _jsx("input", { hidden: true, type: "file", accept: ".json", ref: (el) => { categoryFileInputs.current[cat.key] = el; }, onChange: (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    void handleCategoryImport(cat, file);
                                                }
                                                e.target.value = '';
                                            } })] }), categoryImportResults[cat.key] ? (_jsx(Typography, { variant: "caption", sx: { color: categoryImportResults[cat.key]?.includes('Error') || categoryImportResults[cat.key]?.includes('failed') ? 'error.main' : 'success.main' }, children: categoryImportResults[cat.key] })) : null] }) }), _jsx(AccordionDetails, { sx: { borderTop: '1px solid', borderColor: 'divider', pt: 2 }, children: cat.renderDetail() })] }, cat.key))), _jsx(Divider, {}), _jsx(Paper, { variant: "outlined", sx: { p: 2 }, children: _jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(DownloadIcon, {}), onClick: exportAllAsJson, disabled: categories.every((c) => c.detail.length === 0), children: "Export All as JSON" }), _jsxs(Button, { size: "small", variant: "outlined", component: "label", startIcon: importing ? _jsx(CircularProgress, { size: 16 }) : _jsx(UploadFileIcon, {}), disabled: importing, children: [importing ? 'Importing...' : 'Upload JSON', _jsx("input", { hidden: true, type: "file", accept: ".json", ref: fileInputRef, onChange: handleImportJson })] }), importResult ? (_jsx(Typography, { variant: "caption", color: importResult.includes('failed') ? 'error' : 'success.main', children: importResult })) : null] }) }), _jsx(Paper, { variant: "outlined", sx: { p: 3, borderColor: selected.size > 0 ? 'error.main' : 'divider', borderStyle: selected.size > 0 ? 'dashed' : 'solid' }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: selected.size === categories.length && categories.length > 0, indeterminate: selected.size > 0 && selected.size < categories.length, onChange: toggleAll }), label: `${selected.size} of ${categories.length} categories selected` }), _jsx(Button, { variant: "contained", color: "error", disabled: selected.size === 0 || clearing, onClick: () => setConfirmOpen(true), startIcon: clearing ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(DeleteSweepIcon, {}), children: clearing ? 'Clearing...' : `Delete Selected (${selected.size})` }), _jsx(Button, { variant: "outlined", color: "error", disabled: clearing, onClick: () => setSelected(new Set(categories.map((c) => c.key))), children: "Select All" })] }), clearError ? _jsx(Alert, { severity: "error", onClose: () => setClearError(null), children: clearError }) : null, clearResult ? (_jsxs(Alert, { severity: "success", icon: _jsx(CheckCircleIcon, {}), children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Selected data cleared." }), _jsx(Typography, { variant: "caption", component: "div", children: Object.entries(clearResult).filter(([, c]) => c > 0).map(([t, c]) => `${TABLE_META[t]?.label ?? t}: ${c} rows`).join('\n') })] })) : null] }) }), _jsxs(Dialog, { open: confirmOpen, onClose: () => { if (!clearing) {
                    setConfirmOpen(false);
                    setConfirmText('');
                } }, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { fontWeight: 700 }, children: "\u26A0\uFE0F Delete Selected Seeded Data?" }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, children: [_jsx(DialogContentText, { children: "This will permanently delete the following seeded data:" }), _jsx(Box, { component: "ul", sx: { m: 0, pl: 3 }, children: categories.filter((c) => selected.has(c.key)).map((c) => (_jsx("li", { children: _jsxs(Typography, { variant: "body2", children: [c.icon, " ", c.label, " (", c.count, " rows)"] }) }, c.key))) }), _jsx(DialogContentText, { sx: { fontWeight: 600, color: 'error.main' }, children: "This cannot be undone." }), _jsxs(DialogContentText, { children: ["Type ", _jsx("strong", { children: "CLEAR SELECTED" }), " below to confirm:"] }), _jsx(TextField, { fullWidth: true, size: "small", placeholder: "CLEAR SELECTED", value: confirmText, onChange: (e) => setConfirmText(e.target.value), autoFocus: true, error: confirmText.length > 0 && confirmText !== 'CLEAR SELECTED', helperText: confirmText.length > 0 && confirmText !== 'CLEAR SELECTED' ? 'Type the exact phrase' : '' })] }) }), _jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [_jsx(Button, { onClick: () => { setConfirmOpen(false); setConfirmText(''); }, disabled: clearing, children: "Cancel" }), _jsx(Button, { variant: "contained", color: "error", disabled: confirmText !== 'CLEAR SELECTED' || clearing, onClick: handleClearSelected, startIcon: clearing ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(DeleteSweepIcon, {}), children: clearing ? 'Clearing...' : 'Delete Selected' })] })] })] }));
}
