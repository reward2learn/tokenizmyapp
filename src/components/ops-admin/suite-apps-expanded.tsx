'use client';

/**
 * SuiteAppsExpanded — Expanded view of suite apps with per-app deploy status.
 * Used when a suite tenant row is expanded in the tenant dashboard.
 */
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import type { SuiteAppInstance } from '@/store/apis/tenant-api';
import { useAppDeployStatusPoller, type AppDeployStatusMap } from '@/lib/admin/use-app-deploy-status-poller';
import { AppRow } from './app-row';
import { AddAppButton } from './add-app-dialog';

interface SuiteAppsExpandedProps {
  tenantSlug: string;
  apps: SuiteAppInstance[];
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
  onSelectApp?: (appId: string) => void;
}

function getVercelStateChip(vercelState: string | undefined) {
  if (!vercelState) return null;
  const isNoDeployments = vercelState === 'NO_DEPLOYMENTS' || vercelState === 'NOT_FOUND';
  const chipColor = vercelState === 'READY' ? 'success' : vercelState === 'ERROR' ? 'error' : vercelState === 'BUILDING' || vercelState === 'QUEUED' ? 'warning' : 'default';
  return (
    <Chip
      label={isNoDeployments ? 'NO DEPLOYMENTS' : vercelState}
      size="small"
      variant={isNoDeployments ? 'outlined' : 'filled'}
      color={isNoDeployments ? 'warning' : chipColor}
      sx={{ fontWeight: isNoDeployments ? 600 : undefined, height: 18, fontSize: '0.6rem' }}
    />
  );
}

function AppRowWithStatus({
  tenantSlug,
  app,
  appStatus,
  onSelect,
  onSnackbar,
}: {
  tenantSlug: string;
  app: SuiteAppInstance;
  appStatus?: AppDeployStatusMap[string];
  onSelect?: (appId: string) => void;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}) {
  // Use live status if available, otherwise fall back to stored status
  const displayStatus = appStatus?.status ?? app.status;
  const displayAppUrl = appStatus?.appUrl ?? app.appUrl;
  const vercelState = appStatus?.vercelState;

  return (
    <Box>
      <AppRow
        tenantSlug={tenantSlug}
        tenantName=""
        app={{
          ...app,
          status: displayStatus,
          appUrl: displayAppUrl,
        }}
        onSelect={onSelect}
        onSnackbar={onSnackbar}
      />
      {/* Vercel deployment state indicator */}
      {vercelState && (
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, ml: 1.5 }}>
          {getVercelStateChip(vercelState)}
        </Stack>
      )}
    </Box>
  );
}

export function SuiteAppsExpanded({ tenantSlug, apps, onSnackbar, onSelectApp }: SuiteAppsExpandedProps) {
  const { statusMap: appStatusMap, isFetching: isFetchingAppStatus } = useAppDeployStatusPoller(tenantSlug, apps);

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Suite Apps ({apps.length})
          </Typography>
          {isFetchingAppStatus && (
            <CircularProgress size={12} color="inherit" />
          )}
        </Stack>
        <AddAppButton tenantSlug={tenantSlug} onSnackbar={onSnackbar} />
      </Stack>
      <Stack spacing={1}>
        {apps.map((app: SuiteAppInstance) => (
          <AppRowWithStatus
            key={app.appId}
            tenantSlug={tenantSlug}
            app={app}
            appStatus={appStatusMap[app.appId]}
            onSelect={onSelectApp}
            onSnackbar={onSnackbar}
          />
        ))}
      </Stack>
    </Box>
  );
}
