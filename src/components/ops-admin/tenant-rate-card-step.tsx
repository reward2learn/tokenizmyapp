'use client';

/**
 * Tenant wizard — AI Rate Card step.
 *
 * Collects scale / commercial / hardware inputs and previews the secured
 * markup % and resulting plan/pack credit grants. The server recomputes on
 * save; this UI never sends a client-authored markup as the charge authority
 * unless the platform admin explicitly locks one later in org settings.
 */
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {
  computeTenantRateCard,
  defaultRateCardInputs,
  DEFAULT_MAC_STUDIO_ULTRA_256_USD,
  formatMarkupPercent,
  type TenantRateCardInputs,
} from '@/lib/billing/tenant-rate-card';

export interface TenantRateCardStepProps {
  value: Partial<TenantRateCardInputs>;
  onChange: (patch: Partial<TenantRateCardInputs>) => void;
  /** Suggested app count from suite selection. */
  suggestedAppCount?: number;
  /** Optional deep-link to Platform Admin calculator tab. */
  onOpenCalculator?: () => void;
}

export function TenantRateCardStep({
  value,
  onChange,
  suggestedAppCount = 1,
  onOpenCalculator,
}: TenantRateCardStepProps) {
  const inputs = defaultRateCardInputs({
    appCount: value.appCount ?? suggestedAppCount,
    userCount: value.userCount ?? 1,
    annualRevenueUsd: value.annualRevenueUsd ?? 0,
    macStudioCostUsd: value.macStudioCostUsd ?? DEFAULT_MAC_STUDIO_ULTRA_256_USD,
    monthlyThirdPartyUsd: value.monthlyThirdPartyUsd ?? 0,
  });
  const preview = computeTenantRateCard(inputs);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          AI credit rate card
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Markup is calculated from apps, users, annual turnover, Mac Studio Ultra
          (256) hardware amortization, and third-party cloud spend. Plan and top-up
          AI credits are sized so the platform keeps at least a 30% margin on
          gpt-4o list COGS — higher when this tenant is larger or costlier to run.
        </Typography>
      </Box>

      <Alert severity="info">
        Preview markup:{' '}
        <strong>{formatMarkupPercent(preview.markupPercent)}</strong>
        {' · '}
        ~{preview.creditsPerUsd} credits / $1
        {onOpenCalculator ? (
          <>
            {' · '}
            <Button size="small" onClick={onOpenCalculator} sx={{ textTransform: 'none' }}>
              Open calculator
            </Button>
          </>
        ) : null}
      </Alert>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Apps in suite"
          type="number"
          size="small"
          fullWidth
          value={inputs.appCount}
          onChange={(e) => onChange({ appCount: Math.max(1, Number(e.target.value) || 1) })}
          helperText={suggestedAppCount > 1 ? `Suite suggests ${suggestedAppCount}` : undefined}
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <TextField
          label="User accounts"
          type="number"
          size="small"
          fullWidth
          value={inputs.userCount}
          onChange={(e) => onChange({ userCount: Math.max(1, Number(e.target.value) || 1) })}
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </Stack>

      <TextField
        label="Annual turnover (USD)"
        type="number"
        size="small"
        fullWidth
        value={inputs.annualRevenueUsd || ''}
        onChange={(e) =>
          onChange({ annualRevenueUsd: Math.max(0, Number(e.target.value) || 0) })
        }
        helperText="Tenant / business annual revenue — scales commercial markup"
        slotProps={{ htmlInput: { min: 0, step: 1000 } }}
      />

      <TextField
        label="Mac Studio Ultra 256 reference (USD)"
        type="number"
        size="small"
        fullWidth
        value={inputs.macStudioCostUsd}
        onChange={(e) =>
          onChange({ macStudioCostUsd: Math.max(0, Number(e.target.value) || 0) })
        }
        helperText={`Default market reference $${DEFAULT_MAC_STUDIO_ULTRA_256_USD.toLocaleString()} · amortized over 36 months`}
        slotProps={{ htmlInput: { min: 0, step: 100 } }}
      />

      <TextField
        label="Monthly 3rd-party cloud spend (USD)"
        type="number"
        size="small"
        fullWidth
        value={inputs.monthlyThirdPartyUsd || ''}
        onChange={(e) =>
          onChange({ monthlyThirdPartyUsd: Math.max(0, Number(e.target.value) || 0) })
        }
        helperText="Vercel, Neon, storage, etc. — updated automatically from usage later"
        slotProps={{ htmlInput: { min: 0, step: 10 } }}
      />

      <Divider />

      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Credit grants at this markup
      </Typography>
      <Stack spacing={0.5}>
        <Typography variant="body2">
          Free plan / month: <strong>{preview.planCredits.free.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2">
          Pro plan / month: <strong>{preview.planCredits.pro.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2">
          Business plan / month:{' '}
          <strong>{preview.planCredits.business.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2">
          $25 top-up: <strong>{preview.packCredits['pack-25'].toLocaleString()}</strong> credits
        </Typography>
        <Typography variant="body2">
          $50 top-up: <strong>{preview.packCredits['pack-50'].toLocaleString()}</strong> credits
        </Typography>
        <Typography variant="body2">
          $100 top-up: <strong>{preview.packCredits['pack-100'].toLocaleString()}</strong> credits
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Breakdown — floor {(preview.breakdown.floor * 100).toFixed(0)}% + apps{' '}
        {(preview.breakdown.appFactor * 100).toFixed(1)}% + users{' '}
        {(preview.breakdown.userFactor * 100).toFixed(1)}% + revenue{' '}
        {(preview.breakdown.revenueFactor * 100).toFixed(1)}% + hardware{' '}
        {(preview.breakdown.hardwareFactor * 100).toFixed(1)}% + expenses{' '}
        {(preview.breakdown.expenseFactor * 100).toFixed(1)}%
      </Typography>
    </Stack>
  );
}
