'use client';

/**
 * Shared Stripe-via-Vercel step for Create App / Edit App wizards.
 *
 * Two complementary paths (Marketplace preferred):
 * 1. Vercel Marketplace "Install Stripe" OAuth — Vercel provisions
 *    STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY onto the project.
 * 2. Manual key push — paste keys (or inherit tenant Organization & Billing)
 *    and push via /stripe-env (fallback / webhook secret).
 */

import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaymentIcon from '@mui/icons-material/Payment';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  useLazyGetStripeMarketplaceStatusQuery,
  usePrepareStripeMarketplaceInstallMutation,
} from '@/store/apis/tenant-api';

export type StripeWizardValues = {
  enabled: boolean;
  /** Prefer Marketplace OAuth; key fields are the fallback. */
  preferMarketplace: boolean;
  inheritFromTenant: boolean;
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
};

export const EMPTY_STRIPE_WIZARD: StripeWizardValues = {
  enabled: false,
  preferMarketplace: true,
  inheritFromTenant: true,
  secretKey: '',
  webhookSecret: '',
  publishableKey: '',
};

type Props = {
  value: StripeWizardValues;
  onChange: (next: StripeWizardValues) => void;
  tenantSlug: string;
  /** Suite app id when editing/creating a suite app; omit for tenant project. */
  appId?: string | null;
  /** When true, show that tenant-level keys already exist. */
  tenantHasKeys?: boolean;
  showSecrets?: boolean;
};

