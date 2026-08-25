'use client';

import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useGetVercelTokenStatusQuery } from '@/store/apis/config-api';

export function VercelConnectButton() {
  const { data, isLoading, isError } = useGetVercelTokenStatusQuery();
  const status: 'loading' | 'configured' | 'expired' | 'not_configured' = isLoading
    ? 'loading'
    : isError || !data?.success
      ? 'not_configured'
      : data.data.status ?? 'not_configured';
  const oauthUrl = data?.success ? data.data.oauthUrl : null;

  if (status === 'loading') {
    return (
      <Tooltip title="Checking Vercel connection…">
        <span>
          <IconButton size="small" disabled aria-label="Checking Vercel connection">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  if (status === 'configured') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Vercel is connected and ready for auto-deploy">
          <Chip
            icon={<CheckCircleOutlineIcon />}
            label="Vercel"
            size="small"
            color="success"
            variant="outlined"
          />
        </Tooltip>
        {oauthUrl && (
          <Tooltip title="Reconnect Vercel">
            <IconButton
              component="a"
              href={oauthUrl}
              size="small"
              aria-label="Reconnect Vercel"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  const label = status === 'expired' ? 'Reconnect Vercel' : 'Connect Vercel';

  return (
    <Tooltip title={label}>
      <IconButton
        component="a"
        href={oauthUrl || '/api/auth/vercel/authorize'}
        size="small"
        color={status === 'expired' ? 'warning' : 'primary'}
        aria-label={label}
      >
        <OpenInNewIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
