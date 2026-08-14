'use client';

/**
 * AppActionsMenu — the three-dot menu for a single suite app.
 *
 * Consolidates the per-app CRUD + lifecycle actions that used to be split
 * across tenant-dashboard.tsx (Seed/Sync/Deploy/Check Status/Open only) and
 * missing entirely from tenant-admin-panel.tsx. Shared by both surfaces.
 *
 * Items: Edit, Manage Users, Seed, Sync DB Schema, Deploy This App,
 * Check Status, Refresh Status, Trigger Deploy Hook, Refresh Domain,
 * Open App, Remove from Suite.
 */
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
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BuildIcon from '@mui/icons-material/Build';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LanguageIcon from '@mui/icons-material/Language';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VerifiedIcon from '@mui/icons-material/Verified';

import { listTemplates, getTemplate } from '@/domain/tenant/template-catalog';
import {
  useSeedAppMutation,
  useMigrateAppMutation,
  useDeployAppMutation,
  useLazyGetAppStatusQuery,
  useLazyRefreshAppStatusQuery,
  useEditAppMutation,
  useLazyGetAppDomainsQuery,
  useTriggerDeployHookMutation,
  useRemoveAppFromSuiteMutation,
  type SuiteAppInstance,
} from '@/store/apis/tenant-api';
import { TenantInlineUserManager } from './tenant-inline-user-manager';

/** Extracts the API envelope's `error` string off an RTK Query error, without `any`. */
function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

export interface AppActionsMenuProps {
  tenantSlug: string;
  tenantName: string;
  app: SuiteAppInstance;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function AppActionsMenu({ tenantSlug, tenantName, app, anchorEl, open, onClose, onSnackbar }: AppActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const [seedApp, { isLoading: seeding }] = useSeedAppMutation();
  const [migrateApp, { isLoading: migrating }] = useMigrateAppMutation();
  const [deployApp, { isLoading: deploying }] = useDeployAppMutation();
  const [fetchStatus, { isFetching: checkingStatus }] = useLazyGetAppStatusQuery();
  const [refreshStatus, { isFetching: refreshingStatus }] = useLazyRefreshAppStatusQuery();
  const [triggerDeployHook, { isLoading: triggeringHook }] = useTriggerDeployHookMutation();
  const [fetchDomains, { isFetching: refreshingDomains }] = useLazyGetAppDomainsQuery();
  const [removeApp, { isLoading: removing }] = useRemoveAppFromSuiteMutation();

  const busy = seeding || migrating || deploying || removing;

  const handleSeed = async () => {
    onClose();
    try {
      const result = await seedApp({ slug: tenantSlug, appId: app.appId }).unwrap();
      onSnackbar({ message: `✅ ${app.appId} seeded — ${result.data?.pages ?? 0} pages`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to seed ${app.appId}`), severity: 'error' });
    }
  };

  const handleMigrate = async () => {
    onClose();
    try {
      await migrateApp({ slug: tenantSlug, appId: app.appId }).unwrap();
      onSnackbar({ message: `✅ ${app.appId} schema synced`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to sync ${app.appId}`), severity: 'error' });
    }
  };

