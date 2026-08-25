'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { NavIcon, NAV_ICON_NAMES } from '@/components/shared/nav-icon';
import {
  parseAuthTiers,
  serializeAuthTiers,
} from '@/lib/auth/tier-access';
import type { AuthTier } from '@/lib/page-catalog';
import {
  useGetNavigationQuery,
  useCreateNavigationItemMutation,
  useUpdateNavigationItemsMutation,
  useDeleteNavigationItemsMutation,
  useReconcileNavigationMutation,
  useListAdminGroupsQuery,
} from '@/store/apis/admin-api';

const AUTH_TIER_OPTIONS: { value: AuthTier; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'pin', label: 'PIN' },
  { value: 'google', label: 'Google' },
];

function formatAuthTierLabel(value: string): string {
  return parseAuthTiers(value)
    .map((t) => AUTH_TIER_OPTIONS.find((o) => o.value === t)?.label ?? t)
    .join(', ');
}

// ── Types ──────────────────────────────────────────────

interface NavItem {
  id: string;
  parentId: string | null;
  sortOrder: number;
  title: string;
  path: string;
  icon: string;
  authTier: string;
  requiredGroups: string;
  isVisible: boolean;
  isDynamic: boolean;
  isDefault: boolean;
  children: NavItem[];
}

interface FlatItem {
  [key: string]: unknown;
  id: string;
  parentId: string | null;
  sortOrder: number;
  title: string;
  path: string;
  icon: string;
  authTier: string;
  requiredGroups: string;
  isVisible: boolean;
  isDynamic: boolean;
  isDefault: boolean;
}

// ── Helpers ────────────────────────────────────────────

function flattenTree(items: NavItem[], depth = 0): (FlatItem & { depth: number })[] {
  const result: (FlatItem & { depth: number })[] = [];
  for (const item of items) {
    result.push({ ...item, depth });
    if (item.children.length > 0) {
      result.push(...flattenTree(item.children, depth + 1));
    }
  }
  return result;
}

function collectDescendantIds(items: (FlatItem & { depth: number })[], parentId: string): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.parentId === parentId) {
      ids.push(item.id);
      ids.push(...collectDescendantIds(items, item.id));
    }
  }
  return ids;
}

// ── Component ──────────────────────────────────────────

interface NavigationManagerProps {
  /** Platform-admin cross-tenant browse scope. Omitted for a tenant's own admin panel. */
  tenantSlug?: string;
  appId?: string | null;
}

