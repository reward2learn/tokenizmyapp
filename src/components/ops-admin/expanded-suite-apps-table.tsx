'use client';

/**
 * ExpandedSuiteAppsTable — Table rows for expanded suite apps in the desktop
 * tenant list. Fetches per-app deploy status via useAppDeployStatusPoller.
 */
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { SuiteAppInstance, AppPackConfig } from '@/store/apis/tenant-api';
import { useAppDeployStatusPoller } from '@/lib/admin/use-app-deploy-status-poller';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { AppActionsMenuButton } from './app-actions-menu';

const STATUS_COLORS: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'info',
  deploying: 'warning',
  live: 'success',
  error: 'error',
};

interface ExpandedSuiteAppsTableProps {
  tenantSlug: string;
  tenantName: string;
  suite: AppPackConfig;
  onSelectApp: (appId: string) => void;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

function getVercelStateChip(vercelState: string | undefined) {
  if (!vercelState) return null;
  const isNoDeployments = vercelState === 'NO_DEPLOYMENTS' || vercelState === 'NOT_FOUND';
  const chipColor = vercelState === 'READY' ? 'success'
    : vercelState === 'ERROR' ? 'error'
    : vercelState === 'BUILDING' || vercelState === 'QUEUED' ? 'warning'
    : 'default';
  return (
    <Chip
      label={isNoDeployments ? 'NO DEPLOYMENTS' : vercelState}
      size="small"
      variant={isNoDeployments ? 'outlined' : 'filled'}
      color={isNoDeployments ? 'warning' : chipColor}
      sx={{ fontWeight: isNoDeployments ? 600 : undefined, fontSize: '0.6rem', height: 18 }}
    />
  );
}

export function ExpandedSuiteAppsTable({ tenantSlug, tenantName, suite, onSelectApp, onSnackbar }: ExpandedSuiteAppsTableProps) {
  const { statusMap: appStatusMap } = useAppDeployStatusPoller(tenantSlug, suite.apps);

  const sortedApps = [...suite.apps].sort((a, b) => {
    const aCeo = a.appId === 'ceo-overview' || a.appId === 'owner-dashboard' ? 1 : 0;
    const bCeo = b.appId === 'ceo-overview' || b.appId === 'owner-dashboard' ? 1 : 0;
    return aCeo - bCeo;
  });

  return (
    <>
      {sortedApps.map((app) => {
        const appTpl = getTemplate(app.templateId);
        const vercelState = appStatusMap[app.appId]?.vercelState;
        const isNoDeployments = vercelState === 'NO_DEPLOYMENTS' || vercelState === 'NOT_FOUND';
        const displayStatus = appStatusMap[app.appId]?.status ?? app.status;
        const appStatusColor = STATUS_COLORS[displayStatus] ?? 'default';
        const isCeo =
          app.appId === 'ceo-overview'
          || app.appId === 'owner-dashboard'
          || (/ceo/i.test(app.appId) && /executive/i.test(app.department));
        return (
          <TableRow key={app.appId}>
            <TableCell
              sx={{
                cursor: 'pointer',
                '&:hover .app-name': { textDecoration: 'underline', color: 'primary.main' },
              }}
              onClick={() => onSelectApp(app.appId)}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" className="app-name" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {app.name}
                </Typography>
                {isCeo && suite.ceoOverview?.kpis?.length ? (
                  <Chip
                    label={`${suite.ceoOverview.kpis.length} KPIs`}
                    size="small"
                    variant="outlined"
                    color="success"
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                ) : null}
              </Stack>
            </TableCell>
            <TableCell>
              <Chip label={app.department} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            </TableCell>
            <TableCell>
              <Chip label={appTpl.label} size="small" variant="outlined" color="info" sx={{ fontSize: '0.7rem' }} />
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip label={displayStatus} size="small" color={appStatusColor} sx={{ fontSize: '0.7rem' }} />
                {getVercelStateChip(vercelState)}
              </Stack>
            </TableCell>
            <TableCell>
              {app.appUrl ? (
                <Button size="small" variant="text" href={app.appUrl} target="_blank" sx={{ fontSize: '0.7rem', textTransform: 'none' }}>
                  {app.appUrl.replace('https://', '').slice(0, 30)}
                </Button>
              ) : (
                <Typography variant="caption" color="text.disabled">—</Typography>
              )}
            </TableCell>
            <TableCell align="right">
              <AppActionsMenuButton
                tenantSlug={tenantSlug}
                tenantName={tenantName}
                app={app}
                onSnackbar={onSnackbar}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
