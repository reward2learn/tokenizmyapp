'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useListTenantUsersQuery, useUpsertTenantUserMutation, useDeleteTenantUserMutation, } from '@/store/apis/tenant-api';
import { useListAdminGroupsQuery } from '@/store/apis/admin-api';
import { FUNCTIONAL_ROLES } from '@/domain/security/functional-roles';
const defaultForm = () => ({
    sub: '',
    email: '',
    name: '',
    tier: 'pin',
    roleCode: '',
    groupCodes: [],
    pin: '',
    isActive: true,
});
// ── Component ──────────────────────────────────────────
export function TenantUserManager({ open, onClose, tenantSlug, tenantDisplayName }) {
    // ── Queries ──────────────────────────────────────────
    const { data, isLoading, isError } = useListTenantUsersQuery(tenantSlug);
    const [upsertUser, { isLoading: isSaving }] = useUpsertTenantUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteTenantUserMutation();
    const { data: groupsData } = useListAdminGroupsQuery();
    const allGroups = groupsData?.data?.groups ?? [];
    const users = data?.data?.users ?? [];
    // ── Local state ──────────────────────────────────────
    const [mode, setMode] = useState('list');
    const [form, setForm] = useState(defaultForm());
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [error, setError] = useState(null);
    // ── Helpers ──────────────────────────────────────────
    const startCreate = () => {
        setForm(defaultForm());
        setEditingId(null);
        setMode('form');
        setError(null);
    };
    const startEdit = (user) => {
        setForm({
            sub: user.sub,
            email: user.email ?? '',
            name: user.name ?? '',
            tier: user.tier,
            roleCode: user.roleCode ?? '',
            groupCodes: user.groups,
            pin: '',
            isActive: user.isActive,
        });
        setEditingId(user.id);
        setMode('form');
        setError(null);
    };
    const handleCancelForm = () => {
        setMode('list');
        setEditingId(null);
        setError(null);
    };
    const handleClose = () => {
        setMode('list');
        setEditingId(null);
        setDeleteConfirm(null);
        setError(null);
        onClose();
    };
    // ── Save ─────────────────────────────────────────────
    const handleSave = async () => {
        setError(null);
        try {
            const result = await upsertUser({
                slug: tenantSlug,
                sub: form.sub,
                email: form.email || null,
                name: form.name || null,
                tier: form.tier,
                roleCode: form.roleCode || null,
                groupCodes: form.groupCodes,
                pin: form.pin || undefined,
                isActive: form.isActive,
            }).unwrap();
            if (result.success) {
                setMode('list');
                setEditingId(null);
            }
            else {
                setError(result.error ?? 'Failed to save user');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    // ── Delete ───────────────────────────────────────────
    const handleDelete = async (id) => {
        setError(null);
        try {
            const result = await deleteUser({ slug: tenantSlug, id }).unwrap();
            if (result.success) {
                setDeleteConfirm(null);
            }
            else {
                setError(result.error ?? 'Failed to delete user');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    // ── Helpers for display ──────────────────────────────
    const resolveRoleName = (code) => {
        if (!code)
            return null;
        return FUNCTIONAL_ROLES.find((r) => r.code === code)?.name ?? code;
    };
    const resolveGroupName = (code) => {
        return allGroups.find((g) => g.code === code)?.name ?? code;
    };
    // ── Render ───────────────────────────────────────────
    return (_jsxs(Dialog, { open: open, onClose: handleClose, maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { sx: { fontWeight: 700 }, children: mode === 'form'
                    ? editingId
                        ? `Edit User — ${form.name || form.sub}`
                        : 'Add User'
                    : `Users — ${tenantDisplayName} (${tenantSlug})` }), _jsxs(DialogContent, { dividers: true, children: [error ? (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error })) : null, mode === 'list' ? (
                    /* ── List mode ─────────────────────────────── */
                    isLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) })) : isError ? (_jsx(Alert, { severity: "error", children: "Failed to load tenant users. The tenant may not have a user_accounts table migration yet." })) : users.length === 0 ? (_jsxs(Box, { sx: { textAlign: 'center', py: 4 }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "No users found for this tenant." }), _jsx(Button, { variant: "contained", startIcon: _jsx(PersonAddIcon, {}), onClick: startCreate, children: "Add User" })] })) : (_jsxs(_Fragment, { children: [_jsx(Stack, { direction: "row", sx: { mb: 2, justifyContent: 'flex-end' }, children: _jsx(Button, { variant: "contained", startIcon: _jsx(PersonAddIcon, {}), onClick: startCreate, children: "Add User" }) }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Person / Sub" }), _jsx(TableCell, { children: "Role" }), _jsx(TableCell, { children: "Email" }), _jsx(TableCell, { children: "PIN" }), _jsx(TableCell, { children: "Active" }), _jsx(TableCell, { align: "right", sx: { minWidth: 160 }, children: "Actions" })] }) }), _jsx(TableBody, { children: users.map((user) => {
                                            const roleName = resolveRoleName(user.roleCode);
                                            return (_jsxs(TableRow, { children: [_jsxs(TableCell, { children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: user.name ?? '-' }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: user.sub })] }), _jsx(TableCell, { children: roleName ? (_jsx(Chip, { label: roleName, size: "small", variant: "outlined" })) : (_jsx(Typography, { variant: "caption", color: "text.disabled", children: "\u2014" })) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", children: user.email ?? '—' }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: "\u2022\u2022\u2022\u2022" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: user.isActive ? 'active' : 'disabled', size: "small", color: user.isActive ? 'success' : 'error' }) }), _jsx(TableCell, { align: "right", children: deleteConfirm === user.id ? (
                                                        /* ── Delete confirmation (inline) ── */
                                                        _jsxs(Stack, { direction: "row", spacing: 0.5, sx: { justifyContent: 'flex-end', alignItems: 'center' }, children: [_jsxs(Typography, { variant: "caption", color: "error", sx: { mr: 0.5, whiteSpace: 'nowrap' }, children: ["Delete ", user.name || user.sub, "?"] }), _jsx(Button, { size: "small", color: "error", variant: "contained", disabled: isDeleting, onClick: () => void handleDelete(user.id), sx: { minWidth: 72, fontSize: '0.7rem' }, children: isDeleting ? '...' : 'Confirm' }), _jsx(Button, { size: "small", onClick: () => setDeleteConfirm(null), disabled: isDeleting, sx: { minWidth: 52, fontSize: '0.7rem' }, children: "No" })] })) : (
                                                        /* ── Normal action buttons ── */
                                                        _jsxs(Stack, { direction: "row", spacing: 0.5, sx: { justifyContent: 'flex-end' }, children: [user.groups.length > 0 ? (_jsx(Tooltip, { title: `Groups: ${user.groups.map(resolveGroupName).join(', ')}`, children: _jsx(Chip, { label: `${user.groups.length} group${user.groups.length !== 1 ? 's' : ''}`, size: "small", variant: "outlined", color: "info", sx: { height: 20, fontSize: '0.65rem', mr: 0.5 } }) })) : null, _jsx(Tooltip, { title: "Edit user", children: _jsx(IconButton, { size: "small", onClick: () => startEdit(user), children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Delete user", children: _jsx(IconButton, { size: "small", color: "error", onClick: () => setDeleteConfirm(user.id), children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] })) })] }, user.id));
                                        }) })] })] }))) : (
                    /* ── Form mode ─────────────────────────────── */
                    _jsxs(Stack, { spacing: 2.5, sx: { mt: 1 }, children: [_jsx(TextField, { label: "Sub", value: form.sub, onChange: (e) => setForm((p) => ({ ...p, sub: e.target.value })), disabled: !!editingId, required: !editingId, fullWidth: true, size: "small", helperText: editingId ? 'Sub cannot be changed after creation' : 'Unique identifier for this user account' }), _jsx(TextField, { label: "Name", value: form.name, onChange: (e) => setForm((p) => ({ ...p, name: e.target.value })), fullWidth: true, size: "small", placeholder: "Full display name" }), _jsx(TextField, { label: "Email", type: "email", value: form.email, onChange: (e) => setForm((p) => ({ ...p, email: e.target.value })), fullWidth: true, size: "small", placeholder: "user@example.com" }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "tier-label", children: "Tier" }), _jsxs(Select, { labelId: "tier-label", label: "Tier", value: form.tier, onChange: (e) => setForm((p) => ({ ...p, tier: e.target.value })), children: [_jsx(MenuItem, { value: "pin", children: "PIN \u2014 Password-based access" }), _jsx(MenuItem, { value: "google", children: "Google \u2014 OAuth sign-in" }), _jsx(MenuItem, { value: "public", children: "Public \u2014 No auth required" })] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "role-label", children: "Functional Role" }), _jsxs(Select, { labelId: "role-label", label: "Functional Role", value: form.roleCode, onChange: (e) => setForm((p) => ({ ...p, roleCode: e.target.value })), children: [_jsx(MenuItem, { value: "", children: "\u2014 None \u2014" }), FUNCTIONAL_ROLES.map((role) => (_jsxs(MenuItem, { value: role.code, children: [role.name, role.isPlatformAdmin ? (_jsx(Chip, { label: "admin", size: "small", color: "warning", sx: { ml: 1, height: 18, fontSize: '0.6rem' } })) : null] }, role.code)))] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "groups-label", children: "Security Groups" }), _jsx(Select, { labelId: "groups-label", label: "Security Groups", multiple: true, value: form.groupCodes, onChange: (e) => setForm((p) => ({ ...p, groupCodes: e.target.value })), renderValue: (selected) => selected.length === 0
                                            ? '— None —'
                                            : selected.map((c) => resolveGroupName(c)).join(', '), children: allGroups.length === 0 ? (_jsx(MenuItem, { disabled: true, children: _jsx(Typography, { variant: "body2", color: "text.disabled", children: "No security groups available" }) })) : (allGroups.map((g) => (_jsxs(MenuItem, { value: g.code, children: [_jsx(Checkbox, { checked: form.groupCodes.includes(g.code), size: "small" }), _jsx(ListItemText, { primary: g.name, secondary: g.code })] }, g.code)))) })] }), _jsx(TextField, { label: "PIN", type: "password", value: form.pin, onChange: (e) => setForm((p) => ({ ...p, pin: e.target.value })), fullWidth: true, size: "small", placeholder: editingId ? 'Leave blank to keep existing' : 'Required for PIN-tier users', helperText: editingId ? 'Leave empty to keep current PIN unchanged' : '3–12 characters', slotProps: {
                                    htmlInput: { minLength: 3, maxLength: 12 },
                                } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: form.isActive, onChange: (e) => setForm((p) => ({ ...p, isActive: e.target.checked })) }), label: "User account is active" })] }))] }), _jsx(DialogActions, { children: mode === 'list' ? (_jsx(Button, { onClick: handleClose, children: "Close" })) : (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: handleCancelForm, disabled: isSaving, children: "Cancel" }), _jsx(Button, { variant: "contained", disabled: isSaving || !form.sub.trim(), onClick: () => void handleSave(), children: isSaving ? 'Saving...' : editingId ? 'Update User' : 'Create User' })] })) })] }));
}
