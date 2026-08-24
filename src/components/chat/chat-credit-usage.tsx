'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BoltIcon from '@mui/icons-material/Bolt';
import { useAppSelector } from '@/store/hooks';

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ py: 0.35, justifyContent: 'space-between' }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * Compact chip + Cursor-style popover showing credit/token consumption for
 * the current chat conversation.
 */
export function ChatCreditUsage() {
  const sessionUsage = useAppSelector((s) => s.chatStream.sessionUsage);
  const lastTurnUsage = useAppSelector((s) => s.chatStream.lastTurnUsage);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const turnCount = sessionUsage.turns.length;
  const lastExempt =
    lastTurnUsage != null && !lastTurnUsage.charged && sessionUsage.consumed === 0;
  const hasActivity =
    turnCount > 0
    || sessionUsage.credits > 0
    || sessionUsage.promptTokens > 0
    || sessionUsage.completionTokens > 0;

  const tokenBar = useMemo(() => {
    const source = lastTurnUsage ?? {
      promptTokens: sessionUsage.promptTokens,
      completionTokens: sessionUsage.completionTokens,
    };
    const total = source.promptTokens + source.completionTokens;
    if (total <= 0) return { promptPct: 50, completionPct: 50, total: 0 };
    return {
      promptPct: Math.round((source.promptTokens / total) * 100),
      completionPct: Math.round((source.completionTokens / total) * 100),
      total,
    };
  }, [lastTurnUsage, sessionUsage.completionTokens, sessionUsage.promptTokens]);

  if (!hasActivity) return null;

  const chipLabel = lastExempt
    ? 'Not billed'
    : `${sessionUsage.consumed || sessionUsage.credits} credit${(sessionUsage.consumed || sessionUsage.credits) === 1 ? '' : 's'} this chat`;

  const open = Boolean(anchorEl);

  return (
    <>
      <Chip
        icon={<BoltIcon sx={{ fontSize: 14 }} />}
        label={chipLabel}
        size="small"
        variant="outlined"
        onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        aria-label="Chat credit usage"
        sx={{
          fontVariantNumeric: 'tabular-nums',
          cursor: 'pointer',
          maxWidth: '100%',
          height: 28,
          '& .MuiChip-label': { px: 0.75 },
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 280, p: 1.5 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {lastExempt
            ? 'Not billed'
            : `~${sessionUsage.consumed || sessionUsage.credits} credits used this conversation`}
        </Typography>
        {lastTurnUsage?.balance != null && Number.isFinite(lastTurnUsage.balance) ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {lastTurnUsage.balance} remaining
          </Typography>
        ) : null}

        {tokenBar.total > 0 ? (
          <Box sx={{ mb: 1.25 }}>
            <Box
              sx={{
                display: 'flex',
                height: 6,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
              }}
            >
              <Box sx={{ width: `${tokenBar.promptPct}%`, bgcolor: 'primary.main' }} />
              <Box sx={{ width: `${tokenBar.completionPct}%`, bgcolor: 'secondary.main' }} />
            </Box>
            <Stack direction="row" sx={{ mt: 0.5, justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Prompt {tokenBar.promptPct}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completion {tokenBar.completionPct}%
              </Typography>
            </Stack>
          </Box>
        ) : null}

        <MetricRow label="Prompt tokens" value={formatTokens(sessionUsage.promptTokens)} />
        <MetricRow label="Completion tokens" value={formatTokens(sessionUsage.completionTokens)} />
        <MetricRow
          label="Credits charged"
          value={String(sessionUsage.consumed || sessionUsage.credits)}
        />
        <MetricRow label="Turns" value={String(turnCount)} />
        {lastTurnUsage?.balance != null && Number.isFinite(lastTurnUsage.balance) ? (
          <MetricRow label="Remaining balance" value={String(lastTurnUsage.balance)} />
        ) : null}

        {sessionUsage.turns.length > 1 ? (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Recent turns
            </Typography>
            <Stack spacing={0.25}>
              {[...sessionUsage.turns].reverse().slice(0, 5).map((turn, idx) => (
                <Stack
                  key={`${turn.promptTokens}-${turn.completionTokens}-${idx}`}
                  direction="row"
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTokens(turn.promptTokens + turn.completionTokens)} tok
                  </Typography>
                  <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {!turn.charged
                      ? 'Not billed'
                      : `${turn.consumed || turn.credits} cr`}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        ) : null}
      </Popover>
    </>
  );
}
