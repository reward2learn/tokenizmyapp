'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { CreditLedgerEntry } from '@/store/apis/organization-api';

/**
 * Usage history — every movement of the credit balance (roadmap §6, Phase 6).
 *
 * The ledger already recorded all of this; only the table was missing. Each row
 * carries the model, the token counts and the reason, so this answers "where
 * did my credits go" without anyone reading the database.
 *
 * Sign is the whole grammar of the table: positive is credit arriving (a plan
 * allowance, a purchase, a promo), negative is generation spending it. Zero is
 * neither, and is not a rounding artefact — it is an exempt run, recorded so
 * that work done under an exemption is still visible rather than invisible.
 */

const TIME_WINDOWS = [
  { id: 'all', label: 'All time', days: null },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
] as const;

type WindowId = (typeof TIME_WINDOWS)[number]['id'];
type Direction = 'all' | 'spend' | 'grant' | 'exempt';

function directionOf(delta: number): Exclude<Direction, 'all'> {
  if (delta < 0) return 'spend';
  if (delta > 0) return 'grant';
  return 'exempt';
}

/** `ai_generation_exempt` → "Ai generation exempt". */
function humanise(reason: string): string {
  const spaced = reason.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * `metadata` is `unknown` on the wire, and rightly so — it is whatever the
 * metering call chose to attach, and the shape has already changed once. Narrow
 * it here rather than asserting: a row whose metadata is missing or shaped
 * differently renders an em dash instead of throwing inside a table cell.
 */
function meta(entry: CreditLedgerEntry): Record<string, unknown> {
  return typeof entry.metadata === 'object' && entry.metadata !== null
    ? (entry.metadata as Record<string, unknown>)
    : {};
}

function count(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function tokensOf(entry: CreditLedgerEntry): string | null {
  const m = meta(entry);
  // Two naming conventions in the wild: the provider's prompt/completion and
  // our own input/output. Accept both rather than showing a dash for half the
  // rows.
  const input = count(m.inputTokens) || count(m.promptTokens);
  const output = count(m.outputTokens) || count(m.completionTokens);
  if (!input && !output) return null;
  return `${input.toLocaleString()} in / ${output.toLocaleString()} out`;
}

function modelOf(entry: CreditLedgerEntry): string | null {
  const model = meta(entry).model;
  return typeof model === 'string' && model.trim() !== '' ? model : null;
}

export function CreditUsageTable({ ledger }: { ledger: CreditLedgerEntry[] }) {
  const [direction, setDirection] = useState<Direction>('all');
  const [windowId, setWindowId] = useState<WindowId>('all');
  const [reason, setReason] = useState<string>('all');

  const reasons = useMemo(
    () => Array.from(new Set(ledger.map((e) => e.reason))).sort(),
    [ledger],
  );

  const rows = useMemo(() => {
    const days = TIME_WINDOWS.find((w) => w.id === windowId)?.days ?? null;
    const cutoff = days === null ? null : Date.now() - days * 86_400_000;
    return ledger.filter((e) => {
      if (direction !== 'all' && directionOf(e.delta) !== direction) return false;
      if (reason !== 'all' && e.reason !== reason) return false;
      if (cutoff !== null && new Date(e.createdAt).getTime() < cutoff) return false;
      return true;
    });
  }, [ledger, direction, windowId, reason]);

  const spent = rows.reduce((sum, e) => (e.delta < 0 ? sum - e.delta : sum), 0);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <TextField
          select
          size="small"
          label="Direction"
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All movements</MenuItem>
          <MenuItem value="spend">Spend</MenuItem>
          <MenuItem value="grant">Credits added</MenuItem>
          <MenuItem value="exempt">Exempt runs</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ minWidth: 190 }}
        >
          <MenuItem value="all">All reasons</MenuItem>
          {reasons.map((r) => (
            <MenuItem key={r} value={r}>
              {humanise(r)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Period"
          value={windowId}
          onChange={(e) => setWindowId(e.target.value as WindowId)}
          sx={{ minWidth: 150 }}
        >
          {TIME_WINDOWS.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {ledger.length === 0 ? (
        <Alert severity="info">
          No usage yet. Every generation that spends credits is recorded here with the model
          and tokens behind it.
        </Alert>
      ) : rows.length === 0 ? (
        <Alert severity="info">
          Nothing matches these filters. {ledger.length} entr
          {ledger.length === 1 ? 'y' : 'ies'} in total.
        </Alert>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary">
            {rows.length} of {ledger.length} shown · {spent} credit{spent === 1 ? '' : 's'} spent
            in this view
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Tokens</TableCell>
                <TableCell align="right">Credits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((entry) => {
                const dir = directionOf(entry.delta);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Tooltip title={new Date(entry.createdAt).toLocaleString()}>
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{humanise(entry.reason)}</TableCell>
                    <TableCell sx={{ fontSize: '0.78rem' }}>{modelOf(entry) ?? '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.78rem' }}>{tokensOf(entry) ?? '—'}</TableCell>
                    <TableCell align="right">
                      {dir === 'exempt' ? (
                        <Chip label="Exempt" size="small" variant="outlined" />
                      ) : (
                        <Typography
                          variant="body2"
                          color={dir === 'grant' ? 'success.main' : 'text.primary'}
                          sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </Stack>
  );
}
