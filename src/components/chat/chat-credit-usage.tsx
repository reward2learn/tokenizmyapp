'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
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

export interface ChatCreditUsageProps {
  /**
   * Chatbot root element. When set, the usage dialog is portaled inside this
   * container so the overlay stays centered on the chat (not the viewport).
   */
  containerEl?: HTMLElement | null;
  /**
   * Conversation message panel. Dialog paper height matches this element so
   * the modal aligns with the transcript area.
   */
  messagesPanelEl?: HTMLElement | null;
}

/**
 * Compact chip (always visible in Tools & Options summary) + modal dialog
 * showing credit/token consumption for the current chat conversation.
 */
export function ChatCreditUsage({
  containerEl = null,
  messagesPanelEl = null,
}: ChatCreditUsageProps) {
  const sessionUsage = useAppSelector((s) => s.chatStream.sessionUsage);
  const lastTurnUsage = useAppSelector((s) => s.chatStream.lastTurnUsage);
  const [open, setOpen] = useState(false);
  const [messagesPanelHeight, setMessagesPanelHeight] = useState<number | null>(null);

  const turnCount = sessionUsage.turns.length;
  const sessionCharged = sessionUsage.consumed;
  const lastExempt =
    lastTurnUsage != null && !lastTurnUsage.charged && sessionCharged === 0;
  const creditsChargedDisplay =
    sessionCharged > 0
      ? String(sessionCharged)
      : sessionUsage.turns.every((turn) => !turn.charged)
        ? 'Not billed'
        : '0';
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

  useEffect(() => {
    if (!open || !messagesPanelEl) {
      setMessagesPanelHeight(null);
      return;
    }
    const syncHeight = () => {
      setMessagesPanelHeight(messagesPanelEl.getBoundingClientRect().height);
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(messagesPanelEl);
    return () => observer.disconnect();
  }, [open, messagesPanelEl]);

  if (!hasActivity) return null;

  const chipLabel = lastExempt
    ? 'Not billed'
    : `${sessionCharged} credit${sessionCharged === 1 ? '' : 's'} this chat`;

  const title = lastExempt
    ? 'Not billed'
    : `~${sessionCharged} credits used this conversation`;

  const handleChipClick = (event: MouseEvent<HTMLElement>) => {
    // Keep AccordionSummary from toggling when the chip is in its header.
    event.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const scopedToChat = Boolean(containerEl);

  return (
    <>
      <Chip
        icon={<BoltIcon sx={{ fontSize: 14 }} />}
        label={chipLabel}
        size="small"
        variant="outlined"
        onClick={handleChipClick}
        onMouseDown={(event) => event.stopPropagation()}
        aria-label="Chat credit usage"
        sx={{
          fontVariantNumeric: 'tabular-nums',
          cursor: 'pointer',
          maxWidth: '100%',
          height: 28,
          '& .MuiChip-label': { px: 0.75 },
        }}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="chat-credit-usage-title"
        // Portal into the chat card when provided; otherwise document.body
        // (tests + non-embedded use).
        container={containerEl ?? undefined}
        transitionDuration={0}
        fullWidth
        maxWidth={false}
        sx={
          scopedToChat
            ? {
                position: 'absolute',
                '& .MuiDialog-container': {
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0,
                },
              }
            : undefined
        }
        slotProps={{
          root: scopedToChat
            ? {
                sx: {
                  position: 'absolute',
                  inset: 0,
                },
              }
            : undefined,
          backdrop: scopedToChat
            ? {
                sx: { position: 'absolute' },
              }
            : undefined,
          paper: {
            sx: {
              width: '100%',
              maxWidth: '100%',
              m: 0,
              height: messagesPanelHeight != null ? `${messagesPanelHeight}px` : 'min(520px, 70%)',
              maxHeight: '100%',
              borderRadius: scopedToChat ? 1 : undefined,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <DialogTitle id="chat-credit-usage-title" sx={{ pb: 1 }}>
          {title}
        </DialogTitle>
        <DialogContent dividers sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
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
          <MetricRow label="Credits charged" value={creditsChargedDisplay} />
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
                        : `${turn.consumed} cr`}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={handleClose} variant="contained" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
