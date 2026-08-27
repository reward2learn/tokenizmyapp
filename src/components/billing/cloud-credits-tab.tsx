'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  useGetCloudUsageQuery,
  useUpdateCloudAutoTopUpMutation,
} from '@/store/apis/organization-api';
import { StripeCloudTopUpDialog } from '@/components/ops-admin/stripe-cloud-topup-dialog';
import { CLOUD_TOPUP_PRESETS_CENTS, CREDIT_PACK_MIN_PRICE_CENTS } from '@/lib/billing/plans';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Settings → Billing → Cloud Credits.
 *
 * Shows allocated Vercel/Neon usage (hybrid split by project/branch count —
 * approximate, not FOCUS ResourceIds), plan-included pool, Add balance, and
 * auto top-up controls.
 */
export function CloudCreditsTab({ orgId }: { orgId: string }) {
  const { data, isLoading } = useGetCloudUsageQuery(orgId, { skip: !orgId });
  const [updateAutoTopUp, { isLoading: savingAuto }] = useUpdateCloudAutoTopUpMutation();
  const [topUpCents, setTopUpCents] = useState<number | null>(null);
  const [customCents, setCustomCents] = useState('');
  const [thresholdDollars, setThresholdDollars] = useState('5');
  const [amountDollars, setAmountDollars] = useState('25');
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const report = data?.data;

  useEffect(() => {
    if (!report) return;
    setAutoEnabled(report.autoTopUpThreshold != null && report.autoTopUpAmount != null);
    if (report.autoTopUpThreshold != null) {
      setThresholdDollars(String(report.autoTopUpThreshold / 100));
    }
    if (report.autoTopUpAmount != null) {
      setAmountDollars(String(report.autoTopUpAmount / 100));
    }
  }, [report?.autoTopUpThreshold, report?.autoTopUpAmount]);

  if (isLoading) return <Skeleton variant="rounded" height={340} />;

  if (!report) {
    return <Alert severity="warning">Cloud usage could not be read.</Alert>;
  }

  const period = `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(
    report.periodEnd,
  ).toLocaleDateString()}`;

  const saveAutoTopUp = async () => {
    setSaveError(null);
    try {
      if (!autoEnabled) {
        await updateAutoTopUp({
          orgId,
          autoTopUpThreshold: null,
          autoTopUpAmount: null,
        }).unwrap();
        return;
      }
      const threshold = Math.round(Number(thresholdDollars) * 100);
      const amount = Math.round(Number(amountDollars) * 100);
      if (!Number.isFinite(threshold) || threshold < 0) {
        setSaveError('Threshold must be a non-negative dollar amount.');
        return;
      }
      if (!Number.isFinite(amount) || amount < CREDIT_PACK_MIN_PRICE_CENTS) {
        setSaveError(`Auto top-up amount must be at least $${CREDIT_PACK_MIN_PRICE_CENTS / 100}.`);
        return;
      }
      await updateAutoTopUp({
        orgId,
        autoTopUpThreshold: threshold,
        autoTopUpAmount: amount,
      }).unwrap();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save auto top-up.');
    }
  };

  const startCustomTopUp = () => {
    const cents = Math.round(Number(customCents) * 100);
    if (!Number.isFinite(cents) || cents < CREDIT_PACK_MIN_PRICE_CENTS) return;
    setTopUpCents(cents);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minWidth: 220, borderRadius: `${RADIUS.card}px` }}
        >
          <Typography variant="body2" color="text.secondary">
            Cloud balance
          </Typography>
          <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            ${(report.balanceCents / 100).toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            May go negative — an app is never cut off mid-month over a few cents.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
            {CLOUD_TOPUP_PRESETS_CENTS.map((cents) => (
              <Button
                key={cents}
                size="small"
                variant="outlined"
                onClick={() => setTopUpCents(cents)}
              >
                Add ${cents / 100}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label="Custom $"
              value={customCents}
              onChange={(e) => setCustomCents(e.target.value)}
              sx={{ width: 120 }}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={startCustomTopUp}
              disabled={
                !Number.isFinite(Number(customCents)) ||
                Number(customCents) * 100 < CREDIT_PACK_MIN_PRICE_CENTS
              }
            >
              Add
            </Button>
          </Stack>
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minWidth: 220, borderRadius: `${RADIUS.card}px` }}
        >
          <Typography variant="body2" color="text.secondary">
            Period
          </Typography>
          <Typography variant="body1">{period}</Typography>
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
              Included pool ${(report.includedCostCents / 100).toFixed(2)} · Used $
              {(report.usedCostCents / 100).toFixed(2)} · Overage $
              {(report.additionalCostCents / 100).toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: `${RADIUS.card}px` }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoEnabled}
              onChange={(_, checked) => setAutoEnabled(checked)}
            />
          }
          label="Auto top-up when balance is low"
        />
        {autoEnabled && (
          <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
            <TextField
              size="small"
              label="Threshold $"
              value={thresholdDollars}
              onChange={(e) => setThresholdDollars(e.target.value)}
              sx={{ width: 140 }}
            />
            <TextField
              size="small"
              label="Top-up amount $"
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
              sx={{ width: 140 }}
            />
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
          <Button size="small" variant="contained" onClick={saveAutoTopUp} disabled={savingAuto}>
            {savingAuto ? 'Saving…' : 'Save auto top-up'}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Requires a default card on Payment Methods.
          </Typography>
        </Stack>
        {saveError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {saveError}
          </Alert>
        )}
      </Paper>

      <Alert severity={report.awaitingCollector ? 'warning' : 'info'}>
        <AlertTitle>
          {report.awaitingCollector ? 'Nothing collected yet for this org' : 'Allocated metering'}
        </AlertTitle>
        Vercel and Neon charges are <strong>allocated</strong> across organizations by known
        project and branch counts (approximate). They are not per-ResourceId FOCUS lines. Rows
        marked <strong>Not metered</strong> have no collector rows for this org yet.
      </Alert>

      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell>Resource</TableCell>
              <TableCell>Included</TableCell>
              <TableCell align="right">Used</TableCell>
              <TableCell align="right">Additional</TableCell>
              <TableCell align="right">Additional cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.resources.map((r) => {
              const metered = r.state === 'metered';
              return (
                <TableRow key={r.resource}>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <span>{r.label}</span>
                      {!metered && (
                        <Tooltip title="No collector rows for this resource yet">
                          <Chip
                            label="Not metered"
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {r.resource === 'ai_gateway'
                        ? '—'
                        : r.included === null
                          ? 'Pool (see summary)'
                          : `${r.included} ${r.unit}`}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metered ? `${r.used.toLocaleString()} ${r.unit}` : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metered ? r.additional.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metered && r.additionalCostCents > 0
                      ? `$${(r.additionalCostCents / 100).toFixed(2)}`
                      : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {topUpCents != null && (
        <StripeCloudTopUpDialog
          open
          orgId={orgId}
          amountCents={topUpCents}
          onClose={() => setTopUpCents(null)}
        />
      )}
    </Stack>
  );
}