export function StripeIntegrationStep({
  value,
  onChange,
  tenantSlug,
  appId = null,
  tenantHasKeys = false,
  showSecrets = false,
}: Props) {
  const patch = (partial: Partial<StripeWizardValues>) => onChange({ ...value, ...partial });

  const [fetchStatus, { data: statusEnvelope, isFetching }] =
    useLazyGetStripeMarketplaceStatusQuery();
  const [prepareInstall, { isLoading: preparing }] =
    usePrepareStripeMarketplaceInstallMutation();
  const [note, setNote] = useState<string | null>(null);

  const status = statusEnvelope?.data;

  const refreshStatus = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      await fetchStatus({ slug: tenantSlug, appId: appId ?? undefined }).unwrap();
      setNote(null);
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Failed to refresh Marketplace status');
    }
  }, [tenantSlug, appId, fetchStatus]);

  const openMarketplaceInstall = useCallback(async () => {
    try {
      const res = await prepareInstall({
        slug: tenantSlug,
        appId: appId ?? undefined,
      }).unwrap();
      const installUrl = res.data?.installUrl ?? 'https://vercel.com/marketplace/stripe';
      window.open(installUrl, '_blank', 'noopener,noreferrer');
      setNote(
        'Complete Install / Import in the Vercel tab, then Connect Project and Refresh Status.',
      );
    } catch (err) {
      window.open('https://vercel.com/marketplace/stripe', '_blank', 'noopener,noreferrer');
      setNote(err instanceof Error ? err.message : 'Opened Marketplace; API helper failed.');
    }
  }, [tenantSlug, appId, prepareInstall]);

  const openConnectProject = useCallback(() => {
    const url = status?.projectIntegrationsUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    void openMarketplaceInstall();
  }, [status?.projectIntegrationsUrl, openMarketplaceInstall]);

  const sourceChip =
    status?.source === 'marketplace' ? (
      <Chip size="small" color="success" label="Marketplace connected" />
    ) : status?.source === 'manual_or_mixed' ? (
      <Chip size="small" color="warning" label="Keys present (manual / mixed)" />
    ) : status?.source === 'none' ? (
      <Chip size="small" variant="outlined" label="Not connected" />
    ) : status ? (
      <Chip size="small" variant="outlined" label="Status unknown" />
    ) : null;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <PaymentIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Stripe Integration (via Vercel)
        </Typography>
        {sourceChip}
      </Stack>

      <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
        <AlertTitle>Marketplace Install + optional key push</AlertTitle>
        Prefer <strong>Vercel Marketplace → Install Stripe</strong> (sandbox or import live).
        Vercel OAuth-provisions <code>STRIPE_SECRET_KEY</code> and{' '}
        <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> onto the project. Manual key push
        remains available for overrides and <code>STRIPE_WEBHOOK_SECRET</code>.
      </Alert>

      <FormControlLabel
        control={
          <Switch
            checked={value.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
            color="primary"
          />
        }
        label="Enable Stripe payments for this app"
      />

      {value.enabled ? (
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={value.preferMarketplace}
                onChange={(e) => patch({ preferMarketplace: e.target.checked })}
                color="primary"
              />
            }
            label="Use Vercel Marketplace Install Stripe (recommended)"
          />

          {value.preferMarketplace ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Stripe is a connectable Marketplace integration — finish OAuth / claim in the
                  browser, then connect this project so Vercel writes the env vars.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      preparing ? <CircularProgress size={14} color="inherit" /> : <OpenInNewIcon />
                    }
                    onClick={() => void openMarketplaceInstall()}
                    disabled={preparing || !tenantSlug}
                  >
                    Install Stripe on Vercel
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={openConnectProject}
                    disabled={!tenantSlug}
                  >
                    Connect Project
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={isFetching ? <CircularProgress size={14} /> : <RefreshIcon />}
                    onClick={() => void refreshStatus()}
                    disabled={isFetching || !tenantSlug}
                  >
                    Refresh Status
                  </Button>
                </Stack>

                {status ? (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Project: {status.projectId ?? 'not deployed yet'}
                      {status.teamInstallationId
                        ? ` · Team install: ${status.teamInstallationStatus ?? status.teamInstallationId}`
                        : ' · No team Marketplace install detected yet'}
                    </Typography>
                    <Typography variant="caption">
                      Secret key: {status.secretKeyPresent ? '✅' : '—'} · Publishable:{' '}
                      {status.publishableKeyPresent ? '✅' : '—'} · Webhook secret:{' '}
                      {status.webhookSecretPresent ? '✅' : '— (optional via key push)'}
                    </Typography>
                    {status.note ? (
                      <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                        {status.note}
                      </Alert>
                    ) : null}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Click Refresh Status after deploy + Marketplace install to verify env keys.
                  </Typography>
                )}
                {note ? (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    {note}
                  </Alert>
                ) : null}
              </Stack>
            </Paper>
          ) : null}

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Key push fallback
            </Typography>
          </Divider>

          <FormControlLabel
            control={
              <Switch
                checked={value.inheritFromTenant}
                onChange={(e) => patch({ inheritFromTenant: e.target.checked })}
                color="primary"
              />
            }
            label={
              tenantHasKeys
                ? 'Use tenant Organization & Billing Stripe keys when pushing'
                : 'Use tenant Organization & Billing Stripe keys (configure on tenant first)'
            }
          />

          {!value.inheritFromTenant ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  App-specific keys override Marketplace / tenant defaults when pushed via
                  Save → stripe-env. Prefer Marketplace for secret + publishable; use this for
                  webhook signing secrets or break-glass overrides.
                </Typography>
                <TextField
                  label="STRIPE_SECRET_KEY"
                  type={showSecrets ? 'text' : 'password'}
                  value={value.secretKey}
                  onChange={(e) => patch({ secretKey: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="sk_test_… or rk_…"
                  helperText="Server-only. Prefer a restricted key (rk_)."
                />
                <TextField
                  label="STRIPE_WEBHOOK_SECRET"
                  type={showSecrets ? 'text' : 'password'}
                  value={value.webhookSecret}
                  onChange={(e) => patch({ webhookSecret: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="whsec_…"
                />
                <TextField
                  label="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
                  type={showSecrets ? 'text' : 'password'}
                  value={value.publishableKey}
                  onChange={(e) => patch({ publishableKey: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="pk_test_…"
                  helperText="Inlined into the client bundle at build time — redeploy after changing."
                />
              </Stack>
            </Paper>
          ) : (
            <Alert severity={tenantHasKeys ? 'success' : 'warning'} sx={{ fontSize: '0.85rem' }}>
              {tenantHasKeys
                ? 'Tenant Stripe keys will be pushed to this app’s Vercel env on deploy / Save (alongside or instead of Marketplace).'
                : 'No tenant Stripe keys yet — rely on Marketplace Install, or open Edit Tenant → Organization & Billing.'}
            </Alert>
          )}
        </Stack>
      ) : null}
    </Stack>
  );
}
