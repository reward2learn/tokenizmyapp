'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StopIcon from '@mui/icons-material/Stop';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import DeleteIcon from '@mui/icons-material/Delete';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend, } from 'chart.js';
import { Bar } from 'react-chartjs-2';
let opsChartJsRegistered = false;
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTab } from '@/store/ui-slice';
import { useDeleteZReportMutation, useGetCalendarQuery, useGetDetailQuery, useGetSchemaQuery, useImportMetricsMutation, useListMetricsQuery, useSaveZReportMutation, } from '@/store/apis/metrics-api';
import { useGetMonthlyActualsQuery, useLazyGetMonthlyActualsQuery, useSaveMonthlyActualsMutation, } from '@/store/apis/monthly-actuals-api';
import { useParseExpenseTextMutation, useParsePosTextMutation, useScanExpenseReceiptMutation, useScanPosReceiptMutation, } from '@/store/apis/pos-api';
import { imageToDataUrl } from '@/domain/z-report/receipt-images';
import { Z_REPORT_FIELD_KEYS } from '@/domain/z-report/z-report-schema';
import { PRORATE_KEYS } from '@/domain/z-report/z-report-service';
import { camelToSnake } from '@/domain/shared/number-utils';
const TOUCH_TARGET_SX = { minHeight: 48 };
/** Thumbnail grid of receipt images with per-image delete */
function ReceiptThumbnails({ images, onRemove, onView, }) {
    if (!images.length)
        return null;
    return (_jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1.5 }, children: images.map((img, i) => (_jsxs(Box, { sx: {
                position: 'relative',
                width: 100,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                cursor: onView ? 'pointer' : 'default',
            }, onClick: () => onView?.(i), children: [_jsx("img", { src: img.dataUrl, alt: img.name, style: { width: '100%', height: 75, objectFit: 'cover', display: 'block' } }), _jsx(Button, { size: "small", onClick: () => onRemove(i), sx: {
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        minWidth: 24,
                        width: 24,
                        height: 24,
                        p: 0,
                        borderRadius: '0 0 0 4px',
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: '0.75rem',
                        lineHeight: 1,
                        '&:hover': { bgcolor: 'error.main' },
                    }, children: "\u2715" }), _jsx(Typography, { variant: "caption", noWrap: true, sx: { display: 'block', px: 0.5, py: 0.25, fontSize: '0.65rem' }, children: img.name.length > 14 ? `${img.name.slice(0, 12)}…` : img.name })] }, `${img.name}-${i}`))) }));
}
function today() {
    return new Date().toISOString().slice(0, 10);
}
function currentPeriod() {
    return new Date().toISOString().slice(0, 7);
}
function priorPeriod(period) {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function buildImportPreview(period, rows) {
    // Normalize camelCase keys → snake_case so the preview accepts either convention
    for (const row of rows) {
        for (const key of Object.keys(row)) {
            const snakeKey = camelToSnake(key);
            if (snakeKey !== key && row[snakeKey] === undefined) {
                row[snakeKey] = row[key];
            }
        }
    }
    const monthlyRow = rows.find((row) => row.period && !row.report_date && !row.date);
    if (monthlyRow) {
        const monthlyPeriod = String(monthlyRow.period).slice(0, 7) || period;
        const monthly = {};
        for (const [key, value] of Object.entries(monthlyRow)) {
            if (key !== 'period' && value !== '')
                monthly[key] = value;
        }
        return {
            mode: 'monthly_prorate',
            period: monthlyPeriod,
            monthly,
            summary: `Monthly prorate for ${monthlyPeriod} across missing days`,
        };
    }
    const dailyRows = rows.filter((row) => {
        const date = String(row.report_date ?? row.date ?? '').slice(0, 10);
        if (!date)
            return false;
        const hasSales = (row.nett_sales != null && row.nett_sales !== '')
            || (row.total_sales != null && row.total_sales !== '');
        const hasCovers = row.total_covers != null && row.total_covers !== '';
        return hasSales && hasCovers;
    });
    if (!dailyRows.length)
        return null;
    const inMonth = dailyRows.filter((row) => String(row.report_date ?? row.date).slice(0, 7) === period);
    const useRows = inMonth.length ? inMonth : dailyRows;
    return {
        mode: 'daily',
        period,
        rows: useRows,
        summary: `${useRows.length} daily row(s) for import`,
    };
}
function toNumberOrString(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return '';
    const normalized = trimmed.replace(/,/g, '');
    const numeric = Number(normalized);
    return Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(normalized) ? numeric : trimmed;
}
function asRecord(value) {
    return typeof value === 'object' && value !== null ? value : {};
}
function formatIdr(value) {
    const number = Number(value ?? 0);
    if (!Number.isFinite(number))
        return '-';
    return `IDR ${Math.round(number).toLocaleString('id-ID')}`;
}
async function readReceiptFiles(files) {
    const selected = Array.from(files ?? []).slice(0, 3);
    return Promise.all(selected.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
            dataUrl: String(reader.result ?? ''),
            mime: file.type || 'image/jpeg',
            name: file.name,
            captured_at: new Date().toISOString(),
        });
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
    })));
}
function buildPayload(values, extra = {}) {
    const payload = { ...extra };
    for (const [key, value] of Object.entries(values)) {
        const coerced = typeof value === 'string' ? toNumberOrString(value) : value;
        if (coerced !== '')
            payload[key] = coerced;
    }
    return payload;
}
function dataFromEnvelope(value) {
    return asRecord(value).data;
}
function SectionShell({ title, tooltip, children }) {
    return (_jsxs(Paper, { elevation: 0, sx: { p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: '#0f0f14' }, children: [_jsxs(Typography, { variant: "h6", sx: { fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }, children: [title, tooltip ? (_jsx(Tooltip, { title: tooltip, arrow: true, children: _jsx(Box, { component: "span", sx: { cursor: 'help', color: 'text.secondary', fontSize: '0.8rem' }, children: "\u24D8" }) })) : null] }), children] }));
}
/** Modal for cropping a receipt photo before adding it to the list */
function CropModal({ open, imageDataUrl, imageName, onCrop, onSkip, }) {
    const imgRef = useRef(null);
    const imageWrapRef = useRef(null);
    const [selection, setSelection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    // Reset selection when modal opens
    useEffect(() => {
        if (open) {
            setSelection(null);
            setIsDragging(false);
            setDragStart(null);
        }
    }, [open]);
    /** Percentage position relative to the image's rendered size (not the outer container) */
    const getRelativePos = useCallback((clientX, clientY) => {
        const rect = imageWrapRef.current?.getBoundingClientRect();
        if (!rect)
            return null;
        return {
            x: (clientX - rect.left) / rect.width,
            y: (clientY - rect.top) / rect.height,
        };
    }, []);
    const handleMouseDown = useCallback((e) => {
        const pos = getRelativePos(e.clientX, e.clientY);
        if (!pos)
            return;
        setDragStart(pos);
        setIsDragging(true);
        setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
    }, [getRelativePos]);
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !dragStart)
            return;
        const pos = getRelativePos(e.clientX, e.clientY);
        if (!pos)
            return;
        const left = Math.min(dragStart.x, pos.x);
        const top = Math.min(dragStart.y, pos.y);
        const right = Math.max(dragStart.x, pos.x);
        const bottom = Math.max(dragStart.y, pos.y);
        setSelection({ x: left, y: top, w: right - left, h: bottom - top });
    }, [isDragging, dragStart, getRelativePos]);
    const finishDrag = useCallback(() => {
        setIsDragging(false);
        setDragStart(null);
        setSelection((prev) => {
            if (prev && (prev.w < 0.02 || prev.h < 0.02))
                return null;
            return prev;
        });
    }, []);
    const handleCrop = useCallback(() => {
        const img = imgRef.current;
        if (!img)
            return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const natW = img.naturalWidth;
        const natH = img.naturalHeight;
        let sx, sy, sw, sh;
        if (selection) {
            sx = Math.round(selection.x * natW);
            sy = Math.round(selection.y * natH);
            sw = Math.round(selection.w * natW);
            sh = Math.round(selection.h * natH);
            // Clamp to image bounds
            sw = Math.min(sw, natW - sx);
            sh = Math.min(sh, natH - sy);
        }
        else {
            sx = 0;
            sy = 0;
            sw = natW;
            sh = natH;
        }
        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onCrop(croppedDataUrl);
    }, [selection, onCrop]);
    return (_jsxs(Dialog, { open: open, maxWidth: "lg", fullWidth: true, onClose: onSkip, children: [_jsxs(DialogTitle, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Typography, { variant: "body1", noWrap: true, sx: { maxWidth: '80%' }, children: ["Crop \u2014 ", imageName] }), _jsx(IconButton, { onClick: onSkip, size: "small", children: "\u2715" })] }), _jsx(DialogContent, { sx: { p: 0, bgcolor: '#000', overflow: 'hidden' }, children: _jsx(Box, { sx: {
                        cursor: 'crosshair',
                        userSelect: 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                    }, children: _jsxs(Box, { ref: imageWrapRef, sx: { position: 'relative', display: 'inline-block', lineHeight: 0 }, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: finishDrag, onMouseLeave: finishDrag, children: [_jsx("img", { ref: imgRef, src: imageDataUrl, alt: imageName, draggable: false, style: { maxWidth: '100%', maxHeight: '70vh', display: 'block' } }), selection ? (_jsxs(_Fragment, { children: [_jsx(Box, { sx: { position: 'absolute', top: 0, left: 0, right: 0, height: `${selection.y * 100}%`, bgcolor: 'rgba(0,0,0,0.55)', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(1 - selection.y - selection.h) * 100}%`, bgcolor: 'rgba(0,0,0,0.55)', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', top: `${selection.y * 100}%`, left: 0, width: `${selection.x * 100}%`, height: `${selection.h * 100}%`, bgcolor: 'rgba(0,0,0,0.55)', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', top: `${selection.y * 100}%`, right: 0, width: `${(1 - selection.x - selection.w) * 100}%`, height: `${selection.h * 100}%`, bgcolor: 'rgba(0,0,0,0.55)', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', top: `${selection.y * 100}%`, left: `${selection.x * 100}%`, width: `${selection.w * 100}%`, height: `${selection.h * 100}%`, border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.3)', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', top: `calc(${selection.y * 100}% - 6px)`, left: `calc(${selection.x * 100}% - 6px)`, width: 12, height: 12, border: '2px solid #fff', borderRadius: '50%', bgcolor: 'primary.main', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', top: `calc(${selection.y * 100}% - 6px)`, right: `calc(${(1 - selection.x - selection.w) * 100}% - 6px)`, width: 12, height: 12, border: '2px solid #fff', borderRadius: '50%', bgcolor: 'primary.main', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', bottom: `calc(${(1 - selection.y - selection.h) * 100}% - 6px)`, left: `calc(${selection.x * 100}% - 6px)`, width: 12, height: 12, border: '2px solid #fff', borderRadius: '50%', bgcolor: 'primary.main', pointerEvents: 'none' } }), _jsx(Box, { sx: { position: 'absolute', bottom: `calc(${(1 - selection.y - selection.h) * 100}% - 6px)`, right: `calc(${(1 - selection.x - selection.w) * 100}% - 6px)`, width: 12, height: 12, border: '2px solid #fff', borderRadius: '50%', bgcolor: 'primary.main', pointerEvents: 'none' } })] })) : (_jsx(Typography, { sx: {
                                    position: 'absolute',
                                    bottom: 16,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 1,
                                    fontSize: '0.85rem',
                                    pointerEvents: 'none',
                                }, children: "Click and drag to select crop area" }))] }) }) }), _jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [_jsx(Button, { onClick: onSkip, color: "inherit", children: "Use Original" }), _jsx(Button, { onClick: handleCrop, variant: "contained", startIcon: _jsx(AutoFixHighIcon, {}), children: "Crop & Confirm" })] })] }));
}
const PosOcrPanel = forwardRef(({ onParsed, onImagesReady, onParseComplete, resetKey, }, ref) => {
    const [images, setImages] = useState([]);
    const [text, setText] = useState('');
    const [scanPosReceipt] = useScanPosReceiptMutation();
    const [parse] = useParsePosTextMutation();
    const abortRef = useRef(null);
    const [scanProgress, setScanProgress] = useState(null);
    // Crop modal state
    const [cropTarget, setCropTarget] = useState(null);
    const cropQueueRef = useRef([]);
    // Image viewer state
    const [viewIndex, setViewIndex] = useState(null);
    // Reset on resetKey change
    const prevResetKey = useRef(resetKey);
    if (resetKey !== prevResetKey.current) {
        prevResetKey.current = resetKey;
        if (resetKey !== undefined && resetKey !== 0) {
            setImages([]);
            setText('');
            cropQueueRef.current = [];
            setCropTarget(null);
        }
    }
    /** Open crop modal for the next file in the queue, or flush the queue */
    const processNextInQueue = useCallback(() => {
        const next = cropQueueRef.current.shift();
        if (next) {
            setCropTarget({ dataUrl: next.dataUrl, name: next.name });
        }
        else {
            setCropTarget(null);
        }
    }, []);
    /** Called when user confirms a crop — replace the cropped image into images */
    const handleCropConfirm = useCallback((croppedDataUrl) => {
        const target = cropTarget;
        if (!target)
            return;
        setImages((prev) => [...prev, {
                dataUrl: croppedDataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processNextInQueue();
    }, [cropTarget, processNextInQueue]);
    /** Called when user skips crop — use original image */
    const handleCropSkip = useCallback(() => {
        const target = cropTarget;
        if (!target)
            return;
        setImages((prev) => [...prev, {
                dataUrl: target.dataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processNextInQueue();
    }, [cropTarget, processNextInQueue]);
    const handleScan = async () => {
        setScanProgress({ current: 0, total: images.length, failed: 0, status: 'scanning' });
        const results = [];
        let failed = 0;
        for (let i = 0; i < images.length; i++) {
            if (abortRef.current?.signal.aborted)
                break;
            setScanProgress({ current: i + 1, total: images.length, failed, status: 'scanning' });
            try {
                abortRef.current = new AbortController();
                const result = await scanPosReceipt({ images: [images[i].dataUrl] }).unwrap();
                if (result.data?.text)
                    results.push(result.data.text.trim());
            }
            catch (err) {
                if (err.name === 'AbortError')
                    break;
                failed++;
                setScanProgress({ current: i + 1, total: images.length, failed, status: 'scanning' });
            }
        }
        if (!abortRef.current?.signal.aborted) {
            setScanProgress({ current: images.length, total: images.length, failed, status: 'processing' });
            await new Promise((r) => setTimeout(r, 80));
            const joined = results.map((r) => r.trim()).join('\n---\n');
            const cleaned = joined.replace(/\n{3,}/g, '\n\n').trim();
            setText(cleaned);
        }
        abortRef.current = null;
        setScanProgress(null);
    };
    const handleStopScan = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setScanProgress(null);
    };
    const handleParse = async () => {
        if (!text.trim())
            return false;
        try {
            const payload = await parse({ text, useAi: true }).unwrap();
            const parsed = asRecord(payload.data);
            onParsed(Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value ?? '')])));
            // Auto-attach scanned images to verification receipts
            if (onImagesReady && images.length) {
                onImagesReady(images);
            }
            if (onParseComplete)
                onParseComplete();
            return true;
        }
        catch {
            return false;
        }
    };
    useImperativeHandle(ref, () => ({
        triggerParse: handleParse,
    }));
    return (_jsxs(SectionShell, { title: "POS OCR Prefill", children: [_jsxs(Stack, { spacing: 2, children: [_jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(AttachFileIcon, {}), children: ["Attach POS Receipt Photos", _jsx("input", { hidden: true, multiple: true, accept: "image/*", type: "file", onChange: async (event) => {
                                    const files = await readReceiptFiles(event.target.files);
                                    // Clear the input so re-selecting the same file triggers onChange
                                    event.target.value = '';
                                    if (!files.length)
                                        return;
                                    // Enqueue all new files and process one at a time via crop modal
                                    cropQueueRef.current.push(...files);
                                    processNextInQueue();
                                } })] }), _jsx(ReceiptThumbnails, { images: images, onRemove: (i) => setImages((prev) => prev.filter((_, idx) => idx !== i)), onView: (i) => setViewIndex(i) }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, children: [_jsx(Button, { onClick: handleScan, disabled: !images.length || !!scanProgress, variant: "contained", startIcon: _jsx(PhotoCameraIcon, {}), children: scanProgress ? `Scanning ${scanProgress.current}/${scanProgress.total}${scanProgress.failed ? ` (${scanProgress.failed} failed)` : ''}${scanProgress.status === 'processing' ? ' — Processing...' : ''}...` : 'Scan' }), scanProgress ? (_jsx(Button, { onClick: handleStopScan, variant: "outlined", color: "warning", startIcon: _jsx(StopIcon, {}), children: "Stop" })) : null] }), scanProgress ? (_jsx(LinearProgress, { variant: "determinate", value: Math.round((scanProgress.current / scanProgress.total) * 100) })) : null, _jsx(TextField, { label: "Receipt text", value: text, onChange: (event) => setText(event.target.value), multiline: true, minRows: 6, fullWidth: true })] }), _jsx(ZoomableViewer, { open: viewIndex !== null, imageDataUrl: viewIndex !== null ? images[viewIndex].dataUrl : '', imageName: viewIndex !== null ? images[viewIndex].name : '', onClose: () => setViewIndex(null) }), _jsx(CropModal, { open: !!cropTarget, imageDataUrl: cropTarget?.dataUrl ?? '', imageName: cropTarget?.name ?? '', onCrop: handleCropConfirm, onSkip: handleCropSkip })] }));
});
function ZReportListView({ recentRows, setZrepDetail, }) {
    return (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Date" }), _jsx(TableCell, { children: "Dept" }), _jsx(TableCell, { children: "Nett Sales" }), _jsx(TableCell, { children: "Covers" }), _jsx(TableCell, { children: "Receipts" })] }) }), _jsx(TableBody, { children: recentRows.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, align: "center", children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No recent reports." }) }) })) : (recentRows.map((row) => {
                    const date = row.report_date ?? row.date ?? '';
                    return (_jsxs(TableRow, { hover: true, sx: { cursor: 'pointer' }, onClick: () => setZrepDetail({ date: String(date), dept: String(row.department ?? 'all_pos') }), children: [_jsx(TableCell, { children: date }), _jsx(TableCell, { children: row.department ?? 'all_pos' }), _jsx(TableCell, { children: formatIdr(row.nett_sales) }), _jsx(TableCell, { children: row.total_covers ?? '-' }), _jsx(TableCell, { children: row.receipt_image_count ?? 0 })] }, `${date}-${row.department ?? 'all'}`));
                })) })] }));
}
function ZReportCalendarView({ onDayClick }) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { data: calPayload, isFetching } = useGetCalendarQuery(period);
    const calData = dataFromEnvelope(calPayload);
    if (isFetching)
        return _jsx(CircularProgress, { size: 24 });
    if (!calData)
        return _jsx(Typography, { color: "text.secondary", children: "No calendar data." });
    const filledSet = new Set((calData.filled ?? []).map((f) => f.date));
    const days = calData.days_in_month ?? 30;
    const monthLabel = new Date(Number(period.split('-')[0]), Number(period.split('-')[1]) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 1 }, children: monthLabel }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }, children: [['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (_jsx(Typography, { variant: "caption", sx: { fontWeight: 700 }, children: d }, d))), Array.from({ length: days }, (_, i) => {
                        const date = `${period}-${String(i + 1).padStart(2, '0')}`;
                        const hasData = filledSet.has(date);
                        return (_jsx(Box, { sx: {
                                p: 0.5,
                                borderRadius: 0.5,
                                bgcolor: hasData ? 'primary.main' : 'action.hover',
                                color: hasData ? 'primary.contrastText' : 'text.secondary',
                                fontSize: '0.75rem',
                                minHeight: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: hasData && onDayClick ? 'pointer' : 'default',
                                '&:hover': hasData && onDayClick ? { opacity: 0.8 } : undefined,
                            }, onClick: () => hasData && onDayClick?.(date), children: i + 1 }, date));
                    })] })] }));
}
function ZReportChartView() {
    const now = new Date();
    const [chartYear, setChartYear] = useState(now.getFullYear());
    const [chartMonth, setChartMonth] = useState(now.getMonth() + 1);
    const [chartMetrics, setChartMetrics] = useState(['nett_sales']);
    useEffect(() => {
        if (!opsChartJsRegistered) {
            ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);
            opsChartJsRegistered = true;
        }
    }, []);
    const from = `${chartYear}-${String(chartMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(chartYear, chartMonth, 0).getDate();
    const to = `${chartYear}-${String(chartMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const { data: chartPayload, isFetching } = useListMetricsQuery({ from, to, limit: 31 });
    const chartRows = asRecord(chartPayload).rows ?? [];
    // All available numeric metrics from the data
    const availableMetrics = [
        { key: 'nett_sales', label: 'Nett Sales' },
        { key: 'total_sales', label: 'Total Sales' },
        { key: 'total_covers', label: 'Total Covers' },
        { key: 'total_bills', label: 'Total Bills' },
        { key: 'avg_bills', label: 'Avg Bill' },
        { key: 'avg_covers', label: 'Avg Cover' },
        { key: 'estimated_sales', label: 'Estimated Sales' },
        { key: 'item_sales_amount', label: 'Item Sales Amount' },
        { key: 'item_discount_amount', label: 'Item Discount Amount' },
        { key: 'bill_discount_amount', label: 'Bill Discount Amount' },
        { key: 'tax_10_amount', label: 'Tax 10%' },
        { key: 'service_7_amount', label: 'Service 7%' },
        { key: 'tot_collection_amount', label: 'Total Collection' },
        { key: 'cash_amount', label: 'Cash Amount' },
        { key: 'bca_amount', label: 'BCA Amount' },
        { key: 'gojek_pay_amount', label: 'Gojek Pay Amount' },
        { key: 'mandiri_amount', label: 'Mandiri Amount' },
        { key: 'group_beverage_amount', label: 'Group Beverage Amount' },
        { key: 'group_food_amount', label: 'Group Food Amount' },
        { key: 'group_total_amount', label: 'Group Total Amount' },
        { key: 'dine_in_amount', label: 'Dine In Amount' },
        { key: 'gofood_amount', label: 'GoFood Amount' },
        { key: 'total_ctgry_amount', label: 'Total Category Amount' },
        { key: 'bill_disc_20_amount', label: 'Bill Disc 20% Amount' },
        { key: 'total_item_discount_amount', label: 'Total Item Discount Amount' },
    ];
    const selectedMetricOptions = availableMetrics.filter((m) => chartMetrics.includes(m.key));
    // Aggregate by day for each selected metric
    const byDay = {};
    for (const row of chartRows) {
        const date = row.report_date ?? row.date ?? '';
        if (!date)
            continue;
        if (!byDay[date])
            byDay[date] = {};
        for (const metric of chartMetrics) {
            const val = Number(row[metric] ?? 0);
            byDay[date][metric] = (byDay[date][metric] ?? 0) + val;
        }
    }
    const days = Array.from({ length: lastDay }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return `${chartYear}-${String(chartMonth).padStart(2, '0')}-${day}`;
    });
    const datasets = chartMetrics.map((metric, idx) => {
        const colors = [
            'rgba(144, 202, 249, 0.6)',
            'rgba(255, 167, 38, 0.6)',
            'rgba(102, 187, 106, 0.6)',
            'rgba(239, 83, 80, 0.6)',
            'rgba(171, 71, 188, 0.6)',
            'rgba(255, 235, 59, 0.6)',
        ];
        const borderColors = [
            'rgb(144, 202, 249)',
            'rgb(255, 167, 38)',
            'rgb(102, 187, 106)',
            'rgb(239, 83, 80)',
            'rgb(171, 71, 188)',
            'rgb(255, 235, 59)',
        ];
        const metricInfo = availableMetrics.find((m) => m.key === metric);
        return {
            label: `${metricInfo?.label || metric} — ${new Date(chartYear, chartMonth - 1).toLocaleString('default', { month: 'long' })}`,
            data: days.map((d) => byDay[d]?.[metric] ?? 0),
            backgroundColor: colors[idx % colors.length],
            borderColor: borderColors[idx % borderColors.length],
            borderWidth: 1,
            yAxisID: idx === 0 ? 'y' : 'y1',
        };
    });
    const chartData = {
        labels: days.map((d) => d),
        datasets,
    };
    return (_jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { flexWrap: 'wrap' }, children: [_jsx(TextField, { select: true, size: "small", label: "Year", value: chartYear, onChange: (e) => setChartYear(Number(e.target.value)), sx: { minWidth: 100 }, children: [2025, 2026, 2027].map((y) => (_jsx(MenuItem, { value: y, children: y }, y))) }), _jsx(TextField, { select: true, size: "small", label: "Month", value: chartMonth, onChange: (e) => setChartMonth(Number(e.target.value)), sx: { minWidth: 120 }, children: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (_jsx(MenuItem, { value: i + 1, children: m }, i + 1))) }), _jsx(Autocomplete, { multiple: true, size: "small", options: availableMetrics, getOptionLabel: (option) => option.label, isOptionEqualToValue: (a, b) => a.key === b.key, value: selectedMetricOptions, onChange: (_, selected) => {
                            setChartMetrics(selected.map((m) => m.key));
                        }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Metrics", placeholder: "Select metrics..." })), sx: { minWidth: 220, flex: 1 } })] }), isFetching ? (_jsx(CircularProgress, { size: 24 })) : days.length === 0 ? (_jsxs(Typography, { color: "text.secondary", children: ["No data for ", new Date(chartYear, chartMonth - 1).toLocaleString('default', { month: 'long' }), " ", chartYear, "."] })) : (_jsx(Box, { sx: { height: 280 }, children: _jsx(Bar, { data: chartData, options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { display: true, position: 'top' },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => `${ctx.dataset.label}: ${formatIdr(ctx.raw)}`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Date (YYYY-MM-DD)' },
                                ticks: {
                                    autoSkip: false,
                                    maxRotation: 90,
                                    minRotation: 45,
                                    font: { size: 10 },
                                },
                            },
                            y: {
                                type: 'linear',
                                position: 'left',
                                beginAtZero: true,
                                title: { display: true, text: 'Amount (IDR)' },
                            },
                            y1: {
                                type: 'linear',
                                position: 'right',
                                grid: { drawOnChartArea: false },
                                title: { display: true, text: 'Count' },
                            },
                        },
                    } }) }))] }));
}
function DayPosTab() {
    const [department, setDepartment] = useState('all_pos');
    const [values, setValues] = useState({ report_date: today() });
    const [receiptImages, setReceiptImages] = useState([]);
    const [save, saveState] = useSaveZReportMutation();
    const [resetKey, setResetKey] = useState(0);
    const posOcrRef = useRef(null);
    const [expanded, setExpanded] = useState('step1');
    const [isParsing, setIsParsing] = useState(false);
    const [errors, setErrors] = useState(new Set());
    const [viewMode, setViewMode] = useState('list');
    const [zrepDetail, setZrepDetail] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [viewStep2Img, setViewStep2Img] = useState(null);
    const [cropStep2, setCropStep2] = useState(null);
    const cropStep2Ref = useRef([]);
    const { data, isFetching } = useGetSchemaQuery(department);
    const { data: recentPayload } = useListMetricsQuery({ page: 1, limit: 5 });
    const schema = dataFromEnvelope(data);
    const departments = schema?.departments ?? [];
    const sections = schema?.form_sections ?? [];
    const recentRows = asRecord(recentPayload).rows ?? [];
    const { data: zrepDetailPayload, isFetching: zrepLoading } = useGetDetailQuery({ date: zrepDetail?.date ?? '', department: zrepDetail?.dept ?? 'all_pos' }, { skip: !zrepDetail });
    const zrepDetailData = dataFromEnvelope(zrepDetailPayload);
    const zrepImages = (Array.isArray(zrepDetailData?.receipt_images) ? zrepDetailData?.receipt_images : []);
    const handleChange = (key, value) => {
        setValues((current) => ({ ...current, [key]: value }));
        if (errors.has(key) && value.trim()) {
            setErrors((prev) => { const next = new Set(prev); next.delete(key); return next; });
        }
    };
    const validateForm = () => {
        const missing = new Set();
        for (const section of sections) {
            for (const field of section.fields) {
                if (field.required && !values[field.key]?.trim()) {
                    missing.add(field.key);
                }
            }
        }
        // Also check net_sales and total_covers specifically
        if (!values['nett_sales']?.trim() && !values['total_sales']?.trim()) {
            missing.add('nett_sales');
        }
        if (!values['total_covers']?.trim()) {
            missing.add('total_covers');
        }
        setErrors(missing);
        return missing.size === 0;
    };
    const handleSave = async () => {
        if (!validateForm())
            return;
        await save(buildPayload(values, {
            department,
            receipt_images: receiptImages,
        })).unwrap();
        setValues({ report_date: today() });
        setReceiptImages([]);
        setErrors(new Set());
        setResetKey((k) => k + 1);
        setExpanded('step3');
    };
    const handleAccordion = (panel) => (_, isExpanded) => {
        setExpanded(isExpanded ? panel : '');
    };
    // --- Step 2 image crop handlers ---
    const processStep2CropQueue = useCallback(() => {
        const next = cropStep2Ref.current.shift();
        if (next) {
            setCropStep2({ dataUrl: next.dataUrl, name: next.name });
        }
        else {
            setCropStep2(null);
        }
    }, []);
    const handleStep2CropConfirm = useCallback((croppedDataUrl) => {
        const target = cropStep2;
        if (!target)
            return;
        setReceiptImages((prev) => [...prev, {
                dataUrl: croppedDataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processStep2CropQueue();
    }, [cropStep2, processStep2CropQueue]);
    const handleStep2CropSkip = useCallback(() => {
        const target = cropStep2;
        if (!target)
            return;
        setReceiptImages((prev) => [...prev, {
                dataUrl: target.dataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processStep2CropQueue();
    }, [cropStep2, processStep2CropQueue]);
    return (_jsxs(Box, { sx: { pb: 9 }, children: [_jsxs(Accordion, { expanded: expanded === 'step1', onChange: handleAccordion('step1'), sx: { mb: 1 }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { sx: { fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }, children: ["Step 1: POS OCR Prefill", _jsx(Tooltip, { title: "Scan POS receipt images to extract Z-report data automatically", arrow: true, children: _jsx(Box, { component: "span", sx: { cursor: 'help', color: 'text.secondary', fontSize: '0.8rem' }, children: "\u24D8" }) })] }) }), _jsxs(AccordionDetails, { children: [_jsx(PosOcrPanel, { ref: posOcrRef, resetKey: resetKey, onParsed: (parsed) => setValues((current) => ({ ...current, ...parsed })), onImagesReady: (imgs) => setReceiptImages((prev) => {
                                    const existing = new Set(prev.map((p) => p.dataUrl));
                                    const newImgs = imgs.filter((img) => !existing.has(img.dataUrl));
                                    return [...prev, ...newImgs];
                                }), onParseComplete: () => setExpanded('step2') }), _jsx(Box, { sx: { position: 'sticky', bottom: 20, pt: 1, zIndex: 1 }, children: _jsx(Button, { variant: "contained", fullWidth: true, disabled: isParsing, onClick: async () => {
                                        setIsParsing(true);
                                        try {
                                            await posOcrRef.current?.triggerParse();
                                        }
                                        finally {
                                            setIsParsing(false);
                                        }
                                    }, startIcon: isParsing ? _jsx(CircularProgress, { size: 20, color: "inherit" }) : _jsx(AutoFixHighIcon, {}), children: isParsing ? 'Parsing...' : 'Parse & Prefill' }) })] })] }), _jsxs(Accordion, { expanded: expanded === 'step2', onChange: handleAccordion('step2'), sx: { mb: 1 }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { sx: { fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }, children: ["Step 2: Day POS Upload", _jsx(Tooltip, { title: "Review extracted data, attach receipts, then save the Z-report", arrow: true, children: _jsx(Box, { component: "span", sx: { cursor: 'help', color: 'text.secondary', fontSize: '0.8rem' }, children: "\u24D8" }) })] }) }), _jsx(AccordionDetails, { children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { select: true, label: "Department", value: department, onChange: (event) => setDepartment(event.target.value), fullWidth: true, children: departments.map((dept) => (_jsx(MenuItem, { value: dept.id, children: dept.label }, dept.id))) }), isFetching ? _jsx(CircularProgress, { size: 24 }) : null, sections.map((section) => (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1 }, children: section.title }), _jsx(Grid, { container: true, spacing: 1.5, children: section.fields.map((field) => (_jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsx(TextField, { label: field.label, type: field.type === 'date' ? 'date'
                                                        : field.type === 'time' ? 'time'
                                                            : field.type === 'datetime' ? 'text'
                                                                : field.type === 'text' ? 'text'
                                                                    : 'number', placeholder: field.type === 'datetime' ? 'DD/MM/YYYY HH:MM:SS' : undefined, value: values[field.key] ?? '', onChange: (event) => handleChange(field.key, event.target.value), required: field.required, error: errors.has(field.key), helperText: errors.has(field.key) ? 'Required' : undefined, slotProps: { inputLabel: { shrink: true } }, sx: {
                                                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                            filter: 'invert(1)',
                                                        },
                                                    }, fullWidth: true }) }, field.key))) })] }, section.id))), _jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(AttachFileIcon, {}), sx: {
                                        position: 'sticky',
                                        bottom: 66,
                                        background: '#0f0f14',
                                        zIndex: 99,
                                    }, children: ["Attach Verification Receipts", _jsx("input", { hidden: true, multiple: true, accept: "image/*", type: "file", onChange: async (event) => {
                                                const files = await readReceiptFiles(event.target.files);
                                                event.target.value = '';
                                                if (!files.length)
                                                    return;
                                                cropStep2Ref.current.push(...files);
                                                processStep2CropQueue();
                                            } })] }), _jsx(ReceiptThumbnails, { images: receiptImages, onRemove: (i) => setReceiptImages((prev) => prev.filter((_, idx) => idx !== i)), onView: (i) => setViewStep2Img({ dataUrl: receiptImages[i].dataUrl, name: receiptImages[i].name }) }), errors.size > 0 ? (_jsx(Typography, { color: "error", variant: "body2", children: "Please fill in all required fields highlighted below." })) : null, _jsx(Box, { sx: { position: 'sticky', bottom: 20, pt: 1, zIndex: 1 }, children: _jsx(Button, { variant: "contained", fullWidth: true, onClick: handleSave, disabled: saveState.isLoading, startIcon: _jsx(SaveIcon, {}), sx: {
                                            position: 'sticky',
                                            bottom: 18,
                                            zIndex: 99,
                                        }, children: saveState.isLoading ? 'Saving...' : 'Save Z-report' }) })] }) })] }), _jsxs(Accordion, { expanded: expanded === 'step3', onChange: handleAccordion('step3'), children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Stack, { direction: "row", sx: { width: '100%', alignItems: 'center', justifyContent: 'space-between', pr: 2 }, children: [_jsxs(Typography, { sx: { fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }, children: ["Step 3: Recent Z-reports", _jsx(Tooltip, { title: "Recently saved Z-reports appear here after submission", arrow: true, children: _jsx(Box, { component: "span", sx: { cursor: 'help', color: 'text.secondary', fontSize: '0.8rem' }, children: "\u24D8" }) })] }), _jsx(Stack, { direction: "row", spacing: 0.5, onClick: (e) => e.stopPropagation(), children: ['list', 'calendar', 'chart'].map((mode) => (_jsx(Button, { size: "small", variant: viewMode === mode ? 'contained' : 'outlined', onClick: () => setViewMode(mode), startIcon: mode === 'list' ? _jsx(ViewListIcon, {}) : mode === 'calendar' ? _jsx(CalendarMonthIcon, {}) : _jsx(BarChartIcon, {}), sx: { textTransform: 'capitalize', fontSize: '0.75rem', py: 0.25 }, children: mode }, mode))) })] }) }), _jsxs(AccordionDetails, { children: [viewMode === 'list' ? _jsx(ZReportListView, { recentRows: recentRows, setZrepDetail: setZrepDetail }) : null, viewMode === 'calendar' ? (_jsx(ZReportCalendarView, { onDayClick: (date) => setZrepDetail({ date, dept: 'all_pos' }) })) : null, viewMode === 'chart' ? _jsx(ZReportChartView, {}) : null] })] }), _jsxs(Dialog, { open: !!zrepDetail, onClose: () => setZrepDetail(null), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { children: ["Z-Report \u2014 ", zrepDetail?.date, " (", zrepDetail?.dept, ")"] }), _jsx(IconButton, { onClick: () => setZrepDetail(null), size: "small", children: "\u2715" })] }), _jsx(DialogContent, { dividers: true, children: zrepLoading ? (_jsx(CircularProgress, { size: 24 })) : zrepDetailData ? (_jsxs(Stack, { spacing: 2, children: [_jsx(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }, children: Object.entries(zrepDetailData)
                                        .filter(([k]) => !['receipt_images', 'id'].includes(k))
                                        .map(([key, value]) => (_jsxs(Box, { sx: { p: 0.5 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block' }, children: key.replace(/_/g, ' ') }), _jsx(Typography, { variant: "body2", children: key.endsWith('_amount') || key.endsWith('_sales') ? formatIdr(value)
                                                    : key === 'report_date' || key === 'period_start' || key === 'period_end' ? String(value ?? '-').slice(0, 19)
                                                        : String(value ?? '-') })] }, key))) }), zrepImages.length > 0 ? (_jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle2", sx: { mb: 1 }, children: ["Receipt Images (", zrepImages.length, ")"] }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1.5 }, children: zrepImages.map((img, i) => (_jsxs(Box, { sx: {
                                                    width: 120,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.8 },
                                                }, onClick: () => setFullscreenImage(img), children: [_jsx("img", { src: imageToDataUrl(img), alt: img.name || `receipt-${i}`, style: { width: '100%', height: 90, objectFit: 'cover', display: 'block' } }), _jsx(Typography, { variant: "caption", noWrap: true, sx: { display: 'block', px: 0.5, py: 0.25, fontSize: '0.6rem' }, children: img.name || `Image ${i + 1}` })] }, i))) })] })) : null] })) : (_jsx(Typography, { color: "text.secondary", children: "No data found." })) })] }), _jsx(ImageViewerModal, { open: !!fullscreenImage, image: fullscreenImage, onClose: () => setFullscreenImage(null) }), _jsx(ZoomableViewer, { open: !!viewStep2Img, imageDataUrl: viewStep2Img?.dataUrl ?? '', imageName: viewStep2Img?.name ?? '', onClose: () => setViewStep2Img(null) }), _jsx(CropModal, { open: !!cropStep2, imageDataUrl: cropStep2?.dataUrl ?? '', imageName: cropStep2?.name ?? '', onCrop: handleStep2CropConfirm, onSkip: handleStep2CropSkip })] }));
}
function ExpenseOcrPanel({ department, onParsed, }) {
    const [images, setImages] = useState([]);
    const [text, setText] = useState('');
    const [scanExpenseReceipt] = useScanExpenseReceiptMutation();
    const [parse, parseState] = useParseExpenseTextMutation();
    const abortRef = useRef(null);
    const [scanProgress, setScanProgress] = useState(null);
    const [viewExpenseImg, setViewExpenseImg] = useState(null);
    const [cropExpense, setCropExpense] = useState(null);
    const cropExpenseRef = useRef([]);
    const processExpenseCropQueue = useCallback(() => {
        const next = cropExpenseRef.current.shift();
        if (next) {
            setCropExpense({ dataUrl: next.dataUrl, name: next.name });
        }
        else {
            setCropExpense(null);
        }
    }, []);
    const handleExpenseCropConfirm = useCallback((croppedDataUrl) => {
        const target = cropExpense;
        if (!target)
            return;
        setImages((prev) => [...prev, {
                dataUrl: croppedDataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processExpenseCropQueue();
    }, [cropExpense, processExpenseCropQueue]);
    const handleExpenseCropSkip = useCallback(() => {
        const target = cropExpense;
        if (!target)
            return;
        setImages((prev) => [...prev, {
                dataUrl: target.dataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processExpenseCropQueue();
    }, [cropExpense, processExpenseCropQueue]);
    const handleScan = async () => {
        setScanProgress({ current: 0, total: images.length, failed: 0, status: 'scanning' });
        const results = [];
        let failed = 0;
        for (let i = 0; i < images.length; i++) {
            if (abortRef.current?.signal.aborted)
                break;
            setScanProgress({ current: i + 1, total: images.length, failed, status: 'scanning' });
            try {
                abortRef.current = new AbortController();
                const result = await scanExpenseReceipt({ images: [images[i].dataUrl] }).unwrap();
                if (result.data?.text)
                    results.push(result.data.text.trim());
            }
            catch (err) {
                if (err.name === 'AbortError')
                    break;
                failed++;
                setScanProgress({ current: i + 1, total: images.length, failed, status: 'scanning' });
            }
        }
        if (!abortRef.current?.signal.aborted) {
            setScanProgress({ current: images.length, total: images.length, failed, status: 'processing' });
            await new Promise((r) => setTimeout(r, 80));
            const joined = results.map((r) => r.trim()).join('\n---\n');
            const cleaned = joined.replace(/\n{3,}/g, '\n\n').trim();
            setText(cleaned);
        }
        abortRef.current = null;
        setScanProgress(null);
    };
    const handleStopScan = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setScanProgress(null);
    };
    const handleParse = async () => {
        const payload = await parse({ text, department, useAi: true }).unwrap();
        const inputs = asRecord(payload.data?.inputs);
        onParsed(Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, String(value ?? '')])));
    };
    return (_jsxs(SectionShell, { title: "Expense Receipt OCR", children: [_jsxs(Stack, { spacing: 2, children: [_jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(AttachFileIcon, {}), children: ["Attach Expense Receipts", _jsx("input", { hidden: true, multiple: true, accept: "image/*", type: "file", onChange: async (event) => {
                                    const files = await readReceiptFiles(event.target.files);
                                    event.target.value = '';
                                    if (!files.length)
                                        return;
                                    cropExpenseRef.current.push(...files);
                                    processExpenseCropQueue();
                                } })] }), _jsx(ReceiptThumbnails, { images: images, onRemove: (i) => setImages((prev) => prev.filter((_, idx) => idx !== i)), onView: (i) => setViewExpenseImg({ dataUrl: images[i].dataUrl, name: images[i].name }) }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, children: [_jsx(Button, { onClick: handleScan, disabled: !images.length || !!scanProgress, variant: "contained", startIcon: _jsx(PhotoCameraIcon, {}), children: scanProgress ? `Scanning ${scanProgress.current}/${scanProgress.total}${scanProgress.failed ? ` (${scanProgress.failed} failed)` : ''}${scanProgress.status === 'processing' ? ' — Processing...' : ''}...` : 'Scan' }), scanProgress ? (_jsx(Button, { onClick: handleStopScan, variant: "outlined", color: "warning", startIcon: _jsx(StopIcon, {}), children: "Stop" })) : null, _jsx(Button, { onClick: handleParse, disabled: !text.trim() || parseState.isLoading, variant: "outlined", startIcon: parseState.isLoading ? _jsx(CircularProgress, { size: 18 }) : _jsx(AutoFixHighIcon, {}), children: "PARSE & PREFILL" })] }), scanProgress ? (_jsx(LinearProgress, { variant: "determinate", value: Math.round((scanProgress.current / scanProgress.total) * 100) })) : null, _jsx(TextField, { label: "Receipt text", value: text, onChange: (event) => setText(event.target.value), multiline: true, minRows: 6, fullWidth: true })] }), _jsx(ZoomableViewer, { open: !!viewExpenseImg, imageDataUrl: viewExpenseImg?.dataUrl ?? '', imageName: viewExpenseImg?.name ?? '', onClose: () => setViewExpenseImg(null) }), _jsx(CropModal, { open: !!cropExpense, imageDataUrl: cropExpense?.dataUrl ?? '', imageName: cropExpense?.name ?? '', onCrop: handleExpenseCropConfirm, onSkip: handleExpenseCropSkip })] }));
}
function CostsPayrollTab() {
    const [period, setPeriod] = useState(currentPeriod());
    const [department, setDepartment] = useState('direct');
    const [actualsSubtab, setActualsSubtab] = useState('submit');
    const [prefillFrom, setPrefillFrom] = useState(priorPeriod(currentPeriod()));
    const [inputs, setInputs] = useState({});
    const [receiptImages, setReceiptImages] = useState([]);
    const [notes, setNotes] = useState('');
    const [prefillMessage, setPrefillMessage] = useState(null);
    const [viewCostsImg, setViewCostsImg] = useState(null);
    const [cropCosts, setCropCosts] = useState(null);
    const cropCostsRef = useRef([]);
    const { data, isFetching } = useGetMonthlyActualsQuery({ period, department });
    const [triggerPrefill, prefillState] = useLazyGetMonthlyActualsQuery();
    const [save, saveState] = useSaveMonthlyActualsMutation();
    const payload = dataFromEnvelope(data);
    const departments = payload?.departments ?? [];
    const fields = payload?.department_detail?.section?.fields ?? [];
    const mergedInputs = useMemo(() => {
        const existing = asRecord(payload?.department_detail?.inputs);
        return { ...existing, ...inputs };
    }, [inputs, payload]);
    const applyPrefillPayload = (prefillPayload) => {
        const deptInputs = asRecord(prefillPayload.department_detail?.inputs);
        const monthInputs = asRecord(prefillPayload.inputs);
        const nextInputs = Object.keys(deptInputs).length ? deptInputs : monthInputs;
        setInputs(Object.fromEntries(Object.entries(nextInputs).map(([key, value]) => [key, String(value ?? '')])));
        if (prefillPayload.department_detail?.notes) {
            setNotes(String(prefillPayload.department_detail.notes));
        }
        const label = prefillPayload.prefill?.prior_label ?? 'source month';
        setPrefillMessage(`Prefilled from ${label}. Review values and save.`);
    };
    const handlePrefill = async (scope) => {
        if (payload?.excel_locked)
            return;
        if (scope === 'dept' && department === 'all') {
            setPrefillMessage('Select a single cost account for Prefill by Account.');
            return;
        }
        const hasValues = Object.values(mergedInputs).some((value) => String(value).trim());
        const replace = hasValues && globalThis.window.confirm(scope === 'month'
            ? 'Replace all cost lines with prefill from source month? Cancel to merge with current values.'
            : 'Replace this account\'s fields with prefill? Cancel to merge.');
        const result = await triggerPrefill({
            period,
            department: scope === 'dept' ? department : undefined,
            prefill: true,
            prefill_from: prefillFrom,
            scope,
            ...(replace ? { prefill_mode: 'replace' } : {}),
        }).unwrap();
        applyPrefillPayload(dataFromEnvelope(result));
    };
    const handleSave = async () => {
        await save({
            period,
            department,
            inputs: buildPayload(mergedInputs),
            receipt_images: receiptImages,
            notes,
        }).unwrap();
        setPrefillMessage(null);
    };
    // --- Costs crop handlers ---
    const processCostsCropQueue = useCallback(() => {
        const next = cropCostsRef.current.shift();
        if (next) {
            setCropCosts({ dataUrl: next.dataUrl, name: next.name });
        }
        else {
            setCropCosts(null);
        }
    }, []);
    const handleCostsCropConfirm = useCallback((croppedDataUrl) => {
        const target = cropCosts;
        if (!target)
            return;
        setReceiptImages((prev) => [...prev, {
                dataUrl: croppedDataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processCostsCropQueue();
    }, [cropCosts, processCostsCropQueue]);
    const handleCostsCropSkip = useCallback(() => {
        const target = cropCosts;
        if (!target)
            return;
        setReceiptImages((prev) => [...prev, {
                dataUrl: target.dataUrl,
                mime: 'image/jpeg',
                name: target.name,
                captured_at: new Date().toISOString(),
            }]);
        processCostsCropQueue();
    }, [cropCosts, processCostsCropQueue]);
    return (_jsxs(_Fragment, { children: [_jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { size: { xs: 12, lg: 7 }, children: _jsx(SectionShell, { title: "Costs & Payroll", children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Grid, { container: true, spacing: 1.5, children: [_jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsx(TextField, { label: "Period", type: "month", value: period, onChange: (event) => {
                                                        const next = event.target.value;
                                                        setPeriod(next);
                                                        setPrefillFrom(priorPeriod(next));
                                                        setInputs({});
                                                        setPrefillMessage(null);
                                                    }, slotProps: { inputLabel: { shrink: true } }, fullWidth: true }) }), _jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsxs(TextField, { select: true, label: "Cost Department", value: department, onChange: (event) => {
                                                        setDepartment(event.target.value);
                                                        setInputs({});
                                                        setPrefillMessage(null);
                                                    }, fullWidth: true, children: [_jsx(MenuItem, { value: "all", children: "All Accounts" }), departments.map((dept) => (_jsx(MenuItem, { value: dept.id, children: dept.label }, dept.id)))] }) })] }), _jsxs(Tabs, { value: actualsSubtab, onChange: (_event, value) => setActualsSubtab(value), variant: "scrollable", scrollButtons: "auto", children: [_jsx(Tab, { value: "submit", label: "Submit Cost" }), _jsx(Tab, { value: "prefill", label: "Prefill Cost" })] }), actualsSubtab === 'prefill' ? (_jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Copy costs from month", type: "month", value: prefillFrom, onChange: (event) => setPrefillFrom(event.target.value), slotProps: { inputLabel: { shrink: true } }, helperText: "Defaults to the month before your target. Pick any month with saved costs.", sx: { maxWidth: 320 } }), _jsx(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, children: department === 'all' ? (_jsx(Button, { variant: "contained", onClick: () => void handlePrefill('month'), disabled: prefillState.isFetching || payload?.excel_locked, startIcon: _jsx(ContentCopyIcon, {}), sx: TOUCH_TARGET_SX, children: prefillState.isFetching ? 'Prefilling…' : 'PREFILL ALL ACCOUNTS' })) : (_jsx(Button, { variant: "outlined", onClick: () => void handlePrefill('dept'), disabled: prefillState.isFetching || payload?.excel_locked, startIcon: _jsx(ContentCopyIcon, {}), sx: TOUCH_TARGET_SX, children: "PREFILL BY ACCOUNT" })) })] })) : null, isFetching ? _jsx(CircularProgress, { size: 24 }) : null, payload?.excel_locked ? (_jsx(Typography, { color: "warning.main", children: "This month is locked to the source Excel ledger." })) : null, prefillMessage ? (_jsx(Typography, { role: "status", color: "success.main", variant: "body2", children: prefillMessage })) : null, prefillState.isError ? (_jsx(Typography, { role: "alert", color: "error.main", variant: "body2", children: "Prefill failed. Check source month and try again." })) : null, _jsx(Grid, { container: true, spacing: 1.5, children: fields.map((field) => (_jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsx(TextField, { label: field.label, type: field.type === 'int' || field.type === 'amount' ? 'number' : 'text', value: String(mergedInputs[field.key] ?? ''), onChange: (event) => setInputs((current) => ({ ...current, [field.key]: event.target.value })), fullWidth: true }) }, field.key))) }), actualsSubtab === 'submit' ? (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Notes", value: notes || payload?.department_detail?.notes || '', onChange: (event) => setNotes(event.target.value), multiline: true, minRows: 2, fullWidth: true }), _jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(AttachFileIcon, {}), sx: TOUCH_TARGET_SX, children: ["Attach Cost Receipts", _jsx("input", { hidden: true, multiple: true, accept: "image/*", type: "file", onChange: async (event) => {
                                                            const files = await readReceiptFiles(event.target.files);
                                                            event.target.value = '';
                                                            if (!files.length)
                                                                return;
                                                            cropCostsRef.current.push(...files);
                                                            processCostsCropQueue();
                                                        } })] }), _jsx(ReceiptThumbnails, { images: receiptImages, onRemove: (i) => setReceiptImages((prev) => prev.filter((_, idx) => idx !== i)), onView: (i) => setViewCostsImg({ dataUrl: receiptImages[i].dataUrl, name: receiptImages[i].name }) })] })) : null, _jsx(Button, { onClick: handleSave, disabled: saveState.isLoading || payload?.excel_locked, variant: "contained", startIcon: _jsx(SaveIcon, {}), sx: TOUCH_TARGET_SX, children: saveState.isLoading ? 'Saving...' : actualsSubtab === 'prefill' ? 'Save & Sync' : 'Save Monthly Actuals' }), saveState.isSuccess ? _jsx(Typography, { role: "status", color: "success.main", children: "Monthly actuals saved." }) : null, payload?.computed_preview ? (_jsx(Stack, { direction: "row", sx: { flexWrap: 'wrap', gap: 1 }, children: Object.entries(payload.computed_preview).slice(0, 6).map(([key, value]) => (_jsx(Chip, { label: `${key.replaceAll('_', ' ')}: ${formatIdr(value)}` }, key))) })) : null] }) }) }), _jsx(Grid, { size: { xs: 12, lg: 5 }, children: actualsSubtab === 'submit' ? (_jsx(ExpenseOcrPanel, { department: department, onParsed: (parsed) => setInputs((current) => ({ ...current, ...parsed })) })) : (_jsx(SectionShell, { title: "Prefill Notes", children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Prefill copies saved or Excel-sourced costs from another month into the fields on the left. Review totals, then save to sync Ops Tracking." }) })) })] }), _jsx(ZoomableViewer, { open: !!viewCostsImg, imageDataUrl: viewCostsImg?.dataUrl ?? '', imageName: viewCostsImg?.name ?? '', onClose: () => setViewCostsImg(null) }), _jsx(CropModal, { open: !!cropCosts, imageDataUrl: cropCosts?.dataUrl ?? '', imageName: cropCosts?.name ?? '', onCrop: handleCostsCropConfirm, onSkip: handleCostsCropSkip })] }));
}
function FillMissingTab() {
    const [period, setPeriod] = useState(currentPeriod());
    const [parsedRows, setParsedRows] = useState([]);
    const [importPreview, setImportPreview] = useState(null);
    const [importMessage, setImportMessage] = useState(null);
    const [monthlyTotals, setMonthlyTotals] = useState({});
    const { data, isFetching } = useGetCalendarQuery(period);
    const calendar = dataFromEnvelope(data);
    const [importMetrics, importState] = useImportMetricsMutation();
    const [deleteZReport, deleteState] = useDeleteZReportMutation();
    const handleXlsx = async (file) => {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ''];
        if (!sheet)
            return;
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        setParsedRows(rows);
        setImportPreview(null);
        setImportMessage('File loaded. Click Preview to validate rows before import.');
    };
    const handlePreview = () => {
        if (!parsedRows.length) {
            setImportMessage('Choose an XLSX file first.');
            setImportPreview(null);
            return;
        }
        const preview = buildImportPreview(period, parsedRows);
        if (!preview) {
            setImportMessage('No importable rows found. Ensure report date, nett sales, and covers are filled.');
            setImportPreview(null);
            return;
        }
        setImportPreview(preview);
        setImportMessage(`Preview: ${preview.summary} (${preview.mode})`);
    };
    const handleRunImport = async () => {
        if (!importPreview) {
            handlePreview();
            return;
        }
        if (!globalThis.window.confirm(`Import ${importPreview.summary}?`))
            return;
        if (importPreview.mode === 'monthly_prorate') {
            await importMetrics({
                mode: 'monthly_prorate',
                period: importPreview.period,
                monthly: importPreview.monthly,
                fill_missing_only: true,
            }).unwrap();
        }
        else {
            await importMetrics({
                mode: 'daily',
                rows: importPreview.rows,
                fill_missing_only: true,
            }).unwrap();
        }
        setImportMessage('Import completed.');
        setImportPreview(null);
        setParsedRows([]);
    };
    const handleExportTemplate = async () => {
        const XLSX = await import('xlsx');
        const TEMPLATE_KEYS = [...Z_REPORT_FIELD_KEYS, 'department', 'raw_text'];
        const emptyRow = Object.fromEntries(TEMPLATE_KEYS.map((k) => [k, '']));
        const rows = (calendar?.missing ?? []).map((date) => ({
            ...emptyRow,
            report_date: date,
            department: 'all_pos',
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'missing-days');
        XLSX.writeFile(workbook, `redruby-missing-${period}.xlsx`);
    };
    const previewRows = importPreview?.mode === 'daily'
        ? (importPreview.rows ?? []).slice(0, 12)
        : [];
    return (_jsx(SectionShell, { title: "Fill Missing Days", children: _jsxs(Stack, { spacing: 2.5, children: [_jsx(TextField, { label: "Period", type: "month", value: period, onChange: (event) => {
                        setPeriod(event.target.value);
                        setImportPreview(null);
                    }, slotProps: { inputLabel: { shrink: true } }, sx: { maxWidth: 260 } }), isFetching ? _jsx(CircularProgress, { size: 24 }) : null, _jsxs(Stack, { direction: "row", sx: { flexWrap: 'wrap', gap: 1 }, children: [_jsx(Chip, { label: `Filled: ${calendar?.filled?.length ?? 0}` }), _jsx(Chip, { label: `Missing: ${calendar?.missing?.length ?? 0}`, color: (calendar?.missing?.length ?? 0) ? 'warning' : 'success' }), _jsx(Chip, { label: `Manual: ${calendar?.manual_count ?? 0}` }), _jsx(Chip, { label: `Imported: ${calendar?.imported_count ?? 0}` })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Upload a completed template, preview parsed rows, then confirm import to save missing days." }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, children: [_jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(UploadFileIcon, {}), sx: TOUCH_TARGET_SX, children: ["Load XLSX Daily Rows", _jsx("input", { hidden: true, accept: ".xlsx,.xls,.csv", type: "file", onChange: (event) => {
                                        const file = event.target.files?.[0];
                                        if (file)
                                            void handleXlsx(file);
                                    } })] }), _jsx(Button, { onClick: handleExportTemplate, variant: "outlined", disabled: !calendar?.missing?.length, startIcon: _jsx(DownloadIcon, {}), sx: TOUCH_TARGET_SX, children: "Export Missing Template" }), _jsx(Button, { onClick: handlePreview, disabled: !parsedRows.length, variant: "outlined", startIcon: _jsx(VisibilityIcon, {}), sx: TOUCH_TARGET_SX, children: "Preview" }), _jsx(Button, { onClick: () => void handleRunImport(), disabled: !importPreview || importState.isLoading, variant: "contained", startIcon: _jsx(FileDownloadDoneIcon, {}), sx: TOUCH_TARGET_SX, children: importState.isLoading ? 'Importing…' : 'Run Import' })] }), importMessage ? (_jsx(Typography, { role: "status", color: importPreview || importMessage.startsWith('Preview:') || importMessage.includes('completed') ? 'success.main' : 'text.secondary', variant: "body2", children: importMessage })) : null, importPreview ? (_jsxs(Paper, { variant: "outlined", sx: { p: 2, bgcolor: 'rgba(255,255,255,0.02)' }, children: [_jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1 }, children: ["Import preview \u2014 ", importPreview.summary] }), importPreview.mode === 'monthly_prorate' ? (_jsx(Stack, { direction: "row", sx: { flexWrap: 'wrap', gap: 1 }, children: Object.entries(importPreview.monthly ?? {}).map(([key, value]) => (_jsx(Chip, { label: `${key.replaceAll('_', ' ')}: ${value}`, size: "small" }, key))) })) : (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Date" }), _jsx(TableCell, { children: "Nett Sales" }), _jsx(TableCell, { children: "Covers" }), _jsx(TableCell, { children: "Bills" })] }) }), _jsx(TableBody, { children: previewRows.map((row, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: String(row.report_date ?? row.date ?? '').slice(0, 10) }), _jsx(TableCell, { children: String(row.nett_sales ?? row.total_sales ?? '') }), _jsx(TableCell, { children: String(row.total_covers ?? '') }), _jsx(TableCell, { children: String(row.total_bills ?? '') })] }, `${String(row.report_date ?? row.date)}-${index}`))) })] })), (importPreview.rows?.length ?? 0) > previewRows.length ? (_jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 1, display: 'block' }, children: ["Showing ", previewRows.length, " of ", importPreview.rows?.length, " rows."] })) : null] })) : null, _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: "Monthly prorate fallback" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Enter monthly totals for any numeric fields below. Values are split evenly across missing days." }), _jsx(Grid, { container: true, spacing: 1.5, children: ['nett_sales', 'total_covers', 'total_bills', 'gofood_amount', 'dine_in_amount'].map((key) => (_jsx(Grid, { size: { xs: 12, sm: 6, md: 4 }, children: _jsx(TextField, { label: key.replaceAll('_', ' '), type: "number", value: monthlyTotals[key] ?? '', onChange: (event) => setMonthlyTotals((current) => ({ ...current, [key]: event.target.value })), fullWidth: true }) }, key))) }), _jsxs(Accordion, { sx: { mt: 1 }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { variant: "body2", children: ["All prorate fields (", PRORATE_KEYS.length, ")"] }) }), _jsx(AccordionDetails, { children: _jsx(Grid, { container: true, spacing: 1.5, children: PRORATE_KEYS.filter((k) => !['nett_sales', 'total_covers', 'total_bills', 'gofood_amount', 'dine_in_amount'].includes(k)).map((key) => (_jsx(Grid, { size: { xs: 12, sm: 6, md: 4 }, children: _jsx(TextField, { label: key.replaceAll('_', ' '), type: "number", value: monthlyTotals[key] ?? '', onChange: (event) => setMonthlyTotals((current) => ({ ...current, [key]: event.target.value })), fullWidth: true }) }, key))) }) })] }), _jsx(Button, { onClick: () => importMetrics({
                        mode: 'monthly_prorate',
                        period,
                        monthly: buildPayload(monthlyTotals),
                        fill_missing_only: true,
                    }), disabled: importState.isLoading, variant: "outlined", startIcon: _jsx(CallSplitIcon, {}), sx: TOUCH_TARGET_SX, children: "Prorate Monthly Totals Across Missing Days" }), _jsx(Divider, {}), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: "Missing dates" }), _jsx(Stack, { direction: "row", sx: { flexWrap: 'wrap', gap: 1 }, children: (calendar?.missing ?? []).map((date) => _jsx(Chip, { label: date, size: "small" }, date)) }), _jsx(Button, { color: "warning", variant: "outlined", disabled: deleteState.isLoading, startIcon: _jsx(DeleteIcon, {}), sx: TOUCH_TARGET_SX, onClick: () => {
                        if (globalThis.window.confirm(`Delete imported rows for ${period}? Manual entries are preserved.`)) {
                            void deleteZReport({ period, scope: 'imported' });
                        }
                    }, children: "Delete Imported Rows for Month" })] }) }));
}
/** Image viewer with mouse-wheel zoom, pan, and zoom controls.
 *  Works with a raw dataUrl (ReceiptImagePayload) rather than the DB ReceiptImage type. */
function ZoomableViewer({ open, imageDataUrl, imageName, onClose, }) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef(null);
    // Reset zoom when modal opens/closes
    useEffect(() => {
        if (open) {
            setScale(1);
            setOffset({ x: 0, y: 0 });
        }
    }, [open]);
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = -Math.sign(e.deltaY) * 0.15;
        setScale((prev) => Math.max(0.25, Math.min(8, +(prev + delta).toFixed(2))));
    }, []);
    const handleMouseDown = useCallback((e) => {
        if (scale <= 1)
            return;
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }, [scale, offset]);
    const handleMouseMove = useCallback((e) => {
        if (!isPanning)
            return;
        setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }, [isPanning, panStart]);
    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);
    const zoomIn = useCallback(() => setScale((prev) => Math.min(8, +(prev + 0.25).toFixed(2))), []);
    const zoomOut = useCallback(() => setScale((prev) => Math.max(0.25, +(prev - 0.25).toFixed(2))), []);
    const resetZoom = useCallback(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, []);
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "xl", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "body2", noWrap: true, sx: { maxWidth: '60%' }, children: imageName || 'Receipt' }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mr: 0.5 }, children: [Math.round(scale * 100), "%"] }), _jsx(IconButton, { onClick: zoomOut, size: "small", title: "Zoom out", children: _jsx(ZoomOutIcon, { fontSize: "small" }) }), _jsx(IconButton, { onClick: zoomIn, size: "small", title: "Zoom in", children: _jsx(ZoomInIcon, { fontSize: "small" }) }), scale !== 1 ? (_jsx(IconButton, { onClick: resetZoom, size: "small", title: "Reset zoom", children: _jsx(RefreshIcon, { fontSize: "small" }) })) : null, _jsx(IconButton, { onClick: onClose, size: "small", children: "\u2715" })] })] }), _jsxs(DialogContent, { sx: {
                    p: 0,
                    bgcolor: '#000',
                    overflow: 'hidden',
                    cursor: scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                    position: 'relative',
                }, onWheel: handleWheel, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp, children: [_jsx(Box, { sx: {
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '70vh',
                            width: '100%',
                            height: '100%',
                            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                            transformOrigin: 'center center',
                            transition: isPanning ? 'none' : 'transform 0.15s ease',
                            pointerEvents: scale <= 1 ? 'none' : 'auto',
                        }, children: _jsx("img", { ref: imgRef, src: imageDataUrl, alt: imageName || 'receipt', draggable: false, style: { maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' } }) }), scale <= 1 ? (_jsx(Typography, { sx: {
                            position: 'absolute',
                            bottom: 16,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.75rem',
                            pointerEvents: 'none',
                        }, children: "Scroll to zoom \u00B7 Drag to pan when zoomed in" })) : null] })] }));
}
/** Full-screen image viewer overlay */
function ImageViewerModal({ open, image, onClose, }) {
    if (!image)
        return null;
    const src = imageToDataUrl(image);
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "xl", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "body2", noWrap: true, sx: { maxWidth: '80%' }, children: image.name || 'Receipt' }), _jsx(IconButton, { onClick: onClose, size: "small", children: "\u2715" })] }), _jsx(DialogContent, { sx: { p: 0, textAlign: 'center', bgcolor: '#000' }, children: _jsx("img", { src: src, alt: image.name || 'receipt', style: { maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' } }) })] }));
}
function RecentEntries() {
    const { data: metricsPayload } = useListMetricsQuery({ page: 1, limit: 8 });
    const { data: actualsPayload } = useGetMonthlyActualsQuery({ period: currentPeriod(), recent: true, page: 1, limit: 8 });
    const [deleteZReport] = useDeleteZReportMutation();
    const metricsRows = asRecord(metricsPayload).rows;
    const actualsData = dataFromEnvelope(actualsPayload);
    // Detail modal state
    const [zrepDetail, setZrepDetail] = useState(null);
    const [actualsDetail, setActualsDetail] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const { data: zrepDetailPayload, isFetching: zrepLoading } = useGetDetailQuery({ date: zrepDetail?.date ?? '', department: zrepDetail?.dept ?? 'all_pos' }, { skip: !zrepDetail });
    const zrepDetailData = dataFromEnvelope(zrepDetailPayload);
    const zrepImages = (Array.isArray(zrepDetailData?.receipt_images) ? zrepDetailData?.receipt_images : []);
    const { data: actualsDetailPayload, isFetching: actualsLoading } = useGetMonthlyActualsQuery({ period: actualsDetail?.period ?? '', department: actualsDetail?.dept ?? '' }, { skip: !actualsDetail });
    const actualsDetailData = dataFromEnvelope(actualsDetailPayload);
    const deptDetail = (actualsDetailData?.department_detail ?? actualsDetailData);
    const actualsImages = (Array.isArray(deptDetail?.receipt_images) ? deptDetail.receipt_images : []);
    return (_jsxs(_Fragment, { children: [_jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { size: { xs: 12, lg: 7 }, children: _jsx(SectionShell, { title: "Recent Z-reports", children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Date" }), _jsx(TableCell, { children: "Dept" }), _jsx(TableCell, { children: "Nett Sales" }), _jsx(TableCell, { children: "Covers" }), _jsx(TableCell, { children: "Receipts" }), _jsx(TableCell, {})] }) }), _jsx(TableBody, { children: (metricsRows ?? []).map((row) => {
                                            const date = row.report_date ?? row.date ?? '';
                                            return (_jsxs(TableRow, { hover: true, sx: { cursor: 'pointer' }, onClick: () => setZrepDetail({ date: String(date), dept: String(row.department ?? 'all_pos') }), children: [_jsx(TableCell, { children: date }), _jsx(TableCell, { children: row.department ?? 'all_pos' }), _jsx(TableCell, { children: formatIdr(row.nett_sales) }), _jsx(TableCell, { children: row.total_covers ?? '-' }), _jsx(TableCell, { children: row.receipt_image_count ?? 0 }), _jsx(TableCell, { children: _jsx(Button, { size: "small", color: "error", startIcon: _jsx(DeleteIcon, {}), onClick: (e) => {
                                                                e.stopPropagation();
                                                                if (globalThis.window.confirm(`Delete Z-report for ${date}?`)) {
                                                                    void deleteZReport({ report_date: date });
                                                                }
                                                            }, children: "Delete" }) })] }, `${date}-${row.department ?? 'all'}`));
                                        }) })] }) }) }), _jsx(Grid, { size: { xs: 12, lg: 5 }, children: _jsx(SectionShell, { title: "Recent Actuals", children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Period" }), _jsx(TableCell, { children: "Scope" }), _jsx(TableCell, { children: "Total" }), _jsx(TableCell, { children: "Receipts" })] }) }), _jsx(TableBody, { children: (actualsData?.rows ?? []).map((row, index) => (_jsxs(TableRow, { hover: true, sx: { cursor: 'pointer' }, onClick: () => setActualsDetail({ period: String(row.period), dept: String(row.department_label ?? row.kind) }), children: [_jsx(TableCell, { children: row.period }), _jsx(TableCell, { children: row.department_label ?? row.kind }), _jsx(TableCell, { children: formatIdr(row.input_total) }), _jsx(TableCell, { children: row.receipt_count ?? 0 })] }, `${row.period}-${row.department_label}-${index}`))) })] }) }) })] }), _jsxs(Dialog, { open: !!zrepDetail, onClose: () => setZrepDetail(null), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { children: ["Z-Report \u2014 ", zrepDetail?.date, " (", zrepDetail?.dept, ")"] }), _jsx(IconButton, { onClick: () => setZrepDetail(null), size: "small", children: "\u2715" })] }), _jsx(DialogContent, { dividers: true, children: zrepLoading ? (_jsx(CircularProgress, { size: 24 })) : zrepDetailData ? (_jsxs(Stack, { spacing: 2, children: [_jsx(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }, children: Object.entries(zrepDetailData)
                                        .filter(([k]) => !['receipt_images', 'id'].includes(k))
                                        .map(([key, value]) => (_jsxs(Box, { sx: { p: 0.5 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block' }, children: key.replace(/_/g, ' ') }), _jsx(Typography, { variant: "body2", children: key.endsWith('_amount') || key.endsWith('_sales') ? formatIdr(value)
                                                    : key === 'report_date' || key === 'period_start' || key === 'period_end' ? String(value ?? '-').slice(0, 19)
                                                        : String(value ?? '-') })] }, key))) }), zrepImages.length > 0 ? (_jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle2", sx: { mb: 1 }, children: ["Receipt Images (", zrepImages.length, ")"] }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1.5 }, children: zrepImages.map((img, i) => (_jsxs(Box, { sx: {
                                                    width: 120,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.8 },
                                                }, onClick: () => setFullscreenImage(img), children: [_jsx("img", { src: imageToDataUrl(img), alt: img.name || `receipt-${i}`, style: { width: '100%', height: 90, objectFit: 'cover', display: 'block' } }), _jsx(Typography, { variant: "caption", noWrap: true, sx: { display: 'block', px: 0.5, py: 0.25, fontSize: '0.6rem' }, children: img.name || `Image ${i + 1}` })] }, i))) })] })) : null] })) : (_jsx(Typography, { color: "text.secondary", children: "No data found." })) })] }), _jsxs(Dialog, { open: !!actualsDetail, onClose: () => setActualsDetail(null), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { children: ["Actuals \u2014 ", actualsDetail?.period, " (", actualsDetail?.dept, ")"] }), _jsx(IconButton, { onClick: () => setActualsDetail(null), size: "small", children: "\u2715" })] }), _jsx(DialogContent, { dividers: true, children: actualsLoading ? (_jsx(CircularProgress, { size: 24 })) : actualsDetailData ? (_jsxs(Stack, { spacing: 2, children: [_jsx(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }, children: Object.entries((deptDetail?.inputs ?? {}))
                                        .filter(([, v]) => v != null && v !== '' && v !== 0)
                                        .map(([key, value]) => (_jsxs(Box, { sx: { p: 0.5 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block' }, children: key.replace(/_/g, ' ') }), _jsx(Typography, { variant: "body2", children: formatIdr(value) })] }, key))) }), actualsImages.length > 0 ? (_jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle2", sx: { mb: 1 }, children: ["Receipt Images (", actualsImages.length, ")"] }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1.5 }, children: actualsImages.map((img, i) => (_jsxs(Box, { sx: {
                                                    width: 120,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.8 },
                                                }, onClick: () => setFullscreenImage(img), children: [_jsx("img", { src: imageToDataUrl(img), alt: img.name || `receipt-${i}`, style: { width: '100%', height: 90, objectFit: 'cover', display: 'block' } }), _jsx(Typography, { variant: "caption", noWrap: true, sx: { display: 'block', px: 0.5, py: 0.25, fontSize: '0.6rem' }, children: img.name || `Image ${i + 1}` })] }, i))) })] })) : null] })) : (_jsx(Typography, { color: "text.secondary", children: "No data found." })) })] }), _jsx(ImageViewerModal, { open: !!fullscreenImage, image: fullscreenImage, onClose: () => setFullscreenImage(null) })] }));
}
export function OpsAdminTabs({ initialTab = 'day-pos' }) {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector((s) => s.ui.activeTab);
    const tab = (['day-pos', 'costs-payroll', 'fill-missing', 'recent'].includes(activeTab)
        ? activeTab
        : initialTab);
    const handleTabChange = (_event, value) => {
        dispatch(setActiveTab(value));
    };
    return (_jsx(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 4 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "overline", color: "primary.main", sx: { fontWeight: 700 }, children: "Ops Admin" }), _jsx(Typography, { variant: "h4", component: "h1", sx: { fontWeight: 800 }, children: "Daily POS, Costs, and Missing Days" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "PIN or Google session required. Data writes use the JWT cookie tier, not client-side admin keys." })] }), _jsx(Paper, { elevation: 0, sx: {
                        position: 'sticky',
                        top: 64,
                        zIndex: 89,
                        borderRadius: 0,
                        border: '0px solid',
                        borderColor: 'divider',
                        bgcolor: '#121217',
                        backgroundFilter: 'blur(0px)'
                    }, children: _jsxs(Tabs, { value: tab, onChange: handleTabChange, variant: "scrollable", scrollButtons: "auto", children: [_jsx(Tab, { value: "day-pos", label: "Day POS" }), _jsx(Tab, { value: "costs-payroll", label: "Costs & Payroll" }), _jsx(Tab, { value: "fill-missing", label: "Fill Missing Days" }), _jsx(Tab, { value: "recent", label: "Recent Entries" })] }) }), tab === 'day-pos' ? _jsx(DayPosTab, {}) : null, tab === 'costs-payroll' ? _jsx(CostsPayrollTab, {}) : null, tab === 'fill-missing' ? _jsx(FillMissingTab, {}) : null, tab === 'recent' ? _jsx(RecentEntries, {}) : null] }) }));
}
