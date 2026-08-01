'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
        <Chip label="Vercel…" size="small" variant="outlined" />
      </Tooltip>
    );
  }

  if (status === 'configured') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Vercel is connected and ready for auto-deploy">
          <Chip label="Vercel ✓" size="small" color="success" variant="outlined" />
        </Tooltip>
        {oauthUrl && (
          <Tooltip title="Reconnect to Vercel">
            <Button
              component="a"
              href={oauthUrl}
              size="small"
              variant="text"
              sx={{ minWidth: 'auto', px: 0.5, fontSize: '0.75rem', textTransform: 'none' }}
            >
              Reconnect
            </Button>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Tooltip title={status === 'expired' ? 'Vercel token expired — reconnect' : 'Connect to Vercel for auto-deploy'}>
      <Button
        component="a"
        href={oauthUrl || '/api/auth/vercel/authorize'}
        size="small"
        variant="outlined"
        color={status === 'expired' ? 'warning' : 'primary'}
        startIcon={<OpenInNewIcon />}
        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
      >
        {status === 'expired' ? 'Reconnect Vercel' : 'Connect Vercel'}
      </Button>
    </Tooltip>
  );
}
