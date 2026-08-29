'use client';

/**
 * SuiteAppsExpanded — Expanded view of suite apps with per-app deploy status.
 * Used when a suite tenant row is expanded in the tenant dashboard.
 */
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import type { SuiteAppInstance } from '@/store/apis/tenant-api';
import { useAppDeployStatusPoller, type AppDeployStatusMap } from '@/lib/admin/use-app-deploy-status-poller';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { AppActionsMenuButton } from './app-actions-menu';
import { AddAppButton } from './add-app-dialog';

interface SuiteAppsExpandedProps {
  tenantSlug: string;
  apps: SuiteAppInstance[];
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
  onSelectApp?: (appId: string) => void;
}

function AppRowWithLiveStatus({
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
  const tpl = getTemplate(app.templateId);
  const displayStatus = appStatus?.status ?? app.status;
  const displayAppUrl = appStatus?.appUrl ?? app.appUrl;
  const vercelState = appStatus?.vercelState;

  const statusColor = displayStatus === 'live' ? 'success' : displayStatus === 'error' ? 'error' : 'default';

  // Determine vercel state chip appearance
  const isNoDeployments = vercelState === 'NO_DEPLOYMENTS' || vercelState === 'NOT_FOUND';
  const vercelChipColor = vercelState === 'READY' ? 'success'
    : vercelState === 'ERROR' ? 'error'
    : vercelState === 'BUILDING' || vercelState === 'QUEUED' ? 'warning'
    : 'default';

  return (
    <Paper
      variant="outlined"
      onClick={onSelect ? () => onSelect(app.appId) : undefined}
      sx={{
        p: 1.5,
        cursor: onSelect ? 'pointer' : 'default',
        '&:hover': onSelect ? { borderColor: 'primary.main' } : undefined,
      }}
    >
      <Stack direction="row" spacing={0.5} useFlexGap sx={{ alignItems: 'center', width: '100%', minWidth: 0, flexWrap: 'wrap', rowGap: 0.5 }}>
        <Box sx={{ flex: '1 1 140px', minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
            {app.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word' }}>
            {app.appId}{app.department !== '—' ? ` • ${app.department}` : ''} • {tpl.label}
          </Typography>
          {displayAppUrl && (
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'primary.main', wordBreak: 'break-all', overflowWrap: 'anywhere', maxWidth: '100%' }}
            >
              {displayAppUrl}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label={displayStatus} size="small" color={statusColor} />
          {/* Vercel deployment state — inline with status */}
          {vercelState && (
            <Chip
              label={isNoDeployments ? 'NO DEPLOYMENTS' : vercelState}
              size="small"
              variant={isNoDeployments ? 'outlined' : 'filled'}
              color={isNoDeployments ? 'warning' : vercelChipColor}
              sx={{ fontWeight: isNoDeployments ? 600 : undefined }}
            />
          )}
          <AppActionsMenuButton tenantSlug={tenantSlug} tenantName="" app={{ ...app, status: displayStatus, appUrl: displayAppUrl }} onSnackbar={onSnackbar} />
        </Stack>
      </Stack>
    </Paper>
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
          <AppRowWithLiveStatus
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
