'use client';

import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export function VercelConnectButton() {
  const [status, setStatus] = useState<'loading' | 'configured' | 'expired' | 'not_configured'>('loading');
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config/vercel-token')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStatus(data.data.status || 'not_configured');
          setOauthUrl(data.data.oauthUrl || null);
        } else {
          setStatus('not_configured');
        }
      })
      .catch(() => setStatus('not_configured'));
  }, []);

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
