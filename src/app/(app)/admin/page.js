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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PlatformAdminGate } from '@/components/auth/platform-admin-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { BrandConfigTab } from '@/components/ops-admin/brand-config-tab';
import { NavigationManager } from '@/components/ops-admin/navigation-manager';
import { TenantInfoTab } from '@/components/ops-admin/tenant-info-tab';
import { TenantDashboard } from '@/components/ops-admin/tenant-dashboard';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { useListRoleConfigsQuery, useListAdminConversationsQuery, useArchiveAdminConversationMutation, useListAdminUsersQuery, useUpdateAdminUserMutation, useDeleteAdminUserMutation, useListAdminGroupsQuery, useCreateAdminGroupMutation, useUpdateAdminGroupMutation, } from '@/store/apis/admin-api';
import { FUNCTIONAL_ROLES } from '@/domain/security/functional-roles';
import { CAPABILITY_AREAS, capability } from '@/domain/security/capabilities';
/** Roles that persist regardless of seeded data state. */
const PERSISTENT_ROLES = [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true, email: null },
    { code: 'admin', name: 'Admin', isPlatformAdmin: true, email: null },
];
function RoleManager() {
    const { data, isLoading, isError } = useListRoleConfigsQuery();
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) }));
    }
    // Combine persistent roles with any DB-seeded roles (after clearing, only persistent remain)
    const dbRoles = data?.data?.roles ?? [];
    const hasDbData = dbRoles.length > 0;
    // Show persistent + any additional roles from the DB
    const displayRoles = hasDbData
        ? dbRoles
        : PERSISTENT_ROLES;
    return (_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: "Functional Role Catalog" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: hasDbData
                    ? 'Each functional role is assigned to one person. Manage PINs in the User Accounts tab.'
                    : 'No seeded roles — showing persistent defaults (Platform Admin, Admin). Seed data to restore all functional roles.' }), isError ? (_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Could not load roles from database. Showing persistent defaults." })) : null, _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Role" }), _jsx(TableCell, { children: "Person" }), _jsx(TableCell, { children: "Email" }), _jsx(TableCell, { children: "PIN" })] }) }), _jsx(TableBody, { children: displayRoles.map((r) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontWeight: 600 }, children: r.name }), _jsx(TableCell, { children: r.code === 'admin' ? 'Admin' : r.code === 'platform-admin' ? 'Platform Admin' : '—' }), _jsx(TableCell, { children: r.email ?? '—' }), _jsx(TableCell, { children: 'pinConfigured' in r ? (r.pinConfigured ? (_jsx(Chip, { label: "configured", size: "small", color: "success", variant: "outlined" })) : (_jsx(Chip, { label: "not set", size: "small", color: "warning", variant: "outlined" }))) : (_jsx(Chip, { label: "\u2014", size: "small", variant: "outlined" })) })] }, r.code))) })] })] }));
}
function ConversationManager() {
    const { data, isLoading, isError, refetch } = useListAdminConversationsQuery({ limit: 100 });
    const [archive, { isLoading: isArchiving }] = useArchiveAdminConversationMutation();
    const [showArchived, setShowArchived] = useState(false);
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) }));
    }
    if (isError || !data?.success) {
        return _jsx(Alert, { severity: "error", children: "Failed to load conversations." });
    }
    const conversations = (data.data.conversations ?? []).filter((c) => showArchived || !c.archived);
    const handleToggle = async (id, archived) => {
        await archive({ id, archived: !archived }).unwrap();
    };
    return (_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsxs(Stack, { direction: "row", sx: { mb: 2, alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "AI Chat Conversations" }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Button, { size: "small", variant: "text", onClick: () => refetch(), children: "Refresh" }), _jsx(Button, { size: "small", variant: showArchived ? 'contained' : 'outlined', onClick: () => setShowArchived((prev) => !prev), children: showArchived ? 'Hide archived' : 'Show archived' })] })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Archive a conversation to remove it from the user's saved list (last 20 non-archived are shown). Platform admins can archive any conversation." }), conversations.length === 0 ? (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "No conversations." })) : (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "User" }), _jsx(TableCell, { children: "Messages" }), _jsx(TableCell, { children: "Created" }), _jsx(TableCell, { align: "right", children: "Archive" })] }) }), _jsx(TableBody, { children: conversations.map((c) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: c.id }), _jsx(TableCell, { sx: { maxWidth: 280 }, children: c.title }), _jsxs(TableCell, { children: [c.user_name, c.owner_sub ? ` (${c.owner_sub})` : ''] }), _jsx(TableCell, { children: c.message_count }), _jsx(TableCell, { children: new Date(c.created_at).toLocaleString() }), _jsx(TableCell, { align: "right", children: _jsx(Button, { size: "small", variant: c.archived ? 'outlined' : 'contained', color: c.archived ? 'inherit' : 'warning', disabled: isArchiving, onClick: () => void handleToggle(c.id, c.archived), children: c.archived ? 'Unarchive' : 'Archive' }) })] }, c.id))) })] }))] }));
}
function UserManager() {
    const { data, isLoading, isError, refetch } = useListAdminUsersQuery();
    const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
    const { data: groupsData } = useListAdminGroupsQuery();
    // Fetch PIN config status (maps functional role code → pinConfigured).
    const { data: roleConfigData } = useListRoleConfigsQuery();
    const [editing, setEditing] = useState(null);
    const [details, setDetails] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const allGroups = groupsData?.data.groups ?? [];
    // Build PIN status map (functional role code → configured).
    const pinStatus = {};
    if (roleConfigData?.success && roleConfigData.data.roles) {
        for (const r of roleConfigData.data.roles) {
            pinStatus[r.code] = r.pinConfigured;
        }
    }
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) }));
    }
    if (isError || !data?.success) {
        return _jsx(Alert, { severity: "error", children: "Failed to load users." });
    }
    const users = data.data.users ?? [];
    const openEditor = (user) => {
        setEditing({
            id: user.id, sub: user.sub, email: user.email ?? '',
            isActive: user.isActive, roleCode: user.roleCode,
            groupCodes: user.groups, pin: '',
        });
    };
    const handleSave = async () => {
        if (!editing)
            return;
        await updateUser({
            id: editing.id,
            email: editing.email || undefined,
            isActive: editing.isActive,
            roleCode: editing.roleCode,
            groupCodes: editing.groupCodes,
            pin: editing.pin || undefined,
        }).unwrap();
        setEditing(null);
        refetch();
    };
    const handleDelete = async () => {
        if (!editing)
            return;
        await deleteUser({ id: editing.id, sub: editing.sub }).unwrap();
        setEditing(null);
        setDeleteConfirm(null);
        refetch();
    };
    return (_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsxs(Stack, { direction: "row", sx: { mb: 2, alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "User Accounts" }), _jsx(Button, { size: "small", variant: "text", onClick: () => refetch(), children: "Refresh" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Manage user accounts: assign roles, set PINs, and configure group memberships." }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Person" }), _jsx(TableCell, { children: "Role" }), _jsx(TableCell, { children: "Email" }), _jsx(TableCell, { children: "PIN" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: users.map((u) => {
                            const hasPin = u.roleCode ? (pinStatus[u.roleCode] ?? false) : false;
                            return (_jsxs(TableRow, { children: [_jsxs(TableCell, { sx: { fontWeight: 600 }, children: [u.name ?? u.sub, !u.isActive ? (_jsx(Chip, { label: "disabled", size: "small", color: "error", variant: "outlined", sx: { ml: 1 } })) : null] }), _jsx(TableCell, { children: FUNCTIONAL_ROLES.find((r) => r.code === u.roleCode)?.name ?? u.roleCode ?? '—' }), _jsx(TableCell, { children: u.email ?? '—' }), _jsx(TableCell, { children: hasPin ? (_jsx(Chip, { label: "configured", size: "small", color: "success", variant: "outlined" })) : (_jsx(Chip, { label: "not set", size: "small", color: "warning", variant: "outlined" })) }), _jsx(TableCell, { align: "right", children: _jsxs(Stack, { direction: "row", spacing: 0.5, sx: { justifyContent: 'flex-end' }, children: [_jsx(Tooltip, { title: "View groups & capabilities", children: _jsx(IconButton, { size: "small", onClick: () => setDetails(u), "aria-label": "View details", children: _jsx(InfoOutlinedIcon, { fontSize: "small" }) }) }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => openEditor(u), children: "Edit" })] }) })] }, u.id));
                        }) })] }), _jsxs(Dialog, { open: Boolean(details), onClose: () => setDetails(null), maxWidth: "xs", fullWidth: true, children: [_jsx(DialogTitle, { children: details?.name ?? details?.sub }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: details?.email ?? '—' }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 0.5 }, children: "Security groups" }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, useFlexGap: true, children: details && details.groups.length ? (details.groups.map((g) => (_jsx(Chip, { label: g, size: "small", variant: "outlined" }, g)))) : (_jsx(Typography, { variant: "caption", color: "text.secondary", children: "none" })) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 0.5 }, children: "Capabilities" }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, useFlexGap: true, children: details && details.permissions.includes('*') ? (_jsx(Chip, { label: "all", size: "small", color: "primary", variant: "outlined" })) : details && details.permissions.length ? (details.permissions.map((p) => (_jsx(Chip, { label: p, size: "small", variant: "outlined" }, p)))) : (_jsx(Typography, { variant: "caption", color: "text.secondary", children: "none" })) })] })] }) }), _jsx(DialogActions, { children: _jsx(Button, { size: "small", onClick: () => setDetails(null), children: "Close" }) })] }), _jsxs(Dialog, { open: Boolean(editing), onClose: () => setEditing(null), maxWidth: "xs", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["Manage ", users.find((u) => u.id === editing?.id)?.name ?? editing?.id] }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, sx: { mt: 0.5 }, children: [_jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "user-status-label", children: "Status" }), _jsxs(Select, { labelId: "user-status-label", label: "Status", value: editing ? (editing.isActive ? 'active' : 'disabled') : 'active', onChange: (e) => setEditing((prev) => prev ? { ...prev, isActive: e.target.value === 'active' } : prev), children: [_jsx(MenuItem, { value: "active", children: "Active" }), _jsx(MenuItem, { value: "disabled", children: "Disabled" })] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "user-role-label", children: "Functional role" }), _jsxs(Select, { labelId: "user-role-label", label: "Functional role", value: editing?.roleCode ?? '', onChange: (e) => setEditing((prev) => prev ? { ...prev, roleCode: e.target.value || null } : prev), children: [_jsx(MenuItem, { value: "", children: "\u2014 none \u2014" }), FUNCTIONAL_ROLES.map((fr) => (_jsx(MenuItem, { value: fr.code, children: fr.name }, fr.code)))] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "user-groups-label", children: "Security groups" }), _jsx(Select, { labelId: "user-groups-label", label: "Security groups", multiple: true, value: editing?.groupCodes ?? [], onChange: (e) => setEditing((prev) => prev ? { ...prev, groupCodes: e.target.value } : prev), renderValue: (selected) => selected.join(', '), children: allGroups.map((g) => (_jsx(MenuItem, { value: g.code, children: g.name }, g.code))) })] }), _jsx(TextField, { size: "small", label: "Email", type: "email", placeholder: "user@example.com", value: editing?.email ?? '', onChange: (e) => setEditing((prev) => prev ? { ...prev, email: e.target.value } : prev) }), _jsx(TextField, { type: "password", size: "small", label: "Set / rotate PIN", placeholder: "new PIN (min 3 chars)", value: editing?.pin ?? '', onChange: (e) => setEditing((prev) => prev ? { ...prev, pin: e.target.value } : prev), slotProps: { htmlInput: { maxLength: 12 } } })] }) }), _jsx(DialogActions, { children: deleteConfirm === editing?.id ? (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", color: "error", variant: "contained", disabled: isDeleting, onClick: handleDelete, children: isDeleting ? 'Deleting…' : 'Confirm delete' }), _jsx(Button, { size: "small", variant: "text", onClick: () => setDeleteConfirm(null), children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", color: "error", variant: "text", onClick: () => setDeleteConfirm(editing?.id ?? null), children: "Delete" }), _jsx(Button, { size: "small", variant: "text", onClick: () => setEditing(null), children: "Cancel" }), _jsx(Button, { size: "small", variant: "contained", disabled: isUpdating, onClick: () => void handleSave(), children: "Save" })] })) })] })] }));
}
function GroupManager() {
    const { data, isLoading, isError, refetch } = useListAdminGroupsQuery();
    const [createGroup, { isLoading: isCreating }] = useCreateAdminGroupMutation();
    const [updateGroup, { isLoading: isUpdating }] = useUpdateAdminGroupMutation();
    const [newGroup, setNewGroup] = useState({ code: '', name: '', description: '' });
    const [editing, setEditing] = useState(null);
    if (isLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) }));
    }
    if (isError || !data?.success) {
        return _jsx(Alert, { severity: "error", children: "Failed to load groups." });
    }
    const groups = data.data.groups ?? [];
    const handleCreate = async () => {
        if (!newGroup.code.trim() || !newGroup.name.trim())
            return;
        await createGroup({ code: newGroup.code.trim().toLowerCase(), name: newGroup.name.trim(), description: newGroup.description.trim() }).unwrap();
        setNewGroup({ code: '', name: '', description: '' });
        refetch();
    };
    const openEditor = (g) => {
        setEditing({ code: g.code, name: g.name, description: g.description, permissions: [...g.permissions] });
    };
    const toggleCap = (cap) => {
        setEditing((prev) => {
            if (!prev)
                return prev;
            const has = prev.permissions.includes(cap);
            return {
                ...prev,
                permissions: has ? prev.permissions.filter((c) => c !== cap) : [...prev.permissions, cap],
            };
        });
    };
    const handleSavePerms = async () => {
        if (!editing)
            return;
        await updateGroup({ code: editing.code, permissions: editing.permissions }).unwrap();
        setEditing(null);
        refetch();
    };
    return (_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsxs(Stack, { direction: "row", sx: { mb: 2, alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Security Groups" }), _jsx(Button, { size: "small", variant: "text", onClick: () => refetch(), children: "Refresh" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Groups gate API calls and routes by membership. Each group grants a set of capabilities (read/write per area). Platform admins are implicitly granted every capability." }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Code" }), _jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Description" }), _jsx(TableCell, { children: "Capabilities" }), _jsx(TableCell, { children: "System" }), _jsx(TableCell, { align: "right", children: "Members" }), _jsx(TableCell, { align: "right", children: "Manage" })] }) }), _jsx(TableBody, { children: groups.map((g) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontWeight: 600 }, children: g.code }), _jsx(TableCell, { children: g.name }), _jsx(TableCell, { children: g.description ?? '—' }), _jsx(TableCell, { children: _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, useFlexGap: true, children: g.permissions.includes('*') ? (_jsx(Chip, { label: "all", size: "small", color: "primary", variant: "outlined" })) : g.permissions.length ? (g.permissions.map((p) => (_jsx(Chip, { label: p, size: "small", variant: "outlined" }, p)))) : (_jsx(Typography, { variant: "caption", color: "text.secondary", children: "none" })) }) }), _jsx(TableCell, { children: g.isSystem ? _jsx(Chip, { label: "system", size: "small", color: "info", variant: "outlined" }) : null }), _jsx(TableCell, { align: "right", children: g.memberCount }), _jsx(TableCell, { align: "right", children: _jsx(Button, { size: "small", variant: "outlined", disabled: g.isSystem, onClick: () => openEditor(g), children: "Permissions" }) })] }, g.code))) })] }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, sx: { mt: 2 }, children: [_jsx(TextField, { size: "small", label: "Code", value: newGroup.code, onChange: (e) => setNewGroup((p) => ({ ...p, code: e.target.value })), placeholder: "e.g. marketing" }), _jsx(TextField, { size: "small", label: "Name", value: newGroup.name, onChange: (e) => setNewGroup((p) => ({ ...p, name: e.target.value })), placeholder: "Marketing" }), _jsx(TextField, { size: "small", label: "Description", value: newGroup.description, onChange: (e) => setNewGroup((p) => ({ ...p, description: e.target.value })), sx: { flex: 1 } }), _jsx(Button, { size: "small", variant: "contained", disabled: isCreating || !newGroup.code.trim() || !newGroup.name.trim(), onClick: () => void handleCreate(), children: "Add group" })] }), _jsxs(Dialog, { open: Boolean(editing), onClose: () => setEditing(null), maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["Capabilities \u2014 ", editing?.code] }), _jsx(DialogContent, { dividers: true, children: _jsx(Stack, { spacing: 2, children: CAPABILITY_AREAS.map((area) => (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 0.5 }, children: area.label }), _jsx(Stack, { direction: "row", spacing: 2, children: area.accesses.map((acc) => {
                                            const cap = capability(area.area, acc);
                                            return (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: editing?.permissions.includes(cap) ?? false, onChange: () => toggleCap(cap) }), label: acc === 'use' ? 'Use' : acc === 'read' ? 'Read' : 'Write' }, cap));
                                        }) })] }, area.area))) }) }), _jsxs(DialogActions, { children: [_jsx(Button, { size: "small", onClick: () => setEditing(null), children: "Cancel" }), _jsx(Button, { size: "small", variant: "contained", disabled: isUpdating, onClick: () => void handleSavePerms(), children: "Save" })] })] })] }));
}
export default function AdminPage() {
    const [tab, setTab] = useState(0);
    const isTokenizmyapp = getClientTenantConfig().slug === 'tokenizmyapp';
    return (_jsx(PlatformAdminGate, { fallback: _jsx(SignInPanelGate, { requiredTier: "pin" }), children: _jsx(Box, { sx: { mx: 'auto', px: 3, py: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 800 }, children: "Platform Admin" }), _jsxs(Tabs, { value: tab, onChange: (_e, v) => setTab(v), variant: "scrollable", scrollButtons: "auto", children: [isTokenizmyapp ? _jsx(Tab, { label: "Tenants" }) : null, _jsx(Tab, { label: "Tenant Info" }), _jsx(Tab, { label: "Navigation" }), _jsx(Tab, { label: "Brand Config" }), _jsx(Tab, { label: "Security Groups" }), _jsx(Tab, { label: "User Accounts" }), _jsx(Tab, { label: "User Roles" }), _jsx(Tab, { label: "User Conversations" })] }), isTokenizmyapp && tab === 0 ? _jsx(TenantDashboard, {}) : null, tab === (isTokenizmyapp ? 1 : 0) ? _jsx(TenantInfoTab, {}) : null, tab === (isTokenizmyapp ? 2 : 1) ? _jsx(NavigationManager, {}) : null, tab === (isTokenizmyapp ? 3 : 2) ? _jsx(BrandConfigTab, {}) : null, tab === (isTokenizmyapp ? 4 : 3) ? _jsx(GroupManager, {}) : null, tab === (isTokenizmyapp ? 5 : 4) ? _jsx(UserManager, {}) : null, tab === (isTokenizmyapp ? 6 : 5) ? _jsx(RoleManager, {}) : null, tab === (isTokenizmyapp ? 7 : 6) ? _jsx(ConversationManager, {}) : null] }) }) }));
}
