'use client';

/**
 * AppRow — shared chrome for one suite app, used by both the "All Tenants"
 * expandable suite view (tenant-dashboard.tsx) and the Redux-scoped
 * "Apps under this tenant" list (tenant-admin-panel.tsx). Previously each
 * surface rendered this independently and only one of them had a menu.
 */
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getTemplate } from '@/domain/tenant/template-catalog';
import type { SuiteAppInstance } from '@/store/apis/tenant-api';
import { AppActionsMenuButton } from './app-actions-menu';

export interface AppRowProps {
  tenantSlug: string;
  tenantName: string;
  app: SuiteAppInstance;
  selected?: boolean;
  onSelect?: (appId: string) => void;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function AppRow({ tenantSlug, tenantName, app, selected, onSelect, onSnackbar }: AppRowProps) {
  const tpl = getTemplate(app.templateId);

  return (
    <Paper
      variant="outlined"
      onClick={onSelect ? () => onSelect(app.appId) : undefined}
      sx={{
        p: 1.5,
        bgcolor: selected ? 'action.selected' : 'action.hover',
        borderColor: selected ? 'primary.main' : 'divider',
        borderWidth: selected ? 2 : 1,
        cursor: onSelect ? 'pointer' : 'default',
        '&:hover': onSelect ? { borderColor: 'primary.main' } : undefined,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: selected ? 700 : 500 }}>
            {app.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {app.appId}{app.department !== '—' ? ` • ${app.department}` : ''} • {tpl.label}
          </Typography>
          {app.appUrl && (
            <Typography variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
              {app.appUrl}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
          {selected && <Chip label="Selected" size="small" color="primary" variant="filled" />}
          <Chip
            label={app.status}
            size="small"
            color={app.status === 'live' ? 'success' : app.status === 'error' ? 'error' : 'default'}
          />
          <AppActionsMenuButton tenantSlug={tenantSlug} tenantName={tenantName} app={app} onSnackbar={onSnackbar} />
        </Stack>
      </Stack>
    </Paper>
  );
}
