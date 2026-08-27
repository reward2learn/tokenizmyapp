'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type {
  CreditUserBreakdown,
  CreditUsageByModel,
  CreditUsageByProvider,
} from '@/domain/billing/credit-analytics';

export type CreditUsageAnalyticsTab = 'users' | 'provider' | 'model';

function userLabel(row: CreditUserBreakdown): string {
  if (row.sharedPool) return 'Shared plan pool';
  if (row.name && row.email) return `${row.name} (${row.email})`;
  return row.name || row.email || row.userId || 'Unknown user';
}

export function UsersAndTopUpsPanel({ users }: { users: CreditUserBreakdown[] }) {
  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Personal top-ups are owned by the purchaser. Plan credits stay in the shared pool.
      </Typography>
      {users.length === 0 ? (
        <Alert severity="info">
          No personal top-ups yet. Plan-shared credits and usage without a recorded user appear
          here once available.
        </Alert>
      ) : (
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
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
                  <TableCell sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: 280 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{userLabel(row)}</Typography>
                    {row.userId && !row.sharedPool && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontFamily: 'monospace',
                          display: 'block',
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere',
                          maxWidth: '100%',
                        }}
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
        </TableContainer>
      )}
    </Box>
  );
}

export function UsageByProviderPanel({ byProvider }: { byProvider: CreditUsageByProvider[] }) {
  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Credits spent across AI providers (inferred from ledger metadata when available).
      </Typography>
      {byProvider.length === 0 ? (
        <Alert severity="info">No metered AI usage recorded yet.</Alert>
      ) : (
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 480 }}>
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
                  <TableCell sx={{ wordBreak: 'break-word' }}>{row.provider}</TableCell>
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
        </TableContainer>
      )}
    </Box>
  );
}

export function UsageByModelPanel({ byModel }: { byModel: CreditUsageByModel[] }) {
  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Credits spent by model the user selected for generation.
      </Typography>
      {byModel.length === 0 ? (
        <Alert severity="info">No model-level usage recorded yet.</Alert>
      ) : (
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 560 }}>
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
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    {row.model}
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{row.provider}</TableCell>
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
        </TableContainer>
      )}
    </Box>
  );
}

/** Tabbed analytics for Settings → Personal → Usage. */
export function CreditUsageAnalyticsTabs({
  users,
  byProvider,
  byModel,
  defaultTab = 'users',
}: {
  users: CreditUserBreakdown[];
  byProvider: CreditUsageByProvider[];
  byModel: CreditUsageByModel[];
  defaultTab?: CreditUsageAnalyticsTab;
}) {
  const [tab, setTab] = useState<CreditUsageAnalyticsTab>(defaultTab);

  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        onChange={(_, next: CreditUsageAnalyticsTab) => setTab(next)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ minHeight: 36, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Users & top-ups" value="users" sx={{ minHeight: 36 }} />
        <Tab label="Usage by provider" value="provider" sx={{ minHeight: 36 }} />
        <Tab label="Usage by model" value="model" sx={{ minHeight: 36 }} />
      </Tabs>
      {tab === 'users' ? (
        <UsersAndTopUpsPanel users={users} />
      ) : tab === 'provider' ? (
        <UsageByProviderPanel byProvider={byProvider} />
      ) : (
        <UsageByModelPanel byModel={byModel} />
      )}
    </Stack>
  );
}

/** @deprecated Prefer CreditUsageAnalyticsTabs — stacked layout kept for tests/compat. */
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
        <UsersAndTopUpsPanel users={users} />
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Usage by provider
        </Typography>
        <UsageByProviderPanel byProvider={byProvider} />
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Usage by model
        </Typography>
        <UsageByModelPanel byModel={byModel} />
      </Box>
    </Stack>
  );
}
