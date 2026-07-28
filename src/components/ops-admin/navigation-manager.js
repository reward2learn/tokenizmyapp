'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
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
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { NavIcon, NAV_ICON_NAMES } from '@/components/shared/nav-icon';
import { useGetNavigationQuery, useCreateNavigationItemMutation, useUpdateNavigationItemsMutation, useDeleteNavigationItemsMutation, useListAdminGroupsQuery, } from '@/store/apis/admin-api';
// ── Helpers ────────────────────────────────────────────
function flattenTree(items, depth = 0) {
    const result = [];
    for (const item of items) {
        result.push({ ...item, depth });
        if (item.children.length > 0) {
            result.push(...flattenTree(item.children, depth + 1));
        }
    }
    return result;
}
function buildTree(items) {
    const map = new Map();
    const roots = [];
    for (const item of items)
        map.set(item.id, { ...item, children: [] });
    for (const item of map.values()) {
        if (item.parentId && map.has(item.parentId)) {
            map.get(item.parentId).children.push(item);
        }
        else {
            roots.push(item);
        }
    }
    return roots;
}
/** Collect all descendant IDs of a given parent (recursive). */
function collectDescendantIds(items, parentId) {
    const ids = [];
    for (const item of items) {
        if (item.parentId === parentId) {
            ids.push(item.id);
            ids.push(...collectDescendantIds(items, item.id));
        }
    }
    return ids;
}
// ── Component ──────────────────────────────────────────
export function NavigationManager() {
    const [items, setItems] = useState([]);
    const [flatItems, setFlatItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [originalEditingItem, setOriginalEditingItem] = useState(null);
    const [applyRecursive, setApplyRecursive] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);
    // ── Multi-select ──────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [batchDialogMode, setBatchDialogMode] = useState(null);
    const [batchParentId, setBatchParentId] = useState('');
    const [batchTier, setBatchTier] = useState('public');
    const [batchGroups, setBatchGroups] = useState([]);
    // ── RTK Query: navigation ─────────────────────────────
    const { data: navData, isLoading: navLoading, isError: navError, error: navQueryError } = useGetNavigationQuery();
    useEffect(() => {
        if (navData?.success) {
            const navItems = navData.data?.items ?? [];
            setItems(navItems);
            setFlatItems(flattenTree(navItems));
            setError(null);
        }
        else if (navData && navData.success === false) {
            setError(navData.error ?? 'Failed to load navigation');
        }
    }, [navData]);
    useEffect(() => {
        if (navError) {
            const msg = navQueryError && typeof navQueryError === 'object' && 'status' in navQueryError
                ? `Failed to load navigation (${String(navQueryError.status)})`
                : 'Failed to load navigation';
            setError(msg);
        }
    }, [navError, navQueryError]);
    // ── RTK Query: security groups ────────────────────────
    const { data: groupsData } = useListAdminGroupsQuery();
    const [allSecurityGroups, setAllSecurityGroups] = useState([]);
    useEffect(() => {
        if (groupsData?.success && groupsData.data?.groups) {
            setAllSecurityGroups(groupsData.data.groups.map((g) => ({ code: g.code, name: g.name })));
        }
    }, [groupsData]);
    // ── RTK Query: mutations ──────────────────────────────
    const [createNav] = useCreateNavigationItemMutation();
    const [updateNav] = useUpdateNavigationItemsMutation();
    const [deleteNav] = useDeleteNavigationItemsMutation();
    // ── Create ────────────────────────────────────────────
    const [newTitle, setNewTitle] = useState('');
    const [newPath, setNewPath] = useState('');
    const [newParentId, setNewParentId] = useState('');
    const [newTier, setNewTier] = useState('public');
    const [newType, setNewType] = useState('page');
    const [newRequiredGroups, setNewRequiredGroups] = useState([]);
    const [newIcon, setNewIcon] = useState('');
    const handleCreate = useCallback(async () => {
        if (!newTitle.trim())
            return;
        setSaving(true);
        setError(null);
        try {
            let path = newPath.trim();
            // Auto-set path based on type
            if (newType === 'folder')
                path = '';
            if (newType === 'page' && !path)
                path = `/${newTitle.trim().toLowerCase().replace(/\s+/g, '-')}`;
            const result = await createNav({
                title: newTitle.trim(),
                path,
                parentId: newParentId || null,
                authTier: newTier,
                icon: newIcon,
                requiredGroups: newRequiredGroups.join(','),
            }).unwrap();
            if (result.success) {
                setCreateDialogOpen(false);
                setNewTitle('');
                setNewPath('');
                setNewParentId('');
                setNewType('page');
                setNewRequiredGroups([]);
                setNewIcon('');
                // RTKQ invalidatesTags:['Navigation'] auto-refetches
            }
            else {
                throw new Error(result.error ?? 'Create failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setSaving(false);
        }
    }, [newTitle, newPath, newParentId, newTier, newType, newRequiredGroups, newIcon, createNav]);
    // ── Edit ──────────────────────────────────────────────
    const openEdit = useCallback((item) => {
        setEditingItem({ ...item });
        setOriginalEditingItem({ ...item });
        setApplyRecursive(false);
        setEditDialogOpen(true);
    }, []);
    const handleEditSave = useCallback(async () => {
        if (!editingItem)
            return;
        setSaving(true);
        setError(null);
        try {
            const itemsToSave = [editingItem];
            // When "Apply to children" is checked, cascade changed properties to all descendants
            if (applyRecursive && originalEditingItem) {
                const descIds = collectDescendantIds(flatItems, editingItem.id);
                const changedProps = {};
                for (const key of ['authTier', 'requiredGroups', 'isVisible', 'icon']) {
                    if (editingItem[key] !== originalEditingItem[key]) {
                        changedProps[key] = editingItem[key];
                    }
                }
                if (Object.keys(changedProps).length > 0) {
                    for (const id of descIds) {
                        const original = flatItems.find((i) => i.id === id);
                        if (original) {
                            itemsToSave.push({ ...original, ...changedProps });
                        }
                    }
                }
            }
            const result = await updateNav({ items: itemsToSave }).unwrap();
            if (result.success) {
                setEditDialogOpen(false);
                setEditingItem(null);
                setOriginalEditingItem(null);
                setApplyRecursive(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
                // RTKQ invalidatesTags:['Navigation'] auto-refetches
            }
            else {
                throw new Error(result.error ?? 'Update failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setSaving(false);
        }
    }, [editingItem, originalEditingItem, applyRecursive, flatItems, updateNav]);
    // ── Set as default route ──────────────────────────────
    const handleSetDefault = useCallback(async (item) => {
        setSaving(true);
        setError(null);
        try {
            const result = await updateNav({ items: [{ id: item.id, isDefault: true }] }).unwrap();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
                // RTKQ invalidatesTags:['Navigation'] auto-refetches
            }
            else {
                throw new Error(result.error ?? 'Failed to set default');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setSaving(false);
        }
    }, [updateNav]);
    // ── Delete ────────────────────────────────────────────
    const handleDelete = useCallback(async (id) => {
        if (!globalThis.window.confirm('Delete this nav item? Children will be moved to root level.'))
            return;
        setError(null);
        try {
            const result = await deleteNav([id]).unwrap();
            if (result.success) {
                // RTKQ invalidatesTags:['Navigation'] auto-refetches
            }
            else {
                throw new Error(result.error ?? 'Delete failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }, [deleteNav]);
    // ── Multi-select helpers ─────────────────────────────
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
    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
    const selectAll = useCallback(() => setSelectedIds(new Set(flatItems.map((i) => i.id))), [flatItems]);
    const openBatchDialog = useCallback((mode) => {
        setBatchDialogMode(mode);
        setBatchParentId('');
        setBatchTier('public');
        setBatchGroups([]);
        setBatchDialogOpen(true);
    }, []);
    const handleBatchDelete = useCallback(async () => {
        if (selectedIds.size === 0)
            return;
        setSaving(true);
        setError(null);
        try {
            const ids = Array.from(selectedIds);
            const result = await deleteNav(ids).unwrap();
            if (result.success) {
                setBatchDialogOpen(false);
                setSelectedIds(new Set());
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
                // RTKQ invalidatesTags:['Navigation'] auto-refetches
            }
            else {
                throw new Error(result.error ?? 'Batch delete failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setSaving(false);
        }
    }, [selectedIds, deleteNav]);
    const handleBatchAssign = useCallback(async () => {
        if (selectedIds.size === 0 || !batchDialogMode)
            return;
        setSaving(true);
        setError(null);
        try {
            const ids = Array.from(selectedIds);
            const updates = ids.flatMap((id) => {
                const orig = flatItems.find((i) => i.id === id);
                if (!orig)
                    return [];
                const patch = {};
                if (batchDialogMode === 'parent')
                    patch.parentId = batchParentId || null;
                if (batchDialogMode === 'tier')
                    patch.authTier = batchTier;
                if (batchDialogMode === 'groups')
                    patch.requiredGroups = batchGroups.join(',');
                return { ...orig, ...patch };
            }).filter(Boolean);
            const result = await updateNav({ items: updates }).unwrap();
            if (result.success) {
                setBatchDialogOpen(false);
                setSelectedIds(new Set());
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
                // RTKQ invalidatesTags:['Navigation'] auto-refetches
            }
            else {
                throw new Error(result.error ?? 'Batch update failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setSaving(false);
        }
    }, [selectedIds, batchDialogMode, batchParentId, batchTier, batchGroups, flatItems, updateNav]);
    // ── Drag-to-reorder helpers ──────────────────────────
    const moveItem = useCallback((fromIdx, toIdx) => {
        if (fromIdx === toIdx)
            return;
        const updated = [...flatItems];
        const [moved] = updated.splice(fromIdx, 1);
        updated.splice(toIdx, 0, moved);
        // Re-assign sort orders
        const reordered = updated.map((item, i) => ({ ...item, sortOrder: i }));
        setFlatItems(reordered);
    }, [flatItems]);
    const handleDrop = useCallback(async () => {
        if (dragIndex === null || dropIndex === null || dragIndex === dropIndex)
            return;
        setSaving(true);
        setError(null);
        try {
            const updated = [...flatItems];
            const [moved] = updated.splice(dragIndex, 1);
            updated.splice(dropIndex, 0, moved);
            const reordered = updated.map((item, i) => ({ ...item, sortOrder: i }));
            const payload = reordered.map(({ depth: _, ...rest }) => rest);
            const result = await updateNav({ items: payload }).unwrap();
            if (result.success) {
                setFlatItems(reordered);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }
            else {
                throw new Error(result.error ?? 'Reorder failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setSaving(false);
            setDragIndex(null);
            setDropIndex(null);
        }
    }, [dragIndex, dropIndex, flatItems, updateNav]);
    // ── Render tree row ──────────────────────────────────
    /** Check whether any item in the list has this item as its parent. */
    const hasChildren = useCallback((itemId) => flatItems.some((i) => i.parentId === itemId), [flatItems]);
    function renderRow(item, idx) {
        const isDrag = dragIndex === idx;
        const isDrop = dropIndex === idx;
        return (_jsxs(Paper, { draggable: true, onDragStart: () => setDragIndex(idx), onDragOver: (e) => { e.preventDefault(); setDropIndex(idx); }, onDragEnd: handleDrop, sx: {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                mb: 0.5,
                bgcolor: isDrag ? 'action.selected' : isDrop ? 'action.hover' : 'transparent',
                border: '1px solid',
                borderColor: isDrop ? 'primary.main' : 'divider',
                opacity: isDrag ? 0.5 : 1,
                cursor: 'grab',
                ml: item.depth * 3,
                '&:hover': { bgcolor: 'action.hover' },
            }, children: [_jsx(Checkbox, { size: "small", checked: selectedIds.has(item.id), onChange: () => toggleSelect(item.id), onClick: (e) => e.stopPropagation(), sx: { p: 0.25 } }), _jsx(DragIndicatorIcon, { fontSize: "small", color: "disabled", sx: { cursor: 'grab', flexShrink: 0 } }), _jsx(Box, { sx: { flexShrink: 0, color: 'text.secondary', display: 'flex', alignItems: 'center' }, children: item.icon ? (_jsx(NavIcon, { name: item.icon })) : hasChildren(item.id) || (!item.path && !item.parentId) ? (_jsx(FolderIcon, { fontSize: "small" })) : item.path?.startsWith('http') ? (_jsx(Typography, { variant: "caption", sx: { fontSize: '0.9rem', lineHeight: 1 }, children: "\uD83D\uDD17" })) : (_jsx(InsertDriveFileIcon, { fontSize: "small" })) }), _jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: item.title }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: item.path || '(no path)' })] }), item.isDefault ? (_jsx(Chip, { label: "Default", size: "small", color: "primary", variant: "filled", sx: { height: 20, fontSize: '0.65rem' } })) : item.path && !item.path.startsWith('http') ? (_jsx(Chip, { label: "Set Default", size: "small", variant: "outlined", clickable: true, onClick: () => handleSetDefault(item), sx: { height: 20, fontSize: '0.65rem', cursor: 'pointer' } })) : null, _jsx(Chip, { label: item.authTier, size: "small", variant: "outlined", sx: { height: 20, fontSize: '0.65rem' } }), item.requiredGroups ? (_jsx(Chip, { label: item.requiredGroups, size: "small", color: "info", variant: "outlined", sx: { height: 20, fontSize: '0.65rem' } })) : null, _jsx(IconButton, { size: "small", onClick: () => openEdit(item), children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(item.id), children: _jsx(DeleteIcon, { fontSize: "small" }) })] }, item.id));
    }
    if (navLoading) {
        return _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) });
    }
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Paper, { variant: "outlined", sx: { p: 3 }, children: [_jsxs(Stack, { direction: "row", sx: { justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Navigation Manager" }), _jsx(Button, { variant: "contained", size: "small", startIcon: _jsx(AddIcon, {}), onClick: () => setCreateDialogOpen(true), children: "Add Item" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Drag items to reorder. Items with children act as folder headers. Use the edit dialog to nest items under a parent or assign security group access." }), error ? _jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error }) : null, success ? _jsx(Alert, { severity: "success", icon: _jsx(CheckCircleIcon, {}), sx: { mb: 2 }, children: "Saved." }) : null, selectedIds.size > 0 ? (_jsxs(Paper, { variant: "outlined", sx: { p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', bgcolor: 'action.selected' }, children: [_jsxs(Typography, { variant: "caption", sx: { fontWeight: 600, mr: 1 }, children: [selectedIds.size, " selected"] }), _jsx(Button, { size: "small", variant: "outlined", color: "error", onClick: () => openBatchDialog('delete'), children: "Delete" }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => openBatchDialog('parent'), children: "Assign Parent" }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => openBatchDialog('tier'), children: "Assign Auth Tier" }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => openBatchDialog('groups'), children: "Assign Groups" }), _jsx(Box, { sx: { flex: 1 } }), _jsx(Button, { size: "small", onClick: selectAll, children: "Select All" }), _jsx(Button, { size: "small", onClick: clearSelection, children: "Clear" })] })) : null, flatItems.length === 0 ? (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { py: 4, textAlign: 'center' }, children: "No navigation items yet. Click \"Add Item\" to create the first one." })) : (_jsx(Box, { sx: { maxHeight: 600, overflow: 'auto' }, children: flatItems.map((item, idx) => renderRow(item, idx)) }))] }), _jsxs(Dialog, { open: createDialogOpen, onClose: () => setCreateDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Add Navigation Item" }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, sx: { mt: 1 }, children: [_jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Type" }), _jsxs(Select, { value: newType, label: "Type", onChange: (e) => setNewType(e.target.value), children: [_jsx(MenuItem, { value: "page", children: _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(InsertDriveFileIcon, { fontSize: "small" }), _jsx("span", { children: "Page \u2014 internal route" })] }) }), _jsx(MenuItem, { value: "folder", children: _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(FolderIcon, { fontSize: "small" }), _jsx("span", { children: "Folder \u2014 group children, no path" })] }) }), _jsx(MenuItem, { value: "link", children: _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx("span", { children: "\uD83D\uDD17" }), _jsx("span", { children: "External Link \u2014 full URL" })] }) })] })] }), _jsx(TextField, { label: "Title", value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: newType === 'folder' ? 'e.g. Reports' : 'e.g. Dashboard', fullWidth: true, required: true }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "create-icon-label", children: "Icon (optional)" }), _jsxs(Select, { labelId: "create-icon-label", label: "Icon (optional)", value: newIcon, onChange: (e) => setNewIcon(e.target.value), renderValue: (selected) => {
                                                if (!selected)
                                                    return _jsx("em", { children: "\u2014 No icon \u2014" });
                                                return (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(NavIcon, { name: selected, fontSize: "small" }), _jsx("span", { children: selected })] }));
                                            }, children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "\u2014 No icon \u2014" }) }), NAV_ICON_NAMES.map((name) => (_jsx(MenuItem, { value: name, children: _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(NavIcon, { name: name, fontSize: "small" }), _jsx("span", { children: name })] }) }, name)))] })] }), newType !== 'folder' ? (_jsx(TextField, { label: newType === 'link' ? 'URL' : 'Path', value: newPath, onChange: (e) => setNewPath(e.target.value), placeholder: newType === 'link' ? 'https://example.com' : '/dashboard', fullWidth: true, helperText: newType === 'link'
                                        ? 'Full URL including https://'
                                        : 'Internal route path. Leave empty to auto-generate from title.' })) : (_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Folders act as grouping headers with no navigable path. Add children to create sub-navigation." })), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Parent Item" }), _jsxs(Select, { value: newParentId, label: "Parent Item", onChange: (e) => setNewParentId(e.target.value), children: [_jsx(MenuItem, { value: "", children: "\u2014 Root level \u2014" }), flatItems.map((item) => (_jsxs(MenuItem, { value: item.id, children: ['  '.repeat(item.depth), item.title] }, item.id)))] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Auth Tier" }), _jsxs(Select, { value: newTier, label: "Auth Tier", onChange: (e) => setNewTier(e.target.value), children: [_jsx(MenuItem, { value: "public", children: "Public" }), _jsx(MenuItem, { value: "pin", children: "PIN" }), _jsx(MenuItem, { value: "google", children: "Google" })] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "create-req-groups-label", children: "Required Groups" }), _jsx(Select, { labelId: "create-req-groups-label", label: "Required Groups", multiple: true, value: newRequiredGroups, onChange: (e) => setNewRequiredGroups(e.target.value), renderValue: (selected) => selected.length === 0
                                                ? '— None —'
                                                : selected.map((c) => allSecurityGroups.find((g) => g.code === c)?.name ?? c).join(', '), children: allSecurityGroups.map((g) => (_jsxs(MenuItem, { value: g.code, children: [_jsx(Checkbox, { checked: newRequiredGroups.includes(g.code), size: "small" }), _jsx(ListItemText, { primary: g.name, secondary: g.code })] }, g.code))) })] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setCreateDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "contained", disabled: !newTitle.trim() || saving, onClick: handleCreate, children: saving ? 'Creating...' : 'Create' })] })] }), _jsxs(Dialog, { open: editDialogOpen, onClose: () => setEditDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Edit Navigation Item" }), editingItem ? (_jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2, sx: { mt: 1 }, children: [_jsx(TextField, { label: "Title", value: editingItem.title, onChange: (e) => setEditingItem((p) => p ? { ...p, title: e.target.value } : p), fullWidth: true }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "edit-icon-label", children: "Icon (optional)" }), _jsxs(Select, { labelId: "edit-icon-label", label: "Icon (optional)", value: editingItem.icon ?? '', onChange: (e) => setEditingItem((p) => p ? { ...p, icon: e.target.value } : p), renderValue: (selected) => {
                                                if (!selected)
                                                    return _jsx("em", { children: "\u2014 No icon \u2014" });
                                                return (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(NavIcon, { name: selected, fontSize: "small" }), _jsx("span", { children: selected })] }));
                                            }, children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "\u2014 No icon \u2014" }) }), NAV_ICON_NAMES.map((name) => (_jsx(MenuItem, { value: name, children: _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(NavIcon, { name: name, fontSize: "small" }), _jsx("span", { children: name })] }) }, name)))] })] }), _jsx(TextField, { label: "Path", value: editingItem.path, onChange: (e) => setEditingItem((p) => p ? { ...p, path: e.target.value } : p), fullWidth: true, placeholder: "/dashboard" }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Parent Item" }), _jsxs(Select, { value: editingItem.parentId ?? '', label: "Parent Item", onChange: (e) => setEditingItem((p) => p ? { ...p, parentId: e.target.value || null } : p), children: [_jsx(MenuItem, { value: "", children: "\u2014 Root level \u2014" }), flatItems.filter((i) => i.id !== editingItem.id).map((item) => (_jsxs(MenuItem, { value: item.id, children: ['  '.repeat(item.depth), item.title] }, item.id)))] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Auth Tier" }), _jsxs(Select, { value: editingItem.authTier, label: "Auth Tier", onChange: (e) => setEditingItem((p) => p ? { ...p, authTier: e.target.value } : p), children: [_jsx(MenuItem, { value: "public", children: "Public" }), _jsx(MenuItem, { value: "pin", children: "PIN" }), _jsx(MenuItem, { value: "google", children: "Google" })] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "edit-req-groups-label", children: "Required Groups" }), _jsx(Select, { labelId: "edit-req-groups-label", label: "Required Groups", multiple: true, value: (editingItem.requiredGroups ?? '').split(',').filter(Boolean), onChange: (e) => setEditingItem((p) => p ? { ...p, requiredGroups: e.target.value.join(',') } : p), renderValue: (selected) => selected.length === 0
                                                ? '— None —'
                                                : selected.map((c) => allSecurityGroups.find((g) => g.code === c)?.name ?? c).join(', '), children: allSecurityGroups.map((g) => {
                                                const selected = (editingItem.requiredGroups ?? '').split(',').filter(Boolean);
                                                return (_jsxs(MenuItem, { value: g.code, children: [_jsx(Checkbox, { checked: selected.includes(g.code), size: "small" }), _jsx(ListItemText, { primary: g.name, secondary: g.code })] }, g.code));
                                            }) })] }), editingItem && flatItems.some((i) => i.parentId === editingItem.id) ? (_jsx(FormControlLabel, { control: _jsx(Switch, { checked: applyRecursive, onChange: (e) => setApplyRecursive(e.target.checked) }), label: "Apply to all children recursively" })) : null, _jsx(FormControlLabel, { control: _jsx(Switch, { checked: editingItem.isVisible, onChange: (e) => setEditingItem((p) => p ? { ...p, isVisible: e.target.checked } : p) }), label: "Visible in navigation" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: editingItem.isDynamic, onChange: (e) => setEditingItem((p) => p ? { ...p, isDynamic: e.target.checked } : p) }), label: "Dynamic route /[slug]" })] }) })) : null, _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setEditDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "contained", disabled: saving, onClick: handleEditSave, startIcon: saving ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(SaveIcon, {}), children: "Save" })] })] }), _jsxs(Dialog, { open: batchDialogOpen, onClose: () => setBatchDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: batchDialogMode === 'delete' ? `Delete ${selectedIds.size} item(s)?` :
                            batchDialogMode === 'parent' ? `Assign parent to ${selectedIds.size} item(s)` :
                                batchDialogMode === 'tier' ? `Assign auth tier to ${selectedIds.size} item(s)` :
                                    batchDialogMode === 'groups' ? `Assign groups to ${selectedIds.size} item(s)` : '' }), _jsxs(DialogContent, { dividers: true, children: [batchDialogMode === 'delete' ? (_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["This will delete ", selectedIds.size, " navigation item(s). Children of deleted items will be moved to root level."] })) : null, batchDialogMode === 'parent' ? (_jsxs(FormControl, { fullWidth: true, size: "small", sx: { mt: 1 }, children: [_jsx(InputLabel, { children: "Parent Item" }), _jsxs(Select, { value: batchParentId, label: "Parent Item", onChange: (e) => setBatchParentId(e.target.value), children: [_jsx(MenuItem, { value: "", children: "\u2014 Root level \u2014" }), flatItems
                                                .filter((i) => !selectedIds.has(i.id))
                                                .map((item) => (_jsxs(MenuItem, { value: item.id, children: ['  '.repeat(item.depth), item.title] }, item.id)))] })] })) : null, batchDialogMode === 'tier' ? (_jsxs(FormControl, { fullWidth: true, size: "small", sx: { mt: 1 }, children: [_jsx(InputLabel, { children: "Auth Tier" }), _jsxs(Select, { value: batchTier, label: "Auth Tier", onChange: (e) => setBatchTier(e.target.value), children: [_jsx(MenuItem, { value: "public", children: "Public" }), _jsx(MenuItem, { value: "pin", children: "PIN" }), _jsx(MenuItem, { value: "google", children: "Google" })] })] })) : null, batchDialogMode === 'groups' ? (_jsxs(FormControl, { fullWidth: true, size: "small", sx: { mt: 1 }, children: [_jsx(InputLabel, { id: "batch-groups-label", children: "Required Groups" }), _jsx(Select, { labelId: "batch-groups-label", label: "Required Groups", multiple: true, value: batchGroups, onChange: (e) => setBatchGroups(e.target.value), renderValue: (selected) => selected.length === 0
                                            ? '— None —'
                                            : selected.map((c) => allSecurityGroups.find((g) => g.code === c)?.name ?? c).join(', '), children: allSecurityGroups.map((g) => (_jsxs(MenuItem, { value: g.code, children: [_jsx(Checkbox, { checked: batchGroups.includes(g.code), size: "small" }), _jsx(ListItemText, { primary: g.name, secondary: g.code })] }, g.code))) })] })) : null] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setBatchDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "contained", color: batchDialogMode === 'delete' ? 'error' : 'primary', disabled: saving, onClick: batchDialogMode === 'delete' ? handleBatchDelete : handleBatchAssign, startIcon: saving ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : null, children: saving ? 'Saving...' : batchDialogMode === 'delete' ? 'Delete' : 'Apply' })] })] })] }));
}