  const handleDeploy = async () => {
    onClose();
    try {
      const result = await deployApp({ slug: tenantSlug, appId: app.appId }).unwrap();
      onSnackbar({ message: `🚀 ${app.appId} deployed — ${result.data?.appUrl ?? 'building...'}`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to deploy ${app.appId}`), severity: 'error' });
    }
  };

  const handleCheckStatus = async () => {
    onClose();
    try {
      const result = await fetchStatus({ slug: tenantSlug, appId: app.appId }).unwrap();
      const a = result.data?.app;
      onSnackbar({ message: `🔍 ${app.appId}: status=${a?.status ?? 'unknown'} — ${a?.appUrl ?? 'no URL'}`, severity: a?.status === 'live' ? 'success' : 'error' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to check status for ${app.appId}`), severity: 'error' });
    }
  };

  const handleRefreshStatus = async () => {
    onClose();
    try {
      const result = await refreshStatus({ slug: tenantSlug, appId: app.appId }).unwrap();
      const d = result.data;
      onSnackbar({
        message: `🔍 ${app.appId}: status=${d?.status ?? 'unknown'} (Vercel: ${d?.vercelState ?? 'unknown'})`,
        severity: d?.status === 'live' ? 'success' : 'error',
      });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to refresh status for ${app.appId}`), severity: 'error' });
    }
  };

  const handleTriggerHook = async () => {
    onClose();
    if (!app.deployHookUrl) {
      onSnackbar({ message: '⚠️ No deploy hook URL set for this app. Set one via Edit.', severity: 'error' });
      return;
    }
    try {
      const result = await triggerDeployHook(app.deployHookUrl).unwrap();
      const data = result as { job?: { state: string } };
      onSnackbar({ message: data.job?.state ? `🚀 Deploy triggered — job ${data.job.state}` : 'Hook triggered successfully', severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to trigger deploy hook'), severity: 'error' });
    }
  };

  const handleRefreshDomains = async () => {
    onClose();
    try {
      const result = await fetchDomains({ slug: tenantSlug, appId: app.appId }).unwrap();
      const d = result.data;
      const parts: string[] = [];
      if (d?.domains?.length) {
        const verified = d.domains.filter((x) => x.verified).length;
        parts.push(`${d.domains.length} domain(s) — ${verified} verified`);
      }
      if (d?.projectInfo) parts.push(`Project: ${d.projectInfo.name}`);
      if (parts.length === 0) parts.push(d?.note || 'No domains configured on Vercel yet.');
      onSnackbar({ message: `🌐 ${app.appId}: ${parts.join(' | ')}`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to refresh domains for ${app.appId}`), severity: 'error' });
    }
  };

  const handleRemove = async () => {
    setRemoveConfirmOpen(false);
    try {
      await removeApp({ slug: tenantSlug, appId: app.appId }).unwrap();
      onSnackbar({ message: `🗑️ Removed ${app.appId} from suite`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, `❌ Failed to remove ${app.appId}`), severity: 'error' });
    }
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { onClose(); setEditOpen(true); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onClose(); setUsersOpen(true); }}>
          <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Manage Users</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void handleSeed()} disabled={busy}>
          <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{seeding ? 'Seeding…' : 'Seed'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void handleMigrate()} disabled={busy}>
          <ListItemIcon><BuildIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{migrating ? 'Syncing…' : 'Sync DB Schema'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void handleDeploy()} disabled={busy}>
          <ListItemIcon><CloudUploadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{deploying ? 'Deploying…' : 'Deploy This App'}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void handleCheckStatus()} disabled={checkingStatus}>
          <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{checkingStatus ? 'Checking…' : 'Check Status'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void handleRefreshStatus()} disabled={refreshingStatus}>
          <ListItemIcon><VerifiedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{refreshingStatus ? 'Refreshing…' : 'Refresh Status'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void handleTriggerHook()} disabled={triggeringHook}>
          <ListItemIcon><RocketLaunchIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{triggeringHook ? 'Triggering…' : 'Trigger Deploy Hook'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void handleRefreshDomains()} disabled={refreshingDomains}>
          <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{refreshingDomains ? 'Refreshing…' : 'Refresh Domain'}</ListItemText>
        </MenuItem>
        {app.appUrl && (
          <MenuItem component="a" href={app.appUrl} target="_blank" onClick={onClose}>
            <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Open App</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { onClose(); setRemoveConfirmOpen(true); }} disabled={busy}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Remove from Suite</ListItemText>
        </MenuItem>
      </Menu>

      <AppEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        tenantSlug={tenantSlug}
        app={app}
        onSnackbar={onSnackbar}
      />

      <Dialog open={usersOpen} onClose={() => setUsersOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Users — {app.name}</DialogTitle>
        <DialogContent dividers>
          <TenantInlineUserManager tenantSlug={tenantSlug} tenantName={tenantName} appId={app.appId} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeConfirmOpen} onClose={() => setRemoveConfirmOpen(false)}>
        <DialogTitle>Remove App?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove <strong>{app.name}</strong> ({app.appId}) from this suite? This only detaches it from the
            suite&apos;s app list — it does not delete its Vercel project or database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveConfirmOpen(false)} disabled={removing}>Cancel</Button>
          <Button onClick={() => void handleRemove()} color="error" variant="contained" disabled={removing}>
            {removing ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Self-contained trigger + menu (owns its own anchor state only) ─────

export interface AppActionsMenuButtonProps {
  tenantSlug: string;
  tenantName: string;
  app: SuiteAppInstance;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

/** IconButton + AppActionsMenu bundled together, for call sites (e.g. a
 *  table cell) that just want a drop-in three-dot trigger without owning
 *  anchor state themselves. Snackbar reporting is still the host page's
 *  responsibility, matching every other action in this admin panel. */
export function AppActionsMenuButton({ tenantSlug, tenantName, app, onSnackbar }: AppActionsMenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
        aria-label={`Actions for ${app.name}`}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <AppActionsMenu
        tenantSlug={tenantSlug}
        tenantName={tenantName}
        app={app}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onSnackbar={onSnackbar}
      />
    </>
  );
}

// ── Edit dialog ────────────────────────────────────────────

interface AppEditDialogProps {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  app: SuiteAppInstance;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

function AppEditDialog({ open, onClose, tenantSlug, app, onSnackbar }: AppEditDialogProps) {
  const [name, setName] = useState(app.name);
  const [department, setDepartment] = useState(app.department);
  const [templateId, setTemplateId] = useState(app.templateId);
  const [primaryColor, setPrimaryColor] = useState(app.primaryColor || getTemplate(app.templateId).defaultColors.primary);
  const [secondaryColor, setSecondaryColor] = useState(app.secondaryColor || getTemplate(app.templateId).defaultColors.secondary);
  const [deployHookUrl, setDeployHookUrl] = useState(app.deployHookUrl || '');
  const [editApp, { isLoading }] = useEditAppMutation();
  const templates = listTemplates();

  const handleSave = async () => {
    try {
      await editApp({
        slug: tenantSlug,
        appId: app.appId,
        name: name.trim() || app.name,
        department: department.trim() || app.department,
        templateId,
        primaryColor,
        secondaryColor,
        deployHookUrl: deployHookUrl.trim() || null,
      }).unwrap();
      onSnackbar({ message: `✅ ${app.name} updated`, severity: 'success' });
      onClose();
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to update app'), severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit App: {app.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
          <TextField label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth size="small" />
          <FormControl fullWidth size="small">
            <InputLabel>Template</InputLabel>
            <Select value={templateId} label="Template" onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Primary Color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                fullWidth size="small"
                slotProps={{ input: { startAdornment: <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: primaryColor, border: '1px solid', borderColor: 'divider', mr: 1 }} /> } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Secondary Color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                fullWidth size="small"
                slotProps={{ input: { startAdornment: <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: secondaryColor, border: '1px solid', borderColor: 'divider', mr: 1 }} /> } }}
              />
            </Box>
          </Stack>
          <TextField
            label="Deploy Hook URL"
            value={deployHookUrl}
            onChange={(e) => setDeployHookUrl(e.target.value)}
            fullWidth
            size="small"
            placeholder="https://api.vercel.com/v1/integrations/deploy/prj_xxx/hook_xxx"
            helperText="This app's own Vercel Deploy Hook — create one in the app's Vercel project settings."
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
          />
          {app.vercelProjectId ? (
            <Typography variant="caption" color="text.secondary">
              Vercel Project: <Chip label={app.vercelProjectId} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
            </Typography>
          ) : (
            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>Not deployed yet — Vercel project ID will appear here after the first deploy.</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isLoading ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