export function NavigationManager({ tenantSlug, appId }: NavigationManagerProps = {}) {
  const [, setItems] = useState<NavItem[]>([]);
  const [flatItems, setFlatItems] = useState<(FlatItem & { depth: number })[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<FlatItem | null>(null);
  const [originalEditingItem, setOriginalEditingItem] = useState<FlatItem | null>(null);
  const [applyRecursive, setApplyRecursive] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // ── Collapse / expand (parent items) ─────────────────
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Multi-select ──────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchDialogMode, setBatchDialogMode] = useState<'delete' | 'parent' | 'tier' | 'groups' | null>(null);
  const [batchParentId, setBatchParentId] = useState<string>('');
  const [batchTier, setBatchTier] = useState<AuthTier[]>(['public']);
  const [batchGroups, setBatchGroups] = useState<string[]>([]);

  // ── Dedup / reconcile ──────────────────────────────────
  const [reconcileSummary, setReconcileSummary] = useState<string | null>(null);

  // ── RTK Query: navigation ─────────────────────────────
  // Cross-tenant browsing (tenantSlug/appId) is enforced server-side to
  // platform admins only — a tenant's own admin panel omits both and sees
  // its own deployment's items exactly as before.
  const { data: navData, isLoading: navLoading, isError: navError, error: navQueryError } = useGetNavigationQuery(
    tenantSlug ? { tenantSlug, appId: appId ?? undefined } : undefined,
  );

  useEffect(() => {
    if (navData?.success) {
      const navItems = (navData.data as { items?: NavItem[] })?.items ?? [];
      setItems(navItems);
      setFlatItems(flattenTree(navItems));
      setError(null);
    } else if (navData && navData.success === false) {
      setError(navData.error ?? 'Failed to load navigation');
    }
  }, [navData]);

  useEffect(() => {
    if (navError) {
      const msg =
        navQueryError && typeof navQueryError === 'object' && 'status' in navQueryError
          ? `Failed to load navigation (${String((navQueryError as { status: unknown }).status)})`
          : 'Failed to load navigation';
      setError(msg);
    }
  }, [navError, navQueryError]);

  // ── RTK Query: security groups ────────────────────────
  const { data: groupsData } = useListAdminGroupsQuery();
  const [allSecurityGroups, setAllSecurityGroups] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    if (groupsData?.success && groupsData.data?.groups) {
      setAllSecurityGroups(
        groupsData.data.groups.map((g) => ({ code: g.code, name: g.name })),
      );
    }
  }, [groupsData]);

  // ── RTK Query: mutations ──────────────────────────────
  // Wrapped so every call site automatically routes to this tenant/app's own
  // database (see admin/navigation/route.ts) without touching each call site.
  const [createNavRaw] = useCreateNavigationItemMutation();
  const [updateNavRaw] = useUpdateNavigationItemsMutation();
  const [deleteNavRaw] = useDeleteNavigationItemsMutation();
  const [reconcileNavRaw] = useReconcileNavigationMutation();
  const createNav = useCallback(
    (body: Record<string, unknown>) => createNavRaw({ ...body, tenantSlug, appId: appId ?? undefined }),
    [createNavRaw, tenantSlug, appId],
  );
  const updateNav = useCallback(
    (body: { items: Record<string, unknown>[] }) => updateNavRaw({ ...body, tenantSlug, appId: appId ?? undefined }),
    [updateNavRaw, tenantSlug, appId],
  );
  const deleteNav = useCallback(
    (ids: string[]) => deleteNavRaw({ ids, tenantSlug, appId: appId ?? undefined }),
    [deleteNavRaw, tenantSlug, appId],
  );

  const handleReconcileNavigation = useCallback(async () => {
    setSaving(true);
    setError(null);
    setReconcileSummary(null);
    try {
      const result = await reconcileNavRaw(
        tenantSlug ? { tenantSlug, appId: appId ?? undefined } : undefined,
      ).unwrap();
      if (!result.success) {
        throw new Error(result.error ?? 'Reconcile failed');
      }
      const data = result.data as {
        deleted?: number;
        seeded?: number;
        hierarchyUpdated?: number;
        sheetsSynced?: number;
      };
      const deleted = data.deleted ?? 0;
      const seeded = data.seeded ?? 0;
      const hierarchyUpdated = data.hierarchyUpdated ?? 0;
      setReconcileSummary(
        `Removed ${deleted} duplicate(s), seeded ${seeded} default item(s), nested ${hierarchyUpdated} under Admin, synced ${data.sheetsSynced ?? 0} sheet page(s).`,
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [reconcileNavRaw, tenantSlug, appId]);

  // ── Create ────────────────────────────────────────────
  const [newTitle, setNewTitle] = useState('');
  const [newPath, setNewPath] = useState('');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newTier, setNewTier] = useState<AuthTier[]>(['public']);
  const [newType, setNewType] = useState<'folder' | 'page' | 'link'>('page');
  const [newRequiredGroups, setNewRequiredGroups] = useState<string[]>([]);
  const [newIcon, setNewIcon] = useState('');

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      let path = newPath.trim();
      // Auto-set path based on type
      if (newType === 'folder') path = '';
      if (newType === 'page' && !path) path = `/${newTitle.trim().toLowerCase().replace(/\s+/g, '-')}`;

      const result = await createNav({
        title: newTitle.trim(),
        path,
        parentId: newParentId || null,
        authTier: serializeAuthTiers(newTier),
        icon: newIcon,
        requiredGroups: newRequiredGroups.join(','),
        ...(tenantSlug ? { tenantSlug } : {}),
        ...(appId ? { appId } : {}),
      }).unwrap();
      if (result.success) {
        setCreateDialogOpen(false);
        setNewTitle('');
        setNewPath('');
        setNewParentId('');
        setNewType('page');
        setNewTier(['public']);
        setNewRequiredGroups([]);
        setNewIcon('');
        // RTKQ invalidatesTags:['Navigation'] auto-refetches
      } else {
        throw new Error(result.error ?? 'Create failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [newTitle, newPath, newParentId, newTier, newType, newRequiredGroups, newIcon, createNav, tenantSlug, appId]);

  // ── Edit ──────────────────────────────────────────────
  const openEdit = useCallback((item: FlatItem) => {
    setEditingItem({ ...item });
    setOriginalEditingItem({ ...item });
    setApplyRecursive(false);
    setEditDialogOpen(true);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingItem) return;
    setSaving(true);
    setError(null);
    try {
      const itemsToSave: FlatItem[] = [editingItem];

      // When "Apply to children" is checked, cascade changed properties to all descendants
      if (applyRecursive && originalEditingItem) {
        const descIds = collectDescendantIds(flatItems, editingItem.id);
        const changedProps: Record<string, unknown> = {};
        for (const key of ['authTier', 'requiredGroups', 'isVisible', 'icon'] as const) {
          if (editingItem[key] !== originalEditingItem[key]) {
            changedProps[key] = editingItem[key];
          }
        }
        if (Object.keys(changedProps).length > 0) {
          for (const id of descIds) {
            const original = flatItems.find((i) => i.id === id);
            if (original) {
              itemsToSave.push({ ...original, ...changedProps } as FlatItem);
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
      } else {
        throw new Error(result.error ?? 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [editingItem, originalEditingItem, applyRecursive, flatItems, updateNav]);

  // ── Set as default route ──────────────────────────────
  const handleSetDefault = useCallback(async (item: FlatItem) => {
    setSaving(true);
    setError(null);
    try {
      const result = await updateNav({ items: [{ id: item.id, isDefault: true }] }).unwrap();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        // RTKQ invalidatesTags:['Navigation'] auto-refetches
      } else {
        throw new Error(result.error ?? 'Failed to set default');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [updateNav]);

  // ── Delete ────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    if (!globalThis.window.confirm('Delete this nav item? Children will be moved to root level.')) return;
    setError(null);
    try {
      const result = await deleteNav([id]).unwrap();
      if (result.success) {
        // RTKQ invalidatesTags:['Navigation'] auto-refetches
      } else {
        throw new Error(result.error ?? 'Delete failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [deleteNav]);

  // ── Multi-select helpers ─────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const selectAll = useCallback(() => setSelectedIds(new Set(flatItems.map((i) => i.id))), [flatItems]);

  const openBatchDialog = useCallback((mode: 'delete' | 'parent' | 'tier' | 'groups') => {
    setBatchDialogMode(mode);
    setBatchParentId('');
    setBatchTier('public');
    setBatchGroups([]);
    setBatchDialogOpen(true);
  }, []);

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
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
      } else {
        throw new Error(result.error ?? 'Batch delete failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [selectedIds, deleteNav]);

  const handleBatchAssign = useCallback(async () => {
    if (selectedIds.size === 0 || !batchDialogMode) return;
    setSaving(true);
    setError(null);
    try {
      const ids = Array.from(selectedIds);
      const updates: FlatItem[] = ids.flatMap((id) => {
        const orig = flatItems.find((i) => i.id === id);
        if (!orig) return [];
        const patch: Partial<FlatItem> = {};
        if (batchDialogMode === 'parent') patch.parentId = batchParentId || null;
        if (batchDialogMode === 'tier') patch.authTier = serializeAuthTiers(batchTier);
        if (batchDialogMode === 'groups') patch.requiredGroups = batchGroups.join(',');
        return { ...orig, ...patch };
      }).filter(Boolean);

      const result = await updateNav({ items: updates }).unwrap();
      if (result.success) {
        setBatchDialogOpen(false);
        setSelectedIds(new Set());
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        // RTKQ invalidatesTags:['Navigation'] auto-refetches
      } else {
        throw new Error(result.error ?? 'Batch update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [selectedIds, batchDialogMode, batchParentId, batchTier, batchGroups, flatItems, updateNav]);

  // ── Drag-to-reorder helpers ──────────────────────────
  const handleDrop = useCallback(async () => {
    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) return;
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
      } else {
        throw new Error(result.error ?? 'Reorder failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
      setDragIndex(null);
      setDropIndex(null);
    }
  }, [dragIndex, dropIndex, flatItems, updateNav]);

  // ── Render tree row ──────────────────────────────────
  /** Check whether any item in the list has this item as its parent. */
  const hasChildren = useCallback((itemId: string) => flatItems.some((i) => i.parentId === itemId), [flatItems]);

  /** Rows to render: skip items hidden under a collapsed parent, keeping original flat indices. */
  const visibleRows = useMemo(() => {
    const rows: { item: FlatItem & { depth: number }; flatIdx: number }[] = [];
    const blocked = new Set<string>();
    for (const [flatIdx, item] of flatItems.entries()) {
      const parentBlocked = item.parentId ? blocked.has(item.parentId) : false;
      if (!parentBlocked) rows.push({ item, flatIdx });
      if (hasChildren(item.id) && collapsedIds.has(item.id)) blocked.add(item.id);
    }
    return rows;
  }, [flatItems, collapsedIds, hasChildren]);

  function renderRow(item: FlatItem & { depth: number }, idx: number) {
    const isDrag = dragIndex === idx;
    const isDrop = dropIndex === idx;
    const isHidden = !item.isVisible;
    const isExternalPath = Boolean(item.path?.startsWith('http'));
    const internalPath = item.path && !isExternalPath ? (item.path as Route) : null;
    const linkSx = {
      color: 'inherit',
      textDecoration: 'none',
      '&:hover': { textDecoration: 'underline', color: 'primary.main' },
    } as const;

    return (
      <Paper
        key={item.id}
        draggable
        onDragStart={() => setDragIndex(idx)}
        onDragOver={(e) => { e.preventDefault(); setDropIndex(idx); }}
        onDragEnd={handleDrop}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          mb: 0.5,
          bgcolor: isDrag ? 'action.selected' : isDrop ? 'action.hover' : isHidden ? 'action.hover' : 'transparent',
          border: '1px solid',
          borderColor: isDrop ? 'primary.main' : isHidden ? 'warning.light' : 'divider',
          opacity: isDrag ? 0.5 : isHidden ? 0.72 : 1,
          cursor: 'grab',
          ml: { xs: Math.min(item.depth, 2) * 1.5, sm: item.depth * 3 },
          flexWrap: 'wrap',
          rowGap: 0.5,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          '&:hover': { bgcolor: 'action.hover' },
          '&:active': { bgcolor: 'action.selected' },
        }}
      >
        <Checkbox
          size="small"
          checked={selectedIds.has(item.id)}
          onChange={() => toggleSelect(item.id)}
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 0.5 }}
        />
        {hasChildren(item.id) ? (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); toggleCollapsed(item.id); }}
            sx={{ p: 0.5, flexShrink: 0 }}
            aria-label={collapsedIds.has(item.id) ? `Expand ${item.title}` : `Collapse ${item.title}`}
          >
            {collapsedIds.has(item.id) ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 28, flexShrink: 0 }} />
        )}
        <DragIndicatorIcon fontSize="small" color="disabled" sx={{ cursor: 'grab', flexShrink: 0 }} />
        {isHidden ? (
          <Tooltip title="Hidden from navigation drawer">
            <VisibilityOffOutlinedIcon fontSize="small" color="warning" sx={{ flexShrink: 0 }} />
          </Tooltip>
        ) : null}
        <Box sx={{ flexShrink: 0, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          {item.icon ? (
            <NavIcon name={item.icon} />
          ) : hasChildren(item.id) || (!item.path && !item.parentId) ? (
            <FolderIcon fontSize="small" />
          ) : item.path?.startsWith('http') ? (
            <Typography variant="caption" sx={{ fontSize: '0.9rem', lineHeight: 1 }}>🔗</Typography>
          ) : (
            <InsertDriveFileIcon fontSize="small" />
          )}
        </Box>
        <Box sx={{ flex: '1 1 140px', minWidth: 0 }}>
          {internalPath ? (
            <Link href={internalPath} style={linkSx}>
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 600, wordBreak: 'break-word', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              >
                {item.title}
                <OpenInNewIcon sx={{ fontSize: 14, opacity: 0.6, flexShrink: 0 }} />
              </Typography>
            </Link>
          ) : isExternalPath ? (
            <Typography
              variant="body2"
              component="a"
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 600, wordBreak: 'break-word', color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}
            >
              {item.title}
              <OpenInNewIcon sx={{ fontSize: 14, opacity: 0.6, flexShrink: 0 }} />
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
              {item.title}
            </Typography>
          )}
          {internalPath ? (
            <Link href={internalPath} style={linkSx}>
              <Typography
                variant="caption"
                color="text.secondary"
                component="span"
                sx={{ display: 'block', wordBreak: 'break-all', overflowWrap: 'anywhere', maxWidth: '100%' }}
              >
                {item.path}
              </Typography>
            </Link>
          ) : isExternalPath ? (
            <Typography
              variant="caption"
              color="text.secondary"
              component="a"
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block', wordBreak: 'break-all', overflowWrap: 'anywhere', maxWidth: '100%', color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}
            >
              {item.path}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', wordBreak: 'break-all', overflowWrap: 'anywhere', maxWidth: '100%' }}
            >
              {item.path || '(no path)'}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {item.isDefault ? (
            <Chip label="Default" size="small" color="primary" variant="filled" sx={{ height: 20, fontSize: { xs: '0.7rem', md: '0.75rem' } }} />
          ) : item.path && !item.path.startsWith('http') ? (
            <Chip
              label="Set Default"
              size="small"
              variant="outlined"
              clickable
              onClick={() => handleSetDefault(item)}
              sx={{ height: 20, fontSize: { xs: '0.7rem', md: '0.75rem' }, cursor: 'pointer' }}
            />
          ) : null}
          <Chip label={formatAuthTierLabel(item.authTier)} size="small" variant="outlined" sx={{ height: 20, fontSize: { xs: '0.7rem', md: '0.75rem' } }} />
          {item.requiredGroups ? (
            <Chip label={item.requiredGroups} size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: { xs: '0.7rem', md: '0.75rem' }, maxWidth: 160 }} />
          ) : null}
          <IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      </Paper>
    );
  }

  if (navLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3, overflow: 'hidden', maxWidth: '100%' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          useFlexGap
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 2,
            width: '100%',
            minWidth: 0,
            flexWrap: 'wrap',
            rowGap: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 0 }}>
            Navigation Manager
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', rowGap: 1 }}
          >
            <Tooltip title="Expand All">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setCollapsedIds(new Set())}
                  disabled={collapsedIds.size === 0}
                  aria-label="Expand All"
                >
                  <UnfoldMoreIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Collapse All">
              <IconButton
                size="small"
                onClick={() => setCollapsedIds(new Set(flatItems.filter((i) => hasChildren(i.id)).map((i) => i.id)))}
                aria-label="Collapse All"
              >
                <UnfoldLessIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={saving ? 'Reconciling...' : 'Remove Duplicates'}>
              <span>
                <IconButton
                  size="small"
                  color="warning"
                  onClick={handleReconcileNavigation}
                  disabled={saving}
                  aria-label={saving ? 'Reconciling...' : 'Remove Duplicates'}
                >
                  {saving ? <CircularProgress size={16} color="inherit" /> : <LayersClearIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Add Item">
              <IconButton
                size="small"
                color="primary"
                onClick={() => setCreateDialogOpen(true)}
                aria-label="Add Item"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag items to reorder. Items with children act as folder headers. 
          Use the edit dialog to nest items under a parent or assign security group access.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}
        {reconcileSummary ? (
          <Alert severity="info" sx={{ mb: 2 }} onClose={() => setReconcileSummary(null)}>
            {reconcileSummary}
          </Alert>
        ) : null}
        {success ? <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>Navigation reconciled.</Alert> : null}

        {/* Batch action toolbar */}
        {selectedIds.size > 0 ? (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', bgcolor: 'action.selected' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
              {selectedIds.size} selected
            </Typography>
            <Button size="small" variant="outlined" color="error" onClick={() => openBatchDialog('delete')}>
              Delete
            </Button>
            <Button size="small" variant="outlined" onClick={() => openBatchDialog('parent')}>
              Assign Parent
            </Button>
            <Button size="small" variant="outlined" onClick={() => openBatchDialog('tier')}>
              Assign Auth Tier
            </Button>
            <Button size="small" variant="outlined" onClick={() => openBatchDialog('groups')}>
              Assign Groups
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button size="small" onClick={selectAll}>Select All</Button>
            <Button size="small" onClick={clearSelection}>Clear</Button>
          </Paper>
        ) : null}

        {flatItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No navigation items yet. Click "Add Item" to create the first one.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            {visibleRows.map(({ item, flatIdx }) => renderRow(item, flatIdx))}
          </Box>
        )}
      </Paper>

      {/* ── Create dialog ─────────────────────────────── */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Navigation Item</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Type selector */}
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={newType} label="Type" onChange={(e) => setNewType(e.target.value as 'folder' | 'page' | 'link')}>
                <MenuItem value="page">
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <InsertDriveFileIcon fontSize="small" />
                    <span>Page — internal route</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="folder">
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <FolderIcon fontSize="small" />
                    <span>Folder — group children, no path</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="link">
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>🔗</span>
                    <span>External Link — full URL</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={newType === 'folder' ? 'e.g. Reports' : 'e.g. Dashboard'}
              fullWidth
              required
            />

            {/* Icon selector */}
            <FormControl fullWidth size="small">
              <InputLabel id="create-icon-label">Icon (optional)</InputLabel>
              <Select
                labelId="create-icon-label"
                label="Icon (optional)"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) return <em>— No icon —</em>;
                  return (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <NavIcon name={selected as string} fontSize="small" />
                      <span>{selected as string}</span>
                    </Stack>
                  );
                }}
              >
                <MenuItem value=""><em>— No icon —</em></MenuItem>
                {NAV_ICON_NAMES.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <NavIcon name={name} fontSize="small" />
                      <span>{name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {newType !== 'folder' ? (
              <TextField
                label={newType === 'link' ? 'URL' : 'Path'}
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder={newType === 'link' ? 'https://example.com' : '/dashboard'}
                fullWidth
                helperText={
                  newType === 'link'
                    ? 'Full URL including https://'
                    : 'Internal route path. Leave empty to auto-generate from title.'
                }
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Folders act as grouping headers with no navigable path. Add children to create sub-navigation.
              </Typography>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Parent Item</InputLabel>
              <Select value={newParentId} label="Parent Item" onChange={(e) => setNewParentId(e.target.value)}>
                <MenuItem value="">— Root level —</MenuItem>
                {flatItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{'  '.repeat(item.depth)}{item.title}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="create-auth-tier-label">Auth Tier</InputLabel>
              <Select
                labelId="create-auth-tier-label"
                label="Auth Tier"
                multiple
                value={newTier}
                onChange={(e) => {
                  const next = e.target.value as AuthTier[];
                  setNewTier(next.length > 0 ? next : ['public']);
                }}
                renderValue={(selected) => formatAuthTierLabel((selected as AuthTier[]).join(','))}
              >
                {AUTH_TIER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Checkbox checked={newTier.includes(opt.value)} size="small" />
                    <ListItemText primary={opt.label} />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                Select one or more tiers. Multiple selections (e.g. PIN + Google) show the item only to those signed-in users. A single selection keeps minimum-tier behavior (Google also sees PIN/Public).
              </Typography>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="create-req-groups-label">Required Groups</InputLabel>
              <Select
                labelId="create-req-groups-label"
                label="Required Groups"
                multiple
                value={newRequiredGroups}
                onChange={(e) => setNewRequiredGroups(e.target.value as string[])}
                renderValue={(selected) =>
                  (selected as string[]).length === 0
                    ? '— None —'
                    : (selected as string[]).map((c) => allSecurityGroups.find((g) => g.code === c)?.name ?? c).join(', ')
                }
              >
                {allSecurityGroups.map((g) => (
                  <MenuItem key={g.code} value={g.code}>
                    <Checkbox checked={newRequiredGroups.includes(g.code)} size="small" />
                    <ListItemText primary={g.name} secondary={g.code} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!newTitle.trim() || saving} onClick={handleCreate}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit dialog ───────────────────────────────── */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Navigation Item</DialogTitle>
        {editingItem ? (
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Title" value={editingItem.title} onChange={(e) => setEditingItem((p) => p ? { ...p, title: e.target.value } : p)} fullWidth />

              {/* Icon selector in edit dialog */}
                <FormControl fullWidth size="small">
                <InputLabel id="edit-icon-label">Icon (optional)</InputLabel>
                <Select
                  labelId="edit-icon-label"
                  label="Icon (optional)"
                  value={editingItem.icon ?? ''}
                  onChange={(e) => setEditingItem((p) => p ? { ...p, icon: e.target.value } : p)}
                  renderValue={(selected) => {
                    if (!selected) return <em>— No icon —</em>;
                    return (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <NavIcon name={selected as string} fontSize="small" />
                        <span>{selected as string}</span>
                      </Stack>
                    );
                  }}
                >
                  <MenuItem value=""><em>— No icon —</em></MenuItem>
                  {NAV_ICON_NAMES.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <NavIcon name={name} fontSize="small" />
                        <span>{name}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField label="Path" value={editingItem.path} onChange={(e) => setEditingItem((p) => p ? { ...p, path: e.target.value } : p)} fullWidth placeholder="/dashboard" />
              <FormControl fullWidth size="small">
                <InputLabel>Parent Item</InputLabel>
                <Select value={editingItem.parentId ?? ''} label="Parent Item" onChange={(e) => setEditingItem((p) => p ? { ...p, parentId: e.target.value || null } : p)}>
                  <MenuItem value="">— Root level —</MenuItem>
                  {flatItems.filter((i) => i.id !== editingItem.id).map((item) => (
                    <MenuItem key={item.id} value={item.id}>{'  '.repeat(item.depth)}{item.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-auth-tier-label">Auth Tier</InputLabel>
                <Select
                  labelId="edit-auth-tier-label"
                  label="Auth Tier"
                  multiple
                  value={parseAuthTiers(editingItem.authTier)}
                  onChange={(e) => {
                    const next = e.target.value as AuthTier[];
                    setEditingItem((p) =>
                      p ? { ...p, authTier: serializeAuthTiers(next.length > 0 ? next : ['public']) } : p,
                    );
                  }}
                  renderValue={(selected) => formatAuthTierLabel((selected as AuthTier[]).join(','))}
                >
                  {AUTH_TIER_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Checkbox checked={parseAuthTiers(editingItem.authTier).includes(opt.value)} size="small" />
                      <ListItemText primary={opt.label} />
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                  Select one or more tiers. Multiple selections (e.g. PIN + Google) show the item only to those signed-in users. A single selection keeps minimum-tier behavior (Google also sees PIN/Public).
                </Typography>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-req-groups-label">Required Groups</InputLabel>
                <Select
                  labelId="edit-req-groups-label"
                  label="Required Groups"
                  multiple
                  value={(editingItem.requiredGroups ?? '').split(',').filter(Boolean)}
                  onChange={(e) => setEditingItem((p) => p ? { ...p, requiredGroups: (e.target.value as string[]).join(',') } : p)}
                  renderValue={(selected) =>
                    (selected as string[]).length === 0
                      ? '— None —'
                      : (selected as string[]).map((c) => allSecurityGroups.find((g) => g.code === c)?.name ?? c).join(', ')
                  }
                >
                  {allSecurityGroups.map((g) => {
                    const selected = (editingItem.requiredGroups ?? '').split(',').filter(Boolean);
                    return (
                      <MenuItem key={g.code} value={g.code}>
                        <Checkbox checked={selected.includes(g.code)} size="small" />
                        <ListItemText primary={g.name} secondary={g.code} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              {/* Apply changes recursively to all children */}
              {editingItem && flatItems.some((i) => i.parentId === editingItem.id) ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={applyRecursive}
                      onChange={(e) => setApplyRecursive(e.target.checked)}
                    />
                  }
                  label="Apply to all children recursively"
                />
              ) : null}

              <FormControlLabel control={<Switch checked={editingItem.isVisible} onChange={(e) => setEditingItem((p) => p ? { ...p, isVisible: e.target.checked } : p)} />} label="Visible in navigation" />
              <FormControlLabel control={<Switch checked={editingItem.isDynamic} onChange={(e) => setEditingItem((p) => p ? { ...p, isDynamic: e.target.checked } : p)} />} label="Dynamic route /[slug]" />
            </Stack>
          </DialogContent>
        ) : null}
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleEditSave} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Batch action dialog ────────────────────────── */}
      <Dialog open={batchDialogOpen} onClose={() => setBatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {batchDialogMode === 'delete' ? `Delete ${selectedIds.size} item(s)?` :
           batchDialogMode === 'parent' ? `Assign parent to ${selectedIds.size} item(s)` :
           batchDialogMode === 'tier' ? `Assign auth tier to ${selectedIds.size} item(s)` :
           batchDialogMode === 'groups' ? `Assign groups to ${selectedIds.size} item(s)` : ''}
        </DialogTitle>
        <DialogContent dividers>
          {batchDialogMode === 'delete' ? (
            <Typography variant="body2" color="text.secondary">
              This will delete {selectedIds.size} navigation item(s). Children of deleted items will be moved to root level.
            </Typography>
          ) : null}

          {batchDialogMode === 'parent' ? (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Parent Item</InputLabel>
              <Select value={batchParentId} label="Parent Item" onChange={(e) => setBatchParentId(e.target.value)}>
                <MenuItem value="">— Root level —</MenuItem>
                {flatItems
                  .filter((i) => !selectedIds.has(i.id))
                  .map((item) => (
                    <MenuItem key={item.id} value={item.id}>{'  '.repeat(item.depth)}{item.title}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          ) : null}

          {batchDialogMode === 'tier' ? (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="batch-auth-tier-label">Auth Tier</InputLabel>
              <Select
                labelId="batch-auth-tier-label"
                label="Auth Tier"
                multiple
                value={batchTier}
                onChange={(e) => {
                  const next = e.target.value as AuthTier[];
                  setBatchTier(next.length > 0 ? next : ['public']);
                }}
                renderValue={(selected) => formatAuthTierLabel((selected as AuthTier[]).join(','))}
              >
                {AUTH_TIER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Checkbox checked={batchTier.includes(opt.value)} size="small" />
                    <ListItemText primary={opt.label} />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                Select one or more tiers that may see these items.
              </Typography>
            </FormControl>
          ) : null}

          {batchDialogMode === 'groups' ? (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="batch-groups-label">Required Groups</InputLabel>
              <Select
                labelId="batch-groups-label"
                label="Required Groups"
                multiple
                value={batchGroups}
                onChange={(e) => setBatchGroups(e.target.value as string[])}
                renderValue={(selected) =>
                  (selected as string[]).length === 0
                    ? '— None —'
                    : (selected as string[]).map((c) => allSecurityGroups.find((g) => g.code === c)?.name ?? c).join(', ')
                }
              >
                {allSecurityGroups.map((g) => (
                  <MenuItem key={g.code} value={g.code}>
                    <Checkbox checked={batchGroups.includes(g.code)} size="small" />
                    <ListItemText primary={g.name} secondary={g.code} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={batchDialogMode === 'delete' ? 'error' : 'primary'}
            disabled={saving}
            onClick={batchDialogMode === 'delete' ? handleBatchDelete : handleBatchAssign}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Saving...' : batchDialogMode === 'delete' ? 'Delete' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
