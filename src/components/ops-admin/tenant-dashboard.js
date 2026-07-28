'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BuildIcon from '@mui/icons-material/Build';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useListTenantsQuery, useDeleteTenantMutation, useSeedTenantMutation, useMigrateTenantMutation, useDeployTenantMutation, } from '@/store/apis/tenant-api';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { TenantWizard } from '@/components/ops-admin/tenant-wizard';
import { TenantUserManager } from '@/components/ops-admin/tenant-user-manager';
import { EditTenantModal } from '@/components/ops-admin/edit-tenant-modal';
import { VercelConnectButton } from '@/components/ops-admin/vercel-connect-button';
const STATUS_COLORS = {
    draft: 'info',
    deploying: 'warning',
    live: 'success',
    error: 'error',
};
function TenantUrlLink({ tenant }) {
    if (tenant.appUrl) {
        return (_jsx(Button, { size: "small", variant: "text", href: tenant.appUrl, target: "_blank", rel: "noopener noreferrer", endIcon: _jsx(OpenInNewIcon, { fontSize: "small" }), sx: { fontSize: '0.75rem', maxWidth: '100%', justifyContent: 'flex-start' }, children: _jsx(Box, { component: "span", sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: tenant.appUrl.replace('https://', '') }) }));
    }
    if (tenant.status === 'live') {
        return (_jsx(Button, { size: "small", variant: "text", href: `https://${tenant.slug}.vercel.app`, target: "_blank", rel: "noopener noreferrer", endIcon: _jsx(OpenInNewIcon, { fontSize: "small" }), sx: { fontSize: '0.75rem', maxWidth: '100%', justifyContent: 'flex-start' }, children: _jsxs(Box, { component: "span", sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: [tenant.slug, ".vercel.app"] }) }));
    }
    return (_jsxs(Typography, { variant: "caption", color: "text.disabled", children: [tenant.slug, ".vercel.app"] }));
}
export function TenantDashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data, isLoading, isError, refetch } = useListTenantsQuery();
    const [deleteTenant, { isLoading: isDeleting }] = useDeleteTenantMutation();
    const [deleting, setDeleting] = useState(null);
    const [userManager, setUserManager] = useState(null);
    const [editor, setEditor] = useState(null);
    // Three-dot menu state — track which row's menu is open
    const [menuAnchor, setMenuAnchor] = useState(null);
    // Seed/migrate state
    const [seedTenant, { isLoading: isSeeding }] = useSeedTenantMutation();
    const [migrateTenant, { isLoading: isMigrating }] = useMigrateTenantMutation();
    const [deployToVercel, { isLoading: isDeploying }] = useDeployTenantMutation();
    const [snackbar, setSnackbar] = useState(null);
    // Delete confirmation dialog state
    const [confirmDelete, setConfirmDelete] = useState(null);
    const tenants = data?.data?.tenants ?? [];
    const handleDelete = async (slug) => {
        handleMenuClose();
        setConfirmDelete(null);
        setDeleting(slug);
        try {
            await deleteTenant(slug).unwrap();
            setSnackbar({ message: 'Tenant deleted successfully', severity: 'success' });
        }
        catch (err) {
            const msg = err && typeof err === 'object' && 'data' in err
                ? String(err.data?.error ?? 'Unknown error')
                : 'Failed to delete tenant';
            setSnackbar({ message: msg, severity: 'error' });
        }
        finally {
            setDeleting(null);
        }
    };
    const handleMenuOpen = (slug, el) => setMenuAnchor({ slug, el });
    const handleMenuClose = () => setMenuAnchor(null);
    const handleSeed = async (slug) => {
        handleMenuClose();
        try {
            const result = await seedTenant(slug).unwrap();
            setSnackbar({ message: `Tenant seeded: ${result.data?.pages ?? 0} pages, ${result.data?.navItems ?? 0} nav items`, severity: 'success' });
        }
        catch {
            setSnackbar({ message: 'Failed to seed tenant', severity: 'error' });
        }
    };
    const handleMigrate = async (slug) => {
        handleMenuClose();
        try {
            await migrateTenant(slug).unwrap();
            setSnackbar({ message: 'Tenant migration completed', severity: 'success' });
        }
        catch {
            setSnackbar({ message: 'Failed to migrate tenant', severity: 'error' });
        }
    };
    const handleDeploy = async (slug) => {
        handleMenuClose();
        try {
            const result = await deployToVercel(slug).unwrap();
            if (result.success) {
                setSnackbar({
                    message: `Deployed to Vercel — project created, ${result.data.envCount} env vars synced`,
                    severity: 'success',
                });
            }
            else {
                setSnackbar({ message: result.error || 'Failed to deploy', severity: 'error' });
            }
        }
        catch (err) {
            const msg = err?.data?.error || err?.error || 'Failed to deploy tenant';
            setSnackbar({ message: msg, severity: 'error' });
        }
    };
    // ── Deploy Hook: Check Status ──────────────────────────────
    const [checkingStatus, setCheckingStatus] = useState(null);
    const handleCheckStatus = async (slug) => {
        handleMenuClose();
        setCheckingStatus(slug);
        try {
            const res = await fetch(`/api/admin/tenants/${slug}/deploy/status`);
            const data = await res.json();
            if (data.success) {
                const status = data.data?.state || 'unknown';
                const url = data.data?.appUrl || `https://${slug}.vercel.app`;
                setSnackbar({
                    message: `🔍 ${slug}: deployment status = ${status} — ${url}`,
                    severity: status === 'READY' ? 'success' : 'error',
                });
            }
            else {
                setSnackbar({ message: data.error || 'Status check failed', severity: 'error' });
            }
        }
        catch {
            setSnackbar({ message: 'Failed to check deployment status', severity: 'error' });
        }
        finally {
            setCheckingStatus(null);
        }
    };
    // ── Deploy Hook: Trigger Deploy ────────────────────────────
    const [triggeringHook, setTriggeringHook] = useState(null);
    const handleTriggerHook = async (slug) => {
        handleMenuClose();
        setTriggeringHook(slug);
        try {
            // Get the deploy hook URL from tenant metadata
            const tenant = tenants.find(t => t.slug === slug);
            const cfg = tenant?.metadata?.config || {};
            const hookUrl = cfg.hooks?.deployHookUrl || '';
            if (!hookUrl) {
                setSnackbar({ message: '⚠️ No Deploy Hook URL configured. Set it in the tenant editor.', severity: 'error' });
                setTriggeringHook(null);
                return;
            }
            const res = await fetch(hookUrl, { method: 'POST' });
            const data = await res.json();
            if (data.job?.state) {
                setSnackbar({ message: `🚀 Deploy triggered via hook — job ${data.job.state}`, severity: 'success' });
                refetch();
            }
            else {
                setSnackbar({ message: 'Hook triggered, but response unexpected', severity: 'success' });
            }
        }
        catch {
            setSnackbar({ message: 'Failed to trigger deploy hook', severity: 'error' });
        }
        finally {
            setTriggeringHook(null);
        }
    };
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Paper, { variant: "outlined", sx: { p: { xs: 2, sm: 3 }, overflow: 'hidden' }, children: [_jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1.5, sx: { mb: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }, children: [_jsxs(Box, { sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Tenant Applications" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Manage registered tenant applications. Create new tenants, monitor deployment status, and configure settings." })] }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', flexShrink: 0, justifyContent: { xs: 'flex-end', sm: 'unset' } }, children: [_jsx(Tooltip, { title: "Refresh", children: _jsx(IconButton, { onClick: () => refetch(), size: "small", children: _jsx(RefreshIcon, {}) }) }), _jsx(VercelConnectButton, {}), _jsx(TenantWizard, {})] })] }), isLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, {}) })) : isError ? (_jsx(Alert, { severity: "error", children: "Failed to load tenants. The tenants table may need to be migrated \u2014 run seed or migrate first." })) : tenants.length === 0 ? (_jsxs(Box, { sx: { textAlign: 'center', py: 6 }, children: [_jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 2 }, children: "No tenants registered yet. Create your first tenant application to get started." }), _jsx(TenantWizard, {})] })) : isMobile ? (_jsx(Stack, { spacing: 1.5, children: tenants.map((t) => {
                            const tpl = getTemplate(t.template);
                            return (_jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsxs(Stack, { direction: "row", sx: { alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }, children: [_jsxs(Box, { sx: { minWidth: 0, flex: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: t.displayName }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block' }, children: t.slug })] }), _jsx(IconButton, { size: "small", onClick: (e) => handleMenuOpen(t.slug, e.currentTarget), "aria-label": `Actions for ${t.displayName}`, children: _jsx(MoreVertIcon, { fontSize: "small" }) })] }), _jsxs(Stack, { direction: "row", spacing: 0.75, sx: { mt: 1.5, flexWrap: 'wrap' }, useFlexGap: true, children: [_jsx(Chip, { label: tpl.label, size: "small", variant: "outlined" }), _jsx(Chip, { label: t.status, size: "small", color: STATUS_COLORS[t.status] ?? 'default' }), t.apiKey ? (_jsx(Chip, { label: "Licensed", size: "small", color: "success", variant: "outlined" })) : (_jsx(Chip, { label: "Unlicensed", size: "small", color: "warning", variant: "outlined" }))] }), _jsx(Box, { sx: { mt: 1.5, minWidth: 0 }, children: _jsx(TenantUrlLink, { tenant: t }) }), _jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block', mt: 1 }, children: ["Created ", new Date(t.createdAt).toLocaleDateString()] }), _jsxs(Menu, { anchorEl: menuAnchor?.slug === t.slug ? menuAnchor.el : null, open: menuAnchor?.slug === t.slug, onClose: handleMenuClose, transformOrigin: { horizontal: 'right', vertical: 'top' }, anchorOrigin: { horizontal: 'right', vertical: 'bottom' }, children: [_jsxs(MenuItem, { onClick: () => { handleMenuClose(); setEditor(t); }, children: [_jsx(ListItemIcon, { children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Edit" })] }), _jsxs(MenuItem, { onClick: () => { handleMenuClose(); setUserManager({ slug: t.slug, displayName: t.displayName }); }, children: [_jsx(ListItemIcon, { children: _jsx(PeopleIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Manage Users" })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => void handleSeed(t.slug), disabled: isSeeding, children: [_jsx(ListItemIcon, { children: _jsx(PlayArrowIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: isSeeding ? 'Seeding…' : 'Seed' })] }), _jsxs(MenuItem, { onClick: () => void handleMigrate(t.slug), disabled: isMigrating, children: [_jsx(ListItemIcon, { children: _jsx(BuildIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: isMigrating ? 'Migrating…' : 'Migrate' })] }), _jsxs(MenuItem, { onClick: () => void handleDeploy(t.slug), disabled: isDeploying, children: [_jsx(ListItemIcon, { children: _jsx(CloudUploadIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: isDeploying ? 'Deploying…' : 'Deploy to Vercel' })] }), _jsxs(MenuItem, { onClick: () => void handleCheckStatus(t.slug), disabled: checkingStatus === t.slug, children: [_jsx(ListItemIcon, { children: _jsx(RefreshIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: checkingStatus === t.slug ? 'Checking…' : 'Check Status' })] }), _jsxs(MenuItem, { onClick: () => void handleTriggerHook(t.slug), disabled: triggeringHook === t.slug, children: [_jsx(ListItemIcon, { children: _jsx(PlayArrowIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: triggeringHook === t.slug ? 'Triggering…' : 'Trigger Deploy Hook' })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => { handleMenuClose(); setConfirmDelete(t.slug); }, disabled: isDeleting && deleting === t.slug, children: [_jsx(ListItemIcon, { children: _jsx(DeleteIcon, { fontSize: "small", color: "error" }) }), _jsx(ListItemText, { sx: { color: 'error.main' }, children: "Delete" })] })] })] }, t.id));
                        }) })) : (_jsx(TableContainer, { sx: { width: '100%', overflowX: 'auto' }, children: _jsxs(Table, { size: "small", sx: { minWidth: 720 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Tenant" }), _jsx(TableCell, { children: "Template" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "License" }), _jsx(TableCell, { children: "URL" }), _jsx(TableCell, { children: "Created" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: tenants.map((t) => {
                                        const tpl = getTemplate(t.template);
                                        return (_jsxs(TableRow, { children: [_jsxs(TableCell, { children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: t.displayName }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: t.slug })] }), _jsx(TableCell, { children: _jsx(Chip, { label: tpl.label, size: "small", variant: "outlined" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: t.status, size: "small", color: STATUS_COLORS[t.status] ?? 'default' }) }), _jsx(TableCell, { children: t.apiKey ? (_jsx(Chip, { label: "Licensed", size: "small", color: "success", variant: "outlined" })) : (_jsx(Chip, { label: "Unlicensed", size: "small", color: "warning", variant: "outlined" })) }), _jsx(TableCell, { sx: { maxWidth: 220 }, children: _jsx(TenantUrlLink, { tenant: t }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: new Date(t.createdAt).toLocaleDateString() }) }), _jsxs(TableCell, { align: "right", children: [_jsx(IconButton, { size: "small", onClick: (e) => handleMenuOpen(t.slug, e.currentTarget), children: _jsx(MoreVertIcon, { fontSize: "small" }) }), _jsxs(Menu, { anchorEl: menuAnchor?.slug === t.slug ? menuAnchor.el : null, open: menuAnchor?.slug === t.slug, onClose: handleMenuClose, transformOrigin: { horizontal: 'right', vertical: 'top' }, anchorOrigin: { horizontal: 'right', vertical: 'bottom' }, children: [_jsxs(MenuItem, { onClick: () => { handleMenuClose(); setEditor(t); }, children: [_jsx(ListItemIcon, { children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Edit" })] }), _jsxs(MenuItem, { onClick: () => { handleMenuClose(); setUserManager({ slug: t.slug, displayName: t.displayName }); }, children: [_jsx(ListItemIcon, { children: _jsx(PeopleIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Manage Users" })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => void handleSeed(t.slug), disabled: isSeeding, children: [_jsx(ListItemIcon, { children: _jsx(PlayArrowIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: isSeeding ? 'Seeding…' : 'Seed' })] }), _jsxs(MenuItem, { onClick: () => void handleMigrate(t.slug), disabled: isMigrating, children: [_jsx(ListItemIcon, { children: _jsx(BuildIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: isMigrating ? 'Migrating…' : 'Migrate' })] }), _jsxs(MenuItem, { onClick: () => void handleDeploy(t.slug), disabled: isDeploying, children: [_jsx(ListItemIcon, { children: _jsx(CloudUploadIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: isDeploying ? 'Deploying…' : 'Deploy to Vercel' })] }), _jsxs(MenuItem, { onClick: () => void handleCheckStatus(t.slug), disabled: checkingStatus === t.slug, children: [_jsx(ListItemIcon, { children: _jsx(RefreshIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: checkingStatus === t.slug ? 'Checking…' : 'Check Status' })] }), _jsxs(MenuItem, { onClick: () => void handleTriggerHook(t.slug), disabled: triggeringHook === t.slug, children: [_jsx(ListItemIcon, { children: _jsx(PlayArrowIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: triggeringHook === t.slug ? 'Triggering…' : 'Trigger Deploy Hook' })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => { handleMenuClose(); setConfirmDelete(t.slug); }, disabled: isDeleting && deleting === t.slug, children: [_jsx(ListItemIcon, { children: _jsx(DeleteIcon, { fontSize: "small", color: "error" }) }), _jsx(ListItemText, { sx: { color: 'error.main' }, children: "Delete" })] })] })] })] }, t.id));
                                    }) })] }) }))] }), _jsxs(Dialog, { open: Boolean(confirmDelete), onClose: () => setConfirmDelete(null), children: [_jsx(DialogTitle, { children: "Delete Tenant?" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["Are you sure you want to permanently delete tenant ", _jsx("strong", { children: confirmDelete }), "? This action cannot be undone. All data associated with this tenant will be removed."] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setConfirmDelete(null), children: "Cancel" }), _jsx(Button, { onClick: () => confirmDelete && handleDelete(confirmDelete), color: "error", variant: "contained", disabled: isDeleting && deleting === confirmDelete, children: isDeleting && deleting === confirmDelete ? 'Deleting…' : 'Delete' })] })] }), editor && (_jsx(EditTenantModal, { open: Boolean(editor), onClose: () => { setEditor(null); refetch(); }, tenant: editor, onRefetch: refetch, onSnackbar: (msg) => setSnackbar(msg) })), userManager && (_jsx(TenantUserManager, { open: Boolean(userManager), onClose: () => setUserManager(null), tenantSlug: userManager.slug, tenantDisplayName: userManager.displayName })), _jsx(Snackbar, { open: Boolean(snackbar), autoHideDuration: 4000, onClose: () => setSnackbar(null), message: snackbar?.message })] }));
}
