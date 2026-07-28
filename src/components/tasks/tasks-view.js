'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useListTasksQuery, useUpdateTaskStatusMutation, } from '@/store/apis/tasks-api';
import { useAppSelector } from '@/store/hooks';
const STATUS_LABEL = {
    pending: 'Pending',
    in_progress: 'In progress',
    submitted: 'Submitted',
    completed: 'Completed',
};
const STATUS_COLOR = {
    pending: 'default',
    in_progress: 'warning',
    submitted: 'info',
    completed: 'success',
};
/** All statuses in the order they appear in the admin status menu. */
const ALL_STATUSES = ['pending', 'in_progress', 'submitted', 'completed'];
const PRIORITY_COLOR = {
    P0: 'error',
    P1: 'warning',
    P2: 'info',
};
function isOverdue(task) {
    if (!task.dueDate || task.status === 'completed')
        return false;
    return new Date(task.dueDate).getTime() < Date.now();
}
/** Format an ISO date as DD/MM/YYYY (business standard for this project). */
function formatDueDate(iso) {
    if (!iso)
        return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return null;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}
function nextStatus(status) {
    if (status === 'pending')
        return 'in_progress';
    if (status === 'in_progress')
        return 'completed';
    return 'pending';
}
export function TasksView({ forcedRole } = {}) {
    const router = useRouter();
    const { tier } = useAppSelector((s) => s.auth);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusMenu, setStatusMenu] = useState(null);
    // When a dedicated role route is used, lock the view to that role.
    const lockedRole = forcedRole ?? null;
    const queryRole = lockedRole ?? selectedRole;
    const { data, isLoading, isError, refetch } = useListTasksQuery(queryRole ? { role: queryRole } : undefined);
    const [updateStatus, { isLoading: isUpdating }] = useUpdateTaskStatusMutation();
    const tasks = data?.success ? data.data.tasks : [];
    const isPlatformAdmin = data?.success ? data.data.isPlatformAdmin : tier === 'pin';
    const viewerRole = data?.success ? data.data.viewerRole : null;
    // For non-admins, the API already scopes to their role; for admins, allow role switching.
    const effectiveRole = lockedRole ?? (isPlatformAdmin ? selectedRole : viewerRole);
    const overdueCount = useMemo(() => tasks.filter((t) => isOverdue(t)).length, [tasks]);
    const pendingCount = useMemo(() => tasks.filter((t) => t.status !== 'completed').length, [tasks]);
    const handleToggle = async (task) => {
        await updateStatus({ id: task.id, status: nextStatus(task.status) }).unwrap();
    };
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 8 }, children: _jsx(CircularProgress, {}) }));
    }
    if (isError) {
        return (_jsx(Alert, { severity: "error", sx: { my: 2 }, children: "Failed to load tasks." }));
    }
    return (_jsxs(Box, { sx: { mx: 'auto', px: 3, py: 3 }, children: [_jsxs(Stack, { direction: "row", sx: { mb: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 800 }, children: "Exit-Viability Tasks" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: effectiveRole
                                    ? `Checklist for ${effectiveRole}`
                                    : 'All tracked actions from the MVP Business Review' })] }), isPlatformAdmin && !lockedRole ? (_jsxs(FormControl, { size: "small", sx: { minWidth: 180 }, children: [_jsx(InputLabel, { id: "role-select-label", children: "View role" }), _jsxs(Select, { labelId: "role-select-label", label: "View role", value: selectedRole ?? '', onChange: (e) => setSelectedRole(e.target.value || null), children: [_jsx(MenuItem, { value: "", children: "All roles (admin)" }), ['Graham', 'Ama', 'Made', 'Lukas', 'James'].map((code) => (_jsx(MenuItem, { value: code, children: code }, code)))] })] })) : null] }), overdueCount > 0 ? (_jsxs(Alert, { severity: "warning", sx: { mb: 2 }, children: [overdueCount, " task", overdueCount > 1 ? 's are' : ' is', " past due date."] })) : null, _jsxs(Stack, { direction: "row", spacing: 1, sx: { mb: 2, flexWrap: 'wrap' }, useFlexGap: true, children: [_jsx(Chip, { label: `${pendingCount} open`, color: "primary", variant: "outlined" }), _jsx(Chip, { label: `${tasks.length - pendingCount} done`, color: "success", variant: "outlined" }), effectiveRole ? (_jsx(Chip, { label: `Role: ${effectiveRole}`, size: "small" })) : null] }), tasks.length === 0 ? (_jsx(Paper, { variant: "outlined", sx: { p: 4, textAlign: 'center' }, children: _jsxs(Typography, { color: "text.secondary", children: ["No tasks assigned", selectedRole ? ` to ${selectedRole}` : '', " yet. Run a source reseed to populate them."] }) })) : (_jsx(Stack, { spacing: 1.5, children: tasks.map((task) => (_jsx(Paper, { variant: "outlined", onClick: () => setSelectedTask(task), sx: {
                        p: 2,
                        cursor: 'pointer',
                        borderLeft: `4px solid`,
                        borderLeftColor: isOverdue(task)
                            ? 'error.main'
                            : task.status === 'completed'
                                ? 'success.main'
                                : 'divider',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                    }, children: _jsxs(Stack, { direction: "row", sx: { alignItems: 'flex-start' }, spacing: 2, children: [_jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                            fontWeight: 600,
                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                        }, children: task.title }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { mt: 0.5, flexWrap: 'wrap' }, useFlexGap: true, children: [_jsx(Chip, { label: task.priority, size: "small", color: PRIORITY_COLOR[task.priority] }), _jsx(Chip, { label: STATUS_LABEL[task.status], size: "small", color: STATUS_COLOR[task.status], variant: "outlined" }), task.dueDate ? (_jsx(Chip, { label: `Due ${formatDueDate(task.dueDate)}`, size: "small", color: isOverdue(task) ? 'error' : 'default', variant: "outlined" })) : null, task.assignments.map((a) => (_jsx(Chip, { label: a.roleCode, size: "small", variant: "outlined" }, a.roleCode)))] })] }), isPlatformAdmin ? (_jsxs(_Fragment, { children: [_jsx(IconButton, { size: "small", "aria-label": "Set status", disabled: isUpdating, onClick: (e) => {
                                            e.stopPropagation();
                                            setStatusMenu({ id: task.id, el: e.currentTarget });
                                        }, children: _jsx(MoreVertIcon, {}) }), _jsx(Menu, { anchorEl: statusMenu?.el, open: statusMenu?.id === task.id, onClose: () => setStatusMenu(null), onClick: (e) => e.stopPropagation(), children: ALL_STATUSES.map((s) => (_jsx(MenuItem, { selected: task.status === s, disabled: isUpdating, onClick: () => {
                                                setStatusMenu(null);
                                                void updateStatus({ id: task.id, status: s });
                                            }, children: STATUS_LABEL[s] }, s))) })] })) : (_jsx(Button, { variant: "outlined", size: "small", disabled: isUpdating, onClick: (e) => {
                                    e.stopPropagation();
                                    void handleToggle(task);
                                }, children: task.status === 'completed' ? 'Reopen' : 'Continue' }))] }) }, task.id))) })), isPlatformAdmin ? (_jsx(AdminDashboard, { tasks: tasks, onRefresh: refetch, onSetStatus: (id, status) => void updateStatus({ id, status }), isUpdating: isUpdating })) : null, _jsx(TaskDetailModal, { task: selectedTask, onClose: () => setSelectedTask(null), onAskAi: (task) => {
                    const prompt = buildAskAiPrompt(task);
                    router.push(`/ops-chat?prompt=${encodeURIComponent(prompt)}`);
                }, onAdvance: (task) => void handleToggle(task), onUpdateDueDate: (task, dueDate) => void updateStatus({ id: task.id, dueDate }), isUpdating: isUpdating, isPlatformAdmin: isPlatformAdmin })] }));
}
function buildAskAiPrompt(task) {
    const owners = task.assignments.map((a) => a.roleCode).join(' + ') || 'the team';
    return `Explain the exit-viability task "${task.title}" assigned to ${owners} (priority ${task.priority}). What is the goal, why it matters for the business sale, and the concrete steps to complete it? Reference the latest Business Review context.`;
}
function TaskDetailModal({ task, onClose, onAskAi, onAdvance, onUpdateDueDate, isUpdating, isPlatformAdmin, }) {
    const [dueDateInput, setDueDateInput] = useState('');
    const [dueDateDirty, setDueDateDirty] = useState(false);
    // Sync the editable date field whenever the selected task changes.
    useEffect(() => {
        if (task?.dueDate) {
            const d = new Date(task.dueDate);
            setDueDateInput(d.toISOString().slice(0, 10));
        }
        else {
            setDueDateInput('');
        }
        setDueDateDirty(false);
    }, [task]);
    const steps = useMemo(() => {
        if (!task?.description)
            return [];
        const match = task.description.match(/Steps:\n([\s\S]+)$/);
        if (!match)
            return [];
        return match[1]
            .split('\n')
            .map((line) => line.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean);
    }, [task]);
    const summary = task?.description?.split('\n\nSteps:')[0] ?? null;
    return (_jsxs(Dialog, { open: Boolean(task), onClose: onClose, maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { fontWeight: 700 }, children: [task?.title, _jsx(Stack, { direction: "row", spacing: 1, sx: { mt: 1, flexWrap: 'wrap' }, useFlexGap: true, children: task ? (_jsxs(_Fragment, { children: [_jsx(Chip, { label: task.priority, size: "small", color: PRIORITY_COLOR[task.priority] }), _jsx(Chip, { label: STATUS_LABEL[task.status], size: "small", color: STATUS_COLOR[task.status], variant: "outlined" }), task.dueDate ? (_jsx(Chip, { label: `Due ${formatDueDate(task.dueDate)}`, size: "small", variant: "outlined" })) : null, task.assignments.map((a) => (_jsx(Chip, { label: a.roleCode, size: "small", variant: "outlined" }, a.roleCode)))] })) : null })] }), _jsxs(DialogContent, { dividers: true, children: [summary ? (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { whiteSpace: 'pre-wrap', mb: 2 }, children: summary })) : (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "No detailed instructions available for this task yet." })), steps.length > 0 ? (_jsxs(_Fragment, { children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1 }, children: "Step-by-step instructions" }), _jsx(List, { dense: true, disablePadding: true, children: steps.map((step, i) => (_jsx(ListItem, { sx: { px: 0, alignItems: 'flex-start' }, children: _jsx(ListItemText, { primary: _jsx(Typography, { variant: "body2", component: "span", children: `${i + 1}. ${step}` }) }) }, i))) })] })) : null, isPlatformAdmin && task ? (_jsxs(_Fragment, { children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1 }, children: "Due date (platform admin)" }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { type: "date", size: "small", value: dueDateInput, onChange: (e) => {
                                            setDueDateInput(e.target.value);
                                            setDueDateDirty(true);
                                        }, slotProps: { inputLabel: { shrink: true } }, sx: {
                                            flex: 1,
                                            '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                filter: 'invert(1)',
                                            },
                                        } }), _jsx(Button, { variant: "outlined", size: "small", disabled: !dueDateDirty || isUpdating, onClick: () => {
                                            void onUpdateDueDate(task, dueDateInput || null);
                                            setDueDateDirty(false);
                                        }, children: "Save" })] }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Format DD/MM/YYYY. The whole exit process should complete by 03/08/2026." })] })) : null] }), _jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [_jsx(Button, { onClick: onClose, children: "Close" }), task ? (_jsx(Button, { variant: "outlined", disabled: isUpdating, onClick: () => onAdvance(task), children: task.status === 'completed' ? 'Reopen' : 'Continue' })) : null, _jsx(Button, { variant: "contained", startIcon: _jsx(SmartToyIcon, {}), disabled: !task, onClick: () => task && onAskAi(task), children: "Ask AI" })] })] }));
}
function AdminDashboard({ tasks, onRefresh, onSetStatus, isUpdating, }) {
    const roles = ['Graham', 'Ama', 'Made', 'Lukas', 'James'];
    const [rowMenu, setRowMenu] = useState(null);
    const matrix = useMemo(() => {
        return roles.map((role) => {
            const roleTasks = tasks.filter((t) => t.assignments.some((a) => a.assigned && a.roleCode === role));
            const completed = roleTasks.filter((t) => t.status === 'completed').length;
            const inProgress = roleTasks.filter((t) => t.status === 'in_progress').length;
            const pending = roleTasks.filter((t) => t.status === 'pending').length;
            const overdue = roleTasks.filter((t) => isOverdue(t)).length;
            return { role, total: roleTasks.length, completed, inProgress, pending, overdue };
        });
    }, [tasks]);
    const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.sortOrder - b.sortOrder), [tasks]);
    return (_jsxs(Paper, { variant: "outlined", sx: { p: 2, mt: 4 }, children: [_jsxs(Stack, { direction: "row", sx: { mb: 1, alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Platform-admin dashboard \u2014 all roles" }), _jsx(Button, { size: "small", variant: "text", onClick: onRefresh, children: "Refresh" })] }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Role" }), _jsx(TableCell, { align: "right", children: "Total" }), _jsx(TableCell, { align: "right", children: "Pending" }), _jsx(TableCell, { align: "right", children: "In progress" }), _jsx(TableCell, { align: "right", children: "Completed" }), _jsx(TableCell, { align: "right", children: "Overdue" })] }) }), _jsx(TableBody, { children: matrix.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontWeight: 600 }, children: row.role }), _jsx(TableCell, { align: "right", children: row.total }), _jsx(TableCell, { align: "right", children: row.pending }), _jsx(TableCell, { align: "right", children: row.inProgress }), _jsx(TableCell, { align: "right", children: row.completed }), _jsx(TableCell, { align: "right", children: row.overdue > 0 ? (_jsx(Box, { component: "span", sx: { color: 'error.main', fontWeight: 700 }, children: row.overdue })) : (row.overdue) })] }, row.role))) })] }), _jsx(Divider, { sx: { my: 3 } }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700, mb: 1 }, children: "All tasks \u2014 set status" }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Task" }), _jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Due" }), _jsx(TableCell, { children: "Owners" }), _jsx(TableCell, { align: "right", children: "Set status" })] }) }), _jsx(TableBody, { children: sortedTasks.map((task) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { maxWidth: 320 }, children: task.title }), _jsx(TableCell, { children: _jsx(Chip, { label: task.priority, size: "small", color: PRIORITY_COLOR[task.priority] }) }), _jsx(TableCell, { children: _jsx(Chip, { label: STATUS_LABEL[task.status], size: "small", color: STATUS_COLOR[task.status], variant: "outlined" }) }), _jsx(TableCell, { children: task.dueDate ? (_jsx(Chip, { label: `Due ${formatDueDate(task.dueDate)}`, size: "small", color: isOverdue(task) ? 'error' : 'default', variant: "outlined" })) : ('—') }), _jsx(TableCell, { children: _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, useFlexGap: true, children: task.assignments.map((a) => (_jsx(Chip, { label: a.roleCode, size: "small", variant: "outlined" }, a.roleCode))) }) }), _jsxs(TableCell, { align: "right", children: [_jsx(IconButton, { size: "small", "aria-label": `Set status for ${task.title}`, disabled: isUpdating, onClick: (e) => setRowMenu({ id: task.id, el: e.currentTarget }), children: _jsx(MoreVertIcon, {}) }), _jsx(Menu, { anchorEl: rowMenu?.el, open: rowMenu?.id === task.id, onClose: () => setRowMenu(null), children: ALL_STATUSES.map((s) => (_jsx(MenuItem, { selected: task.status === s, disabled: isUpdating, onClick: () => {
                                                    setRowMenu(null);
                                                    onSetStatus(task.id, s);
                                                }, children: STATUS_LABEL[s] }, s))) })] })] }, task.id))) })] })] }));
}
