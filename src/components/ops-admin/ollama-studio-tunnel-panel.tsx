'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DEFAULT_OLLAMA_TUNNEL_HOST } from '@/lib/ollama-tunnel-host';
import { usePushOllamaTunnelHostMutation } from '@/store/apis/tenant-api';

export interface OllamaStudioTunnelPanelProps {
  /** Tenant slug — required for the Vercel push (wizard may pass slug before create). */
  tenantSlug?: string;
  tunnelHost: string;
  onTunnelHostChange: (value: string) => void;
  /** Optional callback when push succeeds (parent can merge into wizard state). */
  onPushSuccess?: (message: string) => void;
}

/**
 * ollama-studio setup: tunnel host URL + push to Vercel + Inngest env guidance.
 */
export function OllamaStudioTunnelPanel({
  tenantSlug,
  tunnelHost,
  onTunnelHostChange,
  onPushSuccess,
}: OllamaStudioTunnelPanelProps) {
  const [pushTunnelHost, { isLoading: isPushing }] = usePushOllamaTunnelHostMutation();
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  const handlePush = async () => {
    if (!tenantSlug?.trim()) {
      setPushError('Enter a tenant slug first (step 1 of the wizard).');
      return;
    }
    setPushMessage(null);
    setPushError(null);
    try {
      const res = await pushTunnelHost({
        slug: tenantSlug.trim(),
        confirm: true,
        tunnelHost: tunnelHost.trim() || DEFAULT_OLLAMA_TUNNEL_HOST,
      }).unwrap();
      const msg = res.data?.message ?? `OLLAMA_TUNNEL_HOST pushed for ${tenantSlug}.`;
      setPushMessage(msg);
      onPushSuccess?.(msg);
    } catch (err) {
      setPushError(err instanceof Error ? err.message : 'OLLAMA_TUNNEL_HOST push failed');
    }
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        TokenizMyApp-Studio-AI uses the factory Ollama proxy — no API key is required.
        Models are loaded from the Mac Studio tunnel. Set{' '}
        <code>OLLAMA_TUNNEL_HOST</code> on Vercel so server-side chat reaches the live tunnel.
      </Alert>

      <TextField
        label="Ollama tunnel host"
        size="small"
        fullWidth
        value={tunnelHost}
        onChange={(e) => onTunnelHostChange(e.target.value)}
        placeholder={DEFAULT_OLLAMA_TUNNEL_HOST}
        helperText="Base URL for Mac Studio Ollama (no trailing slash). Default: https://ollama.tokenizin.com"
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
      />

      <Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={isPushing ? undefined : <CloudUploadIcon />}
          onClick={() => void handlePush()}
          disabled={isPushing || !tenantSlug?.trim()}
        >
          {isPushing ? 'Pushing…' : 'Confirm & push tunnel host to Vercel'}
        </Button>
        {!tenantSlug?.trim() ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            Set the tenant slug in step 1 before pushing env vars.
          </Typography>
        ) : null}
      </Box>

      {pushError ? <Alert severity="error">{pushError}</Alert> : null}
      {pushMessage ? <Alert severity="success">{pushMessage}</Alert> : null}

      <Alert severity="warning" variant="outlined">
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Inngest (optional workflows)
        </Typography>
        <Typography variant="body2" component="div">
          If you see Inngest <strong>401</strong> errors in logs, either remove{' '}
          <code>INNGEST_EVENT_KEY</code> from Vercel when workflows are unused, or set a valid
          event key from the{' '}
          <a
            href="https://app.inngest.com/env/production/manage/keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inngest dashboard
          </a>
          . Without a key, event emission is skipped safely — only remove the var if you do not
          rely on Inngest durable workflows.
        </Typography>
      </Alert>
    </Stack>
  );
}
