'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { CreditGrant } from '@/store/apis/organization-api';

/**
 * Start / Expires / Amount / Remaining, per grant.
 *
 * This table is what makes 30-day expiry legible instead of infuriating.
 * Credits are consumed oldest-expiring-first, so a customer watching only a
 * single balance number cannot tell which credits are about to lapse or why
 * the number dropped — and "my credits vanished" is the support ticket this
 * prevents.
 */

const SOURCE_LABELS: Record<CreditGrant['source'], string> = {
  plan: 'Plan',
  addon: 'Purchased',
  onetime: 'Volume deal',
  promo: 'Bonus',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Whole days until `iso`. Negative once past. */
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function CreditGrantsTable({ grants }: { grants: CreditGrant[] }) {
  if (grants.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No credit grants yet.
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Remaining</TableCell>
            <TableCell sx={{ width: 120 }}>Used</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grants.map((grant) => {
            const days = daysUntil(grant.expiresAt);
            const expired = days < 0;
            const spent = grant.amount - grant.remaining;
            const usedPct = grant.amount > 0 ? (spent / grant.amount) * 100 : 0;
            // A grant with nothing left is finished business, not a warning —
            // only a grant still holding credits can actually lose the customer
            // anything by expiring.
            const expiringSoon = !expired && days <= 7 && grant.remaining > 0;

            return (
              <TableRow key={grant.id} sx={{ opacity: expired || grant.remaining === 0 ? 0.55 : 1 }}>
                <TableCell>
                  <Chip
                    label={SOURCE_LABELS[grant.source] ?? grant.source}
                    size="small"
                    variant="outlined"
                    color={grant.source === 'promo' ? 'secondary' : 'default'}
                  />
                </TableCell>
                <TableCell>{formatDate(grant.grantedAt)}</TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      expired
                        ? 'Expired — any unspent credits from this grant are gone'
                        : `${days} day${days === 1 ? '' : 's'} left`
                    }
                  >
                    <Box
                      component="span"
                      sx={{
                        color: expired
                          ? 'text.disabled'
                          : expiringSoon
                            ? 'warning.main'
                            : 'text.primary',
                        fontWeight: expiringSoon ? 600 : 400,
                      }}
                    >
                      {formatDate(grant.expiresAt)}
                      {expiringSoon ? ' ⚠' : ''}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {grant.amount}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  {expired ? 0 : grant.remaining}
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, usedPct)}
                    sx={(theme) => ({
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.text.secondary, 0.25),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.success.main,
                        borderRadius: 3,
                      },
                    })}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
