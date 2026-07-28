'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { CONFIG_UPLOAD_FIELD_NAMES, hasAnyUpload, validateExcelUpload, validateMarkdownUpload, } from '@/lib/config/upload-validation';
import { useReseedFromSourcesMutation, useReprocessFromCacheMutation, useGetSeedDetailsQuery } from '@/store/apis/config-api';
const FILE_FIELDS = [
    {
        key: 'excel',
        formName: 'excel',
        apiName: CONFIG_UPLOAD_FIELD_NAMES.excel,
        label: 'Cashflow workbooks (XLSX)',
        accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
        hint: 'Upload one or more workbooks. Multiple workbooks (e.g. different months or departments) are merged.',
        multiple: true,
    },
    {
        key: 'businessReview',
        formName: 'businessReview',
        apiName: CONFIG_UPLOAD_FIELD_NAMES.businessReview,
        label: 'Business Review (Markdown)',
        accept: '.md,.markdown,.txt,text/markdown,text/plain',
        hint: 'business-review.md — or use AI Content Generation tab to auto-generate from the workbook',
    },
    {
        key: 'executiveSummary',
        formName: 'executiveSummary',
        apiName: CONFIG_UPLOAD_FIELD_NAMES.executiveSummary,
        label: 'Executive Summary (Markdown)',
        accept: '.md,.markdown,.txt,text/markdown,text/plain',
        hint: 'executive-summary.md — or use AI Content Generation tab to auto-generate from the workbook',
    },
];
function fileFromList(list) {
    if (!list || list.length === 0)
        return null;
    return list[0] ?? null;
}
function filesFromList(list) {
    if (!list || list.length === 0)
        return [];
    return Array.from(list).filter(Boolean);
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function SourceUploadForm({ showSummaryOnly }) {
    const [reseed, { isLoading, isError, error, isSuccess, data, reset: resetMutation }] = useReseedFromSourcesMutation();
    const [reprocess, { isLoading: isReprocessing, isError: isReprocessError, error: reprocessError, isSuccess: isReprocessSuccess, data: reprocessData, reset: resetReprocess }] = useReprocessFromCacheMutation();
    const [fieldStatus, setFieldStatus] = useState({
        excel: null,
        businessReview: null,
        executiveSummary: null,
    });
    const { register, handleSubmit, watch, reset, formState: { errors }, } = useForm({
        defaultValues: {
            excel: null,
            businessReview: null,
            executiveSummary: null,
        },
    });
    const watched = watch();
    const selectedFiles = useMemo(() => ({
        excel: filesFromList(watched.excel),
        businessReview: fileFromList(watched.businessReview),
        executiveSummary: fileFromList(watched.executiveSummary),
    }), [watched.businessReview, watched.executiveSummary, watched.excel]);
    const onSubmit = async (values) => {
        const files = {
            excel: filesFromList(values.excel),
            businessReview: fileFromList(values.businessReview),
            executiveSummary: fileFromList(values.executiveSummary),
        };
        if (!hasAnyUpload(files)) {
            return;
        }
        const formData = new FormData();
        if (files.excel.length > 0) {
            for (const f of files.excel) {
                formData.append(CONFIG_UPLOAD_FIELD_NAMES.excel, f);
            }
        }
        if (files.businessReview) {
            formData.append(CONFIG_UPLOAD_FIELD_NAMES.businessReview, files.businessReview);
        }
        if (files.executiveSummary) {
            formData.append(CONFIG_UPLOAD_FIELD_NAMES.executiveSummary, files.executiveSummary);
        }
        resetMutation();
        await reseed(formData).unwrap();
        reset();
        setFieldStatus({ excel: null, businessReview: null, executiveSummary: null });
    };
    const updateFieldStatus = (field, file) => {
        let message = null;
        if (typeof file === 'string') {
            message = file; // e.g. "3 file(s) selected"
        }
        else if (file) {
            if (field === 'excel') {
                message = validateExcelUpload(file);
            }
            else if (field === 'businessReview') {
                message = validateMarkdownUpload(file, 'Business Review');
            }
            else {
                message = validateMarkdownUpload(file, 'Executive Summary');
            }
            if (!message) {
                message = `Ready — ${file.name} (${formatBytes(file.size)})`;
            }
        }
        setFieldStatus((prev) => ({ ...prev, [field]: message }));
    };
    const result = data?.success ? data.data : undefined;
    const apiError = isError && error && 'data' in error
        ? String(error.data?.error ?? 'Upload and reseed failed')
        : isError
            ? 'Upload and reseed failed'
            : null;
    return (_jsxs(Box, { component: "section", sx: { maxWidth: 720, mx: 'auto', py: 4, px: 2 }, children: [!showSummaryOnly ? (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 1 }, children: "Source Config" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Upload one or more source files to replace on disk and re-run the database seed pipeline. Omitted files keep their existing copies." }), _jsx(Paper, { variant: "outlined", sx: { p: 3, mb: 3 }, children: _jsxs(Stack, { component: "form", spacing: 3, onSubmit: handleSubmit(onSubmit), "data-testid": "source-upload-form", children: [FILE_FIELDS.map((field) => {
                                    const file = selectedFiles[field.key];
                                    const status = fieldStatus[field.key];
                                    const isValid = file && status?.startsWith('Ready');
                                    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 0.5 }, children: field.label }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1, display: 'block' }, children: field.hint }), _jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(CloudUploadIcon, {}), fullWidth: true, sx: { justifyContent: 'flex-start', textTransform: 'none' }, children: [file ? (Array.isArray(file) ? `${file.length} file(s)` : file.name) : 'Choose file', _jsx("input", { type: "file", hidden: true, accept: field.accept, multiple: field.multiple, ...register(field.formName, {
                                                            onChange: (event) => {
                                                                const input = event.target;
                                                                if (field.multiple) {
                                                                    updateFieldStatus(field.key, input.files?.length ? `${input.files.length} file(s) selected` : null);
                                                                }
                                                                else {
                                                                    const chosen = fileFromList(input.files);
                                                                    updateFieldStatus(field.key, chosen);
                                                                }
                                                            },
                                                        }) })] }), status ? (_jsx(Typography, { variant: "caption", color: isValid ? 'success.main' : 'error', sx: { mt: 0.5, display: 'block' }, children: status })) : null, errors[field.formName] ? (_jsx(Typography, { variant: "caption", color: "error", role: "alert", children: errors[field.formName]?.message })) : null] }, field.key));
                                }), _jsx(Button, { type: "submit", variant: "contained", disabled: isLoading || !hasAnyUpload(selectedFiles), startIcon: isLoading ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : undefined, "data-testid": "reseed-submit", children: isLoading ? 'Uploading & reseeding…' : 'Upload & reseed database' })] }) }), _jsx(Paper, { variant: "outlined", sx: { p: 3, mb: 3, borderColor: isReprocessSuccess ? 'success.main' : undefined }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: "Reprocess from cached workbook" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Re-run the seed pipeline using the previously uploaded workbook stored in the database. No file re-upload required. This will refresh dynamic pages, sheet metadata, and knowledge snippets." })] }), _jsx(Button, { variant: "contained", color: "secondary", disabled: isReprocessing, startIcon: isReprocessing ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : undefined, onClick: () => { resetReprocess(); void reprocess(); }, "data-testid": "reprocess-btn", children: isReprocessing ? 'Reprocessing…' : 'Reprocess from cache' }), isReprocessError && reprocessError && 'data' in reprocessError ? (_jsx(Alert, { severity: "error", role: "alert", children: String(reprocessError.data?.error ?? 'Reprocess failed') })) : null, isReprocessSuccess && reprocessData?.success && reprocessData.data ? (_jsx(Alert, { severity: "success", role: "status", children: "Reprocessed successfully from cached workbook." })) : null] }) })] })) : null, apiError ? (_jsx(Alert, { severity: "error", sx: { mb: 2 }, role: "alert", children: apiError })) : null, isSuccess && result ? (_jsx(Alert, { severity: "success", sx: { mb: 2 }, role: "status", children: "Database reseeded successfully." })) : null, result ? _jsx(SeedSummary, { result: result }) : null, isReprocessSuccess && reprocessData?.success && reprocessData.data ? (_jsx(SeedSummary, { result: reprocessData.data })) : null] }));
}
/** Human-readable labels for the seed table keys. */
const TABLE_LABELS = {
    appPages: 'App Pages',
    pageSections: 'Page Sections',
    businessReviewParts: 'Business Review Parts',
    knowledgeSnippets: 'Knowledge Snippets',
    tasks: 'Tasks',
    roles: 'Roles',
    monthlyTargets: 'Monthly Targets',
    levers: 'Levers',
    actionItems: 'Action Items',
    financialProjections: 'Financial Projections',
};
function SeedSummary({ result }) {
    const rows = Object.entries(result.counts);
    const [details, setDetails] = useState(null);
    const [expandedTable, setExpandedTable] = useState(null);
    const [showAiContent, setShowAiContent] = useState(false);
    const { data: seedDetailsData, isLoading: detailsLoading } = useGetSeedDetailsQuery();
    useEffect(() => {
        if (seedDetailsData?.success) {
            setDetails(seedDetailsData);
        }
    }, [seedDetailsData]);
    const handleToggle = (table) => {
        if (expandedTable === table) {
            setExpandedTable(null);
            return;
        }
        setExpandedTable(table);
    };
    /** Render the detail panel for a given table. */
    function renderDetail(table) {
        if (!details) {
            return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 2 }, children: _jsx(CircularProgress, { size: 20 }) }));
        }
        switch (table) {
            case 'appPages':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Slug" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "Tier" }), _jsx(TableCell, { align: "right", children: "Sections" })] }) }), _jsx(TableBody, { children: details.pageDetails.map((p) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: p.slug }), _jsx(TableCell, { children: p.title }), _jsx(TableCell, { children: p.authTier }), _jsx(TableCell, { align: "right", children: p.sectionCount })] }, p.slug))) })] }));
            case 'pageSections':
                return (_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { p: 1 }, children: [(details.counts?.pageSections ?? 0), " sections across", ' ', details.pageDetails.length, " pages. Each section renders a block type (chart, table, markdown, etc.) in the corresponding page."] }));
            case 'businessReviewParts':
                if (details.reviewPartDetails.length === 0) {
                    return (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { p: 1 }, children: "No Business Review parts seeded. Use the AI Content Generation tab to generate them from the workbook." }));
                }
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Part" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { align: "right", children: "Length" })] }) }), _jsx(TableBody, { children: details.reviewPartDetails.map((p) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: p.partKey }), _jsx(TableCell, { children: p.title }), _jsxs(TableCell, { align: "right", children: [(p.markdownLength / 1000).toFixed(1), "K"] })] }, p.slug))) })] }));
            case 'knowledgeSnippets':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Key" }), _jsx(TableCell, { children: "Category" }), _jsx(TableCell, { align: "right", children: "Length" })] }) }), _jsx(TableBody, { children: details.snippetDetails.map((s) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontFamily: 'monospace', fontSize: '0.75rem' }, children: s.key }), _jsx(TableCell, { children: s.category }), _jsxs(TableCell, { align: "right", children: [(s.contentLength / 1000).toFixed(1), "K"] })] }, s.key))) })] }));
            case 'tasks':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Task" }), _jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Roles" })] }) }), _jsx(TableBody, { children: details.taskDetails.map((t, i) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: t.title }), _jsx(TableCell, { children: t.priority }), _jsx(TableCell, { children: t.status }), _jsx(TableCell, { children: t.roles.join(', ') || '—' })] }, i))) })] }));
            case 'roles':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Code" }), _jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Email" })] }) }), _jsx(TableBody, { children: details.roleDetails.map((r) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: r.code }), _jsx(TableCell, { children: r.name }), _jsx(TableCell, { children: r.email ?? '—' })] }, r.code))) })] }));
            case 'monthlyTargets':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Month" }), _jsx(TableCell, { align: "right", children: "Revenue" }), _jsx(TableCell, { align: "right", children: "EBITDA" }), _jsx(TableCell, { align: "right", children: "Guests" })] }) }), _jsx(TableBody, { children: details.targetDetails.map((t) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: t.month }), _jsx(TableCell, { align: "right", children: t.targetRevenue.toLocaleString('id-ID') }), _jsx(TableCell, { align: "right", children: t.targetEbitda.toLocaleString('id-ID') }), _jsx(TableCell, { align: "right", children: t.targetGuests })] }, t.month))) })] }));
            case 'levers':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Impact" })] }) }), _jsx(TableBody, { children: details.leverDetails.map((l) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: l.num }), _jsx(TableCell, { children: l.name }), _jsx(TableCell, { children: l.impact })] }, l.num))) })] }));
            case 'actionItems':
                return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Action" }), _jsx(TableCell, { children: "Done" })] }) }), _jsx(TableBody, { children: details.actionItemDetails.map((a, i) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: a.priority }), _jsx(TableCell, { children: a.label }), _jsx(TableCell, { children: a.completed ? '✓' : '—' })] }, i))) })] }));
            default:
                return (_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { p: 1 }, children: [result.counts[table] ?? 0, " rows seeded in ", _jsx("code", { children: table }), "."] }));
        }
    }
    return (_jsxs(Stack, { spacing: 2, children: [_jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700, mb: 1 }, children: "Seed Summary" }), _jsxs(Stack, { direction: "row", spacing: 1, useFlexGap: true, sx: { mb: 2, flexWrap: 'wrap' }, children: [result.uploaded.map((key) => (_jsx(Chip, { size: "small", color: "primary", label: `Uploaded: ${key}` }, key))), Object.entries(result.filesUsed).map(([key, source]) => (_jsx(Chip, { size: "small", variant: "outlined", label: `${key}: ${source}` }, `${key}-${source}`)))] }), details?.seedStatus ? (_jsx(Box, { sx: { mb: 2 }, children: details.seedStatus.warnings.length > 0 ? (_jsxs(Alert, { severity: "warning", sx: { mb: 1 }, children: [_jsxs(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 0.5 }, children: ["Seed completed with ", details.seedStatus.warnings.length, " warning(s)"] }), _jsx("ul", { style: { margin: 0, paddingLeft: 20 }, children: details.seedStatus.warnings.map((w, i) => (_jsx("li", { children: _jsx(Typography, { variant: "caption", children: w }) }, i))) })] })) : (_jsx(Alert, { severity: "success", sx: { mb: 1 }, children: _jsxs(Typography, { variant: "body2", children: ["Seed completed successfully \u2014 ", details.seedStatus.totalRows, " rows across ", details.seedStatus.totalTables, " tables."] }) })) })) : null, rows.map(([table, count]) => (_jsxs(Accordion, { expanded: expandedTable === table, onChange: () => handleToggle(table), elevation: 0, sx: {
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:before': { display: 'none' },
                            mb: 0.5,
                        }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { variant: "body2", sx: {
                                        fontWeight: 600,
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }, children: [_jsx("span", { children: TABLE_LABELS[table] ?? table }), _jsx(Box, { component: "span", sx: { color: 'text.secondary', fontWeight: 400, ml: 2 }, children: count })] }) }), _jsx(AccordionDetails, { sx: { borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }, children: renderDetail(table) })] }, table)))] }), details ? (_jsxs(_Fragment, { children: [details.reviewPartDetails.length > 0 ? (_jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', mb: 2 }, children: [_jsx(DescriptionIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: "AI-Generated Business Review" })] }), details.reviewPartDetails.map((part) => (_jsxs(Accordion, { elevation: 0, sx: {
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:before': { display: 'none' },
                                    mb: 0.5,
                                }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: part.title }) }), _jsx(AccordionDetails, { sx: { borderTop: '1px solid', borderColor: 'divider' }, children: _jsx(Typography, { variant: "body2", component: "pre", sx: {
                                                whiteSpace: 'pre-wrap',
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                bgcolor: 'rgba(0,0,0,0.3)',
                                                p: 2,
                                                borderRadius: 1,
                                                maxHeight: 400,
                                                overflow: 'auto',
                                            }, children: part.markdownPreview }) })] }, part.slug)))] })) : null, details.executiveSummary ? (_jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', mb: 2 }, children: [_jsx(SummarizeIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: "AI-Generated Executive Summary" })] }), _jsx(Typography, { variant: "body2", component: "pre", sx: {
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    p: 2,
                                    borderRadius: 1,
                                    maxHeight: 400,
                                    overflow: 'auto',
                                }, children: details.executiveSummary.length > 2000
                                    ? details.executiveSummary.slice(0, 2000) + '\n\n... (truncated, open the Summary page for the full document)'
                                    : details.executiveSummary }), _jsx(Box, { sx: { mt: 1 }, children: _jsx(Button, { size: "small", variant: "text", onClick: () => setShowAiContent(!showAiContent), children: showAiContent ? 'Show Less' : 'Show Full Content' }) }), showAiContent ? (_jsx(Typography, { variant: "body2", component: "pre", sx: {
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    p: 2,
                                    borderRadius: 1,
                                    maxHeight: 600,
                                    overflow: 'auto',
                                    mt: 1,
                                }, children: details.executiveSummary })) : null] })) : null, details.reviewPartDetails.length === 0 && !details.executiveSummary ? (_jsx(Paper, { variant: "outlined", sx: { p: 2, bgcolor: 'rgba(235,61,40,0.04)' }, children: _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["No AI-generated content available yet. Go to ", _jsx("strong", { children: "Platform Admin \u2192 AI Content Generation" }), ' ', "to generate the Business Review and Executive Summary from the workbook."] }) })) : null] })) : null] }));
}
