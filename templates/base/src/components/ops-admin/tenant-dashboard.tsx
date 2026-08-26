'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
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
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  useListTenantsQuery,
  useDeleteTenantMutation,
  useSeedTenantMutation,
  useMigrateTenantMutation,
  useDeployTenantMutation,
  useUpdateTenantMutation,
  useGetDeployStatusQuery,
  useLazyGetDeployStatusQuery,
  useGetTenantDomainsQuery,
  useLazyGetTenantDomainsQuery,
  useTriggerDeployHookMutation,
  type TenantEntry,
} from '@/store/apis/tenant-api';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { TenantWizard } from '@/components/ops-admin/tenant-wizard';
import { TenantUserManager } from '@/components/ops-admin/tenant-user-manager';
import { EditTenantModal } from '@/components/ops-admin/edit-tenant-modal';
import { VercelConnectButton } from '@/components/ops-admin/vercel-connect-button';

const STATUS_COLORS: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'info',
  deploying: 'warning',
  live: 'success',
  error: 'error',
};

function TenantUrlLink({ tenant }: { tenant: TenantEntry }) {
  const defaultUrl = `https://${tenant.slug}.vercel.app`;
  const isCustomDomain = tenant.appUrl != null && tenant.appUrl !== defaultUrl;
  const effectiveUrl = tenant.appUrl || defaultUrl;

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Button
        size="small"
        variant="text"
        href={effectiveUrl}
        target="_blank"
        rel="noopener noreferrer"
        endIcon={<OpenInNewIcon fontSize="small" />}
        sx={{ fontSize: '0.75rem', maxWidth: 220, justifyContent: 'flex-start' }}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {effectiveUrl.replace('https://', '')}
        </Box>
      </Button>
      {isCustomDomain && (
        <Tooltip title={`Custom domain configured (Vercel URL: ${defaultUrl})`}>
          <VerifiedIcon sx={{ fontSize: '0.85rem', color: 'success.main' }} />
        </Tooltip>
      )}
      <Tooltip title={isCustomDomain ? `Auto-generated Vercel URL: ${defaultUrl}` : 'Auto-generated Vercel URL'}>
        <Box
          component="span"
          sx={{
            fontSize: '0.6rem',
            px: 0.5,
            py: 0.15,
            borderRadius: 0.5,
            bgcolor: 'action.selected',
            color: 'text.disabled',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          Vercel
        </Box>
      </Tooltip>
    </Stack>
  );
}

export function TenantDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, isError, refetch } = useListTenantsQuery();
  const [deleteTenant, { isLoading: isDeleting }] = useDeleteTenantMutation();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userManager, setUserManager] = useState<{ slug: string; displayName: string } | null>(null);
  const [editor, setEditor] = useState<TenantEntry | null>(null);

  // Three-dot menu state — track which row's menu is open
  const [menuAnchor, setMenuAnchor] = useState<{ slug: string; el: HTMLElement } | null>(null);

  // Seed/migrate state
  const [seedTenant, { isLoading: isSeeding }] = useSeedTenantMutation();
  const [migrateTenant, { isLoading: isMigrating }] = useMigrateTenantMutation();
  const [deployToVercel, { isLoading: isDeploying }] = useDeployTenantMutation();
  const [updateTenant] = useUpdateTenantMutation();
  const [getTenantDomains] = useLazyGetTenantDomainsQuery();
  const [getDeployStatus] = useLazyGetDeployStatusQuery();
  const [triggerDeployHook] = useTriggerDeployHookMutation();
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Domain refresh state
  const [refreshingDomains, setRefreshingDomains] = useState<string | null>(null);

  // Delete confirmation dialog state
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const tenants = data?.data?.tenants ?? [];

  const handleDelete = async (slug: string) => {
    handleMenuClose();
    setConfirmDelete(null);
    setDeleting(slug);
    try {
      await deleteTenant(slug).unwrap();
      setSnackbar({ message: 'Tenant deleted successfully', severity: 'success' });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error?: string } }).data?.error ?? 'Unknown error')
          : 'Failed to delete tenant';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const handleMenuOpen = (slug: string, el: HTMLElement) => setMenuAnchor({ slug, el });
  const handleMenuClose = () => setMenuAnchor(null);

  const handleSeed = async (slug: string) => {
    handleMenuClose();
    try {
      const result = await seedTenant(slug).unwrap();
      setSnackbar({ message: `Tenant seeded: ${result.data?.pages ?? 0} pages, ${result.data?.navItems ?? 0} nav items`, severity: 'success' });
    } catch {
      setSnackbar({ message: 'Failed to seed tenant', severity: 'error' });
    }
  };

  const handleMigrate = async (slug: string) => {
    handleMenuClose();
    try {
      await migrateTenant(slug).unwrap();
      setSnackbar({ message: 'Tenant migration completed', severity: 'success' });
    } catch {
      setSnackbar({ message: 'Failed to migrate tenant', severity: 'error' });
    }
  };

  const handleDeploy = async (slug: string) => {
    handleMenuClose();
    try {
      const result = await deployToVercel({ slug }).unwrap();
      if (result.success) {
        setSnackbar({
          message: `Deployed to Vercel — project created, ${result.data.envCount} env vars synced`,
          severity: 'success',
        });
      } else {
        setSnackbar({ message: result.error || 'Failed to deploy', severity: 'error' });
      }
    } catch (err: any) {
      const msg = err?.data?.error || err?.error || 'Failed to deploy tenant';
      setSnackbar({ message: msg, severity: 'error' });
    }
  };

  // ── Deploy Status Check ─────────────────────────────────────
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const handleCheckStatus = async (slug: string) => {
    handleMenuClose();
    setCheckingStatus(slug);
    try {
      const result = await getDeployStatus(slug).unwrap();
      if (result.success) {
        const status = result.data?.state || 'unknown';
        const url = result.data?.appUrl || `https://${slug}.vercel.app`;
        setSnackbar({
          message: `🔍 ${slug}: deployment status = ${status} — ${url}`,
          severity: status === 'READY' ? 'success' : 'error',
        });
      } else {
        setSnackbar({ message: result.error || 'Status check failed', severity: 'error' });
      }
    } catch (err: any) {
      const msg = err?.data?.error || err?.error || 'Failed to check deployment status';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setCheckingStatus(null);
    }
  };

  // ── Refresh Status (deployment + license) ─────────────────
  const [refreshingStatus, setRefreshingStatus] = useState<string | null>(null);
  const handleRefreshStatus = async (slug: string, metadata: Record<string, unknown>) => {
    handleMenuClose();
    setRefreshingStatus(slug);
    try {
      const config = (metadata?.config ?? {}) as Record<string, unknown>;
      const license = (config?.license ?? {}) as Record<string, unknown>;
      const apiKey = (config?.apiKey as string) || '';

      // Check deployment status via RTK Query
      const statusResult = await getDeployStatus(slug).unwrap();
      let deployStatus = 'unknown';
      let appUrl = `https://${slug}.vercel.app`;
      if (statusResult.success) {
        deployStatus = statusResult.data?.state || 'unknown';
        appUrl = statusResult.data?.appUrl || appUrl;
      }

      // Map Vercel deploy state to tenant status
      const mappedStatus: 'draft' | 'deploying' | 'live' | 'error' =
        deployStatus === 'READY' ? 'live' :
        deployStatus === 'ERROR' ? 'error' :
        deployStatus === 'BUILDING' ? 'deploying' :
        deployStatus === 'QUEUED' ? 'deploying' : 'error';

      // Evaluate license
      const hasLicense = !!license.licenseKey;
      const hasApiKey = !!apiKey;
      const licenseTier = (license.tier as string) || 'none';
      const licenseFeatures = Array.isArray(license.features) ? license.features : [];

      // Persist updated status, appUrl, and apiKey to the backend
      try {
        await updateTenant({
          slug,
          status: mappedStatus,
          appUrl: appUrl || undefined,
          apiKey: apiKey || null,
        }).unwrap();
      } catch (updateErr) {
        console.warn(`[refresh-status] Failed to update tenant ${slug}:`, updateErr);
      }

      // Refresh the tenant list in the UI
      refetch();

      setSnackbar({
        message: `🔍 ${slug}: status=${mappedStatus}, license=${licenseTier.toUpperCase()}${hasApiKey ? ' ✅' : ' ⚠️ no key'}, features=${licenseFeatures.length}`,
        severity: mappedStatus === 'live' ? 'success' : 'error',
      });
    } catch {
      setSnackbar({ message: `Failed to refresh status for ${slug}`, severity: 'error' });
    } finally {
      setRefreshingStatus(null);
    }
  };

  // ── Custom Domain: Refresh Domains ─────────────────────────
  const handleRefreshDomains = async (slug: string) => {
    handleMenuClose();
    setRefreshingDomains(slug);
    try {
      const result = await getTenantDomains(slug).unwrap();
      if (result.success) {
        const domains = result.data?.domains || [];
        const projectInfo = result.data?.projectInfo;
        const autoVercelUrl = result.data?.autoVercelUrl;

        const parts: string[] = [];
        if (domains.length > 0) {
          const verified = domains.filter((d: { verified: boolean }) => d.verified).length;
          parts.push(`${domains.length} domain(s) — ${verified} verified`);
        }
        if (projectInfo) {
          parts.push(`Project: ${projectInfo.name}`);
        }
        if (autoVercelUrl) {
          parts.push(`URL: ${autoVercelUrl}`);
        }
        const warnings: string[] = result.data?.warnings || [];
        if (warnings.length > 0) {
          const wMsg = warnings.join('; ');
          console.warn(`[tenant-dashboard] Domain warnings for ${slug}:`, wMsg);
          if (parts.length > 0) {
            parts.push(`⚠️ ${warnings.length} warning(s)`);
          } else {
            parts.push(wMsg);
          }
        }

        if (parts.length === 0) {
          if (projectInfo) {
            parts.push(`Project ${projectInfo.name} — no custom domains`);
          } else {
            parts.push('No domains configured on Vercel');
          }
        }

        refetch();
        setSnackbar({
          message: `🌐 ${parts.join(' | ')}`,
          severity: 'error', // warnings displayed in message
        });
      } else {
        setSnackbar({ message: result.error || 'Failed to fetch domains', severity: 'error' });
      }
    } catch (err: any) {
      const msg = err?.data?.error || err?.error || 'Failed to refresh domains';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setRefreshingDomains(null);
    }
  };

  // ── Deploy Hook: Trigger Deploy ────────────────────────────
  const [triggeringHook, setTriggeringHook] = useState<string | null>(null);
  const handleTriggerHook = async (slug: string) => {
    handleMenuClose();
    setTriggeringHook(slug);
    try {
      // Get the deploy hook URL from tenant metadata
      const tenant = tenants.find(t => t.slug === slug);
      const cfg = (tenant?.metadata as Record<string, unknown>)?.config as Record<string, unknown> || {};
      const hookUrl = ((cfg.hooks as Record<string, unknown>)?.deployHookUrl as string) || '';
      if (!hookUrl) {
        setSnackbar({ message: '⚠️ No Deploy Hook URL configured. Set it in the tenant editor.', severity: 'error' });
        setTriggeringHook(null);
        return;
      }
      const result = await triggerDeployHook(hookUrl).unwrap();
      const data = result as { job?: { state: string }; success?: boolean };
      if (data.job?.state) {
        setSnackbar({ message: `🚀 Deploy triggered via hook — job ${data.job.state}`, severity: 'success' });
        refetch();
      } else {
        setSnackbar({ message: 'Hook triggered successfully', severity: 'success' });
      }
    } catch (err: any) {
      const msg = err?.data?.error || err?.error || 'Failed to trigger deploy hook';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setTriggeringHook(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, md: 1.5 }}
          sx={{ mb: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tenant Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage registered tenant applications. Create new tenants, monitor deployment status, and configure settings.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0, justifyContent: { xs: 'flex-end', sm: 'unset' } }}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()} size="small" aria-label="Refresh">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <VercelConnectButton />
            <TenantWizard iconOnly />
          </Stack>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <BrandedLoadingIndicator  />
          </Box>
        ) : isError ? (
          <Alert severity="error">Failed to load tenants. The tenants table may need to be migrated — run seed or migrate first.</Alert>
        ) : tenants.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No tenants registered yet. Create your first tenant application to get started.
            </Typography>
            <TenantWizard />
          </Box>
        ) : isMobile ? (
          <Stack spacing={1.5}>
            {tenants.map((t) => {
              const tpl = getTemplate(t.template);
              return (
                <Paper key={t.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {t.slug}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(t.slug, e.currentTarget)}
                      aria-label={`Actions for ${t.displayName}`}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, flexWrap: 'wrap' }} useFlexGap>
                    <Chip label={tpl.label} size="small" variant="outlined" />
                    <Chip
                      label={t.status}
                      size="small"
                      color={STATUS_COLORS[t.status] ?? 'default'}
                    />
                    {t.apiKey ? (
                      <Chip label="Licensed" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="Unlicensed" size="small" color="warning" variant="outlined" />
                    )}
                  </Stack>
                  <Box sx={{ mt: 1.5, minWidth: 0 }}>
                    <TenantUrlLink tenant={t} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Created {new Date(t.createdAt).toLocaleDateString()}
                  </Typography>
                  <Menu
                    anchorEl={menuAnchor?.slug === t.slug ? menuAnchor.el : null}
                    open={menuAnchor?.slug === t.slug}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => { handleMenuClose(); setEditor(t); }}>
                      <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); setUserManager({ slug: t.slug, displayName: t.displayName }); }}>
                      <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Manage Users</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => void handleSeed(t.slug)} disabled={isSeeding}>
                      <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>{isSeeding ? 'Seeding…' : 'Seed'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => void handleMigrate(t.slug)} disabled={isMigrating}>
                      <ListItemIcon><BuildIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>{isMigrating ? 'Syncing…' : 'Sync DB Schema'}</ListItemText>
                    </MenuItem>
                    {(() => {
                      const cfg = (t.metadata as Record<string, unknown>)?.config as Record<string, unknown> || {};
                      const hookUrl = ((cfg.hooks as Record<string, unknown>)?.deployHookUrl as string) || '';
                      return !hookUrl ? (
                        <MenuItem onClick={() => void handleDeploy(t.slug)} disabled={isDeploying}>
                          <ListItemIcon><CloudUploadIcon fontSize="small" /></ListItemIcon>
                          <ListItemText>{isDeploying ? 'Deploying…' : 'Deploy to Vercel'}</ListItemText>
                        </MenuItem>
                      ) : null;
                    })()}
                    <MenuItem onClick={() => void handleCheckStatus(t.slug)} disabled={checkingStatus === t.slug}>
                      <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>{checkingStatus === t.slug ? 'Checking…' : 'Check Status'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => void handleRefreshStatus(t.slug, t.metadata || {})} disabled={refreshingStatus === t.slug}>
                      <ListItemIcon><VerifiedIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>{refreshingStatus === t.slug ? 'Refreshing…' : 'Refresh Status'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => void handleTriggerHook(t.slug)} disabled={triggeringHook === t.slug}>
                      <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>{triggeringHook === t.slug ? 'Triggering…' : 'Trigger Deploy Hook'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => void handleRefreshDomains(t.slug)} disabled={refreshingDomains === t.slug}>
                      <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>{refreshingDomains === t.slug ? 'Refreshing…' : 'Refresh Domains'}</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => { handleMenuClose(); setConfirmDelete(t.slug); }}
                      disabled={isDeleting && deleting === t.slug}
                    >
                      <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                    </MenuItem>
                  </Menu>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((t) => {
                  const tpl = getTemplate(t.template);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {t.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tpl.label} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          size="small"
                          color={STATUS_COLORS[t.status] ?? 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {t.apiKey ? (
                          <Chip label="Licensed" size="small" color="success" variant="outlined" />
                        ) : (
                          <Chip label="Unlicensed" size="small" color="warning" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <TenantUrlLink tenant={t} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(t.slug, e.currentTarget)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor?.slug === t.slug ? menuAnchor.el : null}
                          open={menuAnchor?.slug === t.slug}
                          onClose={handleMenuClose}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                          <MenuItem onClick={() => { handleMenuClose(); setEditor(t); }}>
                            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Edit</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => { handleMenuClose(); setUserManager({ slug: t.slug, displayName: t.displayName }); }}>
                            <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Manage Users</ListItemText>
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={() => void handleSeed(t.slug)} disabled={isSeeding}>
                            <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{isSeeding ? 'Seeding…' : 'Seed'}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => void handleMigrate(t.slug)} disabled={isMigrating}>
                            <ListItemIcon><BuildIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{isMigrating ? 'Syncing…' : 'Sync DB Schema'}</ListItemText>
                          </MenuItem>
                          {(() => {
                            const cfg = (t.metadata as Record<string, unknown>)?.config as Record<string, unknown> || {};
                            const hookUrl = ((cfg.hooks as Record<string, unknown>)?.deployHookUrl as string) || '';
                            return !hookUrl ? (
                              <MenuItem onClick={() => void handleDeploy(t.slug)} disabled={isDeploying}>
                                <ListItemIcon><CloudUploadIcon fontSize="small" /></ListItemIcon>
                                <ListItemText>{isDeploying ? 'Deploying…' : 'Deploy to Vercel'}</ListItemText>
                              </MenuItem>
                            ) : null;
                          })()}
                          <MenuItem onClick={() => void handleCheckStatus(t.slug)} disabled={checkingStatus === t.slug}>
                            <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{checkingStatus === t.slug ? 'Checking…' : 'Check Status'}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => void handleRefreshStatus(t.slug, t.metadata || {})} disabled={refreshingStatus === t.slug}>
                            <ListItemIcon><VerifiedIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{refreshingStatus === t.slug ? 'Refreshing…' : 'Refresh Status'}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => void handleTriggerHook(t.slug)} disabled={triggeringHook === t.slug}>
                            <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{triggeringHook === t.slug ? 'Triggering…' : 'Trigger Deploy Hook'}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => void handleRefreshDomains(t.slug)} disabled={refreshingDomains === t.slug}>
                            <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{refreshingDomains === t.slug ? 'Refreshing…' : 'Refresh Domains'}</ListItemText>
                          </MenuItem>
                          <Divider />
                          <MenuItem
                            onClick={() => { handleMenuClose(); setConfirmDelete(t.slug); }}
                            disabled={isDeleting && deleting === t.slug}
                          >
                            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        fullWidth
      >
        <DialogTitle>Delete Tenant?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete tenant <strong>{confirmDelete}</strong>?
            This action cannot be undone. All data associated with this tenant will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button
            onClick={() => confirmDelete && handleDelete(confirmDelete)}
            color="error"
            variant="contained"
            disabled={isDeleting && deleting === confirmDelete}
          >
            {isDeleting && deleting === confirmDelete ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Modal */}
      {editor && (
        <EditTenantModal
          key={editor?.slug}
          open={Boolean(editor)}
          onClose={() => { setEditor(null); refetch(); }}
          tenant={editor}
          
          onSnackbar={(msg) => setSnackbar(msg)}
        />
      )}

      {/* Tenant User Manager Modal */}
      {userManager && (
        <TenantUserManager
          open={Boolean(userManager)}
          onClose={() => setUserManager(null)}
          tenantSlug={userManager.slug}
          tenantDisplayName={userManager.displayName}
        />
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
    </Stack>
  );
}
