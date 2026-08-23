'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type {
  CreditUserBreakdown,
  CreditUsageByModel,
  CreditUsageByProvider,
} from '@/domain/billing/credit-analytics';

function userLabel(row: CreditUserBreakdown): string {
  if (row.sharedPool) return 'Shared plan pool';
  if (row.name && row.email) return `${row.name} (${row.email})`;
  return row.name || row.email || row.userId || 'Unknown user';
}

export function CreditAdminAnalyticsPanels({
  users,
  byProvider,
  byModel,
}: {
  users: CreditUserBreakdown[];
  byProvider: CreditUsageByProvider[];
  byModel: CreditUsageByModel[];
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Users &amp; top-ups
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Personal top-ups are owned by the purchaser. Plan credits stay in the shared pool.
        </Typography>
        {users.length === 0 ? (
          <Alert severity="info">
            No personal top-ups yet. Plan-shared credits and usage without a recorded user appear
            here once available.
          </Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell align="right">Purchased left</TableCell>
                <TableCell align="right">Bonus left</TableCell>
                <TableCell align="right">Purchased (lifetime)</TableCell>
                <TableCell align="right">Bonus (lifetime)</TableCell>
                <TableCell align="right">Spent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row) => (
                <TableRow key={row.sharedPool ? 'shared' : (row.userId ?? 'unknown')}>
                  <TableCell>
                    <Typography variant="body2">{userLabel(row)}</Typography>
                    {row.userId && !row.sharedPool && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace', display: 'block' }}
                      >
                        {row.userId}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.purchasedRemaining}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.bonusRemaining}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.purchasedGranted}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.bonusGranted}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.spent}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Usage by provider
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Credits spent across AI providers (inferred from ledger metadata when available).
        </Typography>
        {byProvider.length === 0 ? (
          <Alert severity="info">No metered AI usage recorded yet.</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell align="right">Prompt tokens</TableCell>
                <TableCell align="right">Completion tokens</TableCell>
                <TableCell align="right">Runs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byProvider.map((row) => (
                <TableRow key={row.provider}>
                  <TableCell>{row.provider}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.credits}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.promptTokens.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.completionTokens.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.runs}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Usage by model
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Credits spent by model the user selected for generation.
        </Typography>
        {byModel.length === 0 ? (
          <Alert severity="info">No model-level usage recorded yet.</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell align="right">Prompt tokens</TableCell>
                <TableCell align="right">Completion tokens</TableCell>
                <TableCell align="right">Runs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byModel.map((row) => (
                <TableRow key={`${row.provider}:${row.model}`}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {row.model}
                  </TableCell>
                  <TableCell>{row.provider}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.credits}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.promptTokens.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.completionTokens.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.runs}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Stack>
  );
}
