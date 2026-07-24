'use client';

import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
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
import {
  useListTenantsQuery,
  useDeleteTenantMutation,
  useSeedTenantMutation,
  useMigrateTenantMutation,
  useDeployTenantMutation,
  type TenantEntry,
} from '@/store/apis/tenant-api';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { TenantWizard } from '@/components/ops-admin/tenant-wizard';
import { TenantUserManager } from '@/components/ops-admin/tenant-user-manager';
import { TenantEditor } from '@/components/ops-admin/tenant-editor';
import { VercelConnectButton } from '@/components/ops-admin/vercel-connect-button';

const STATUS_COLORS: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'info',
  deploying: 'warning',
  live: 'success',
  error: 'error',
};

export function TenantDashboard() {
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
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const tenants = data?.data?.tenants ?? [];

  const handleDelete = async (slug: string) => {
    setDeleting(slug);
    await deleteTenant(slug).unwrap();
    setDeleting(null);
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
      const result = await deployToVercel(slug).unwrap();
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

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tenant Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage registered tenant applications. Create new tenants, monitor deployment status, and configure settings.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <VercelConnectButton />
            <TenantWizard />
          </Stack>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
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
        ) : (
          <Table size="small">
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
                    <TableCell>
                      {t.appUrl ? (
                        <Button
                          size="small"
                          variant="text"
                          href={t.appUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {t.appUrl.replace('https://', '')}
                        </Button>
                      ) : t.status === 'live' ? (
                        <Button
                          size="small"
                          variant="text"
                          href={`https://${t.slug}.vercel.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {t.slug}.vercel.app
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          {t.slug}.vercel.app
                        </Typography>
                      )}
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
                          <ListItemText>{isMigrating ? 'Migrating…' : 'Migrate'}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => void handleDeploy(t.slug)} disabled={isDeploying}>
                          <ListItemIcon><CloudUploadIcon fontSize="small" /></ListItemIcon>
                          <ListItemText>{isDeploying ? 'Deploying…' : 'Deploy to Vercel'}</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { handleMenuClose(); void handleDelete(t.slug); }} disabled={isDeleting && deleting === t.slug}>
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
        )}
      </Paper>

      {/* Tenant Editor Modal */}
      {editor && (
        <TenantEditor
          open={Boolean(editor)}
          onClose={() => { setEditor(null); refetch(); }}
          tenant={editor}
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
