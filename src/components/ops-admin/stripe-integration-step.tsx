'use client';

/**
 * Shared Stripe-via-Vercel step for Create App / Edit App wizards.
 *
 * Enables Stripe payments on the tenant app deployed to Vercel:
 * - Toggle enablement (stored on app/tenant config)
 * - Optionally inherit tenant Organization & Billing keys
 * - Keys are pushed to the Vercel project env (STRIPE_* / NEXT_PUBLIC_*)
 *   so the template lib/stripe.ts + Embedded Checkout work in production
 */

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PaymentIcon from '@mui/icons-material/Payment';
import Paper from '@mui/material/Paper';

export type StripeWizardValues = {
  enabled: boolean;
  inheritFromTenant: boolean;
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
};

export const EMPTY_STRIPE_WIZARD: StripeWizardValues = {
  enabled: false,
  inheritFromTenant: true,
  secretKey: '',
  webhookSecret: '',
  publishableKey: '',
};

type Props = {
  value: StripeWizardValues;
  onChange: (next: StripeWizardValues) => void;
  /** When true, show that tenant-level keys already exist. */
  tenantHasKeys?: boolean;
  showSecrets?: boolean;
};

export function StripeIntegrationStep({
  value,
  onChange,
  tenantHasKeys = false,
  showSecrets = false,
}: Props) {
  const patch = (partial: Partial<StripeWizardValues>) => onChange({ ...value, ...partial });

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <PaymentIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Stripe Integration (via Vercel)
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
        <AlertTitle>Runs inside the Vercel app</AlertTitle>
        Enabling Stripe installs payment support in the deployed Next.js app
        (<code>lib/stripe.ts</code>, Embedded Checkout). Secrets are stored as
        Vercel project env vars — not in the git repo — so production uses the
        Vercel ↔ Stripe wiring for this app only.
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
                checked={value.inheritFromTenant}
                onChange={(e) => patch({ inheritFromTenant: e.target.checked })}
                color="primary"
              />
            }
            label={
              tenantHasKeys
                ? 'Use tenant Organization & Billing Stripe keys (recommended)'
                : 'Use tenant Organization & Billing Stripe keys (configure keys on the tenant first)'
            }
          />

          {!value.inheritFromTenant ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  App-specific keys override the tenant defaults when pushed to this
                  app&apos;s Vercel project.
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
                ? 'Tenant Stripe keys will be pushed to this app’s Vercel env on deploy / Save.'
                : 'No tenant Stripe keys yet — open Edit Tenant → Organization & Billing to add them, or enter app-specific keys above.'}
            </Alert>
          )}
        </Stack>
      ) : null}
    </Stack>
  );
}
