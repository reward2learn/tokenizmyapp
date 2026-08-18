'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useGetCloudUsageQuery } from '@/store/apis/organization-api';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Settings → Billing → Cloud Credits.
 *
 * The per-resource table the roadmap specified, over the storage that now
 * exists — but the collector that fills it does not, so most rows read
 * "Not metered" rather than "0".
 *
 * That distinction is the entire point of this component. A confident zero
 * against Database storage would tell an operator their apps consume nothing,
 * which is false: the apps run on our Vercel and Neon accounts and cost real
 * money. "Not metered" says the true thing — nobody is counting yet.
 *
 * AI Gateway is the exception and is populated, because Phase 3 already meters
 * it through the credit ledger.
 */
export function CloudCreditsTab({ orgId }: { orgId: string }) {
  const { data, isLoading } = useGetCloudUsageQuery(orgId, { skip: !orgId });

  if (isLoading) return <Skeleton variant="rounded" height={340} />;

  const report = data?.data;
  if (!report) {
    return <Alert severity="warning">Cloud usage could not be read.</Alert>;
  }

  const period = `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(
    report.periodEnd,
  ).toLocaleDateString()}`;

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
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minWidth: 220, borderRadius: `${RADIUS.card}px` }}
        >
          <Typography variant="body2" color="text.secondary">
            Period
          </Typography>
          <Typography variant="body1">{period}</Typography>
        </Paper>
      </Stack>

      <Alert severity={report.awaitingCollector ? 'warning' : 'info'}>
        <AlertTitle>
          {report.awaitingCollector ? 'Nothing is being metered yet' : 'Partial metering'}
        </AlertTitle>
        Rows marked <strong>Not metered</strong> have no collector reading them. Deployed apps
        do consume Vercel and Neon capacity on our accounts — a zero there would mean nobody is
        counting, not that nothing was used. Wiring a usage source and a rate card is the
        remaining Phase 5 work; see <code>/api/cron/cloud-credits</code>.
      </Alert>

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
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
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <span>{r.label}</span>
                      {!metered && (
                        <Tooltip title="No collector is reading this resource yet">
                          <Chip label="Not metered" size="small" variant="outlined" color="warning" />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {/* No allowance is set for any resource. Printing "0" would
                        read as "nothing included", which is a pricing claim we
                        have not made. */}
                    <Typography variant="body2" color="text.secondary">
                      {r.included === null ? 'Not set' : `${r.included} ${r.unit}`}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metered ? `${r.used.toLocaleString()} ${r.unit}` : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metered ? r.additional.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {/* No rate card exists. A dollar figure here would be
                        invented, and an invoice built on it indefensible. */}
                    {metered && r.additionalCostCents > 0
                      ? `$${(r.additionalCostCents / 100).toFixed(2)}`
                      : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}
