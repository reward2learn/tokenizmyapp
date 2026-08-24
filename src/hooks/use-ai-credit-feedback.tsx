'use client';

import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useAppDispatch } from '@/store/hooks';
import { organizationApi } from '@/store/apis/organization-api';
import type { AiUsageSummary } from '@/lib/billing/ai-usage-summary';

export const AI_CREDITS_EMPTY_MESSAGE =
  'No AI credits remaining — open Billing → AI Credits to add more';

/** Map RTK / fetch errors (including gate 402) to a user-facing string. */
export function aiGenerateErrorMessage(err: unknown, fallback = 'Generation failed'): string {
  if (err && typeof err === 'object') {
    const status =
      'status' in err ? (err as { status?: number | string }).status : undefined;
    const data = 'data' in err ? (err as { data?: { error?: string; message?: string } }).data : undefined;
    const apiError = data?.error ?? data?.message;
    if (status === 402 || (typeof apiError === 'string' && /credit/i.test(apiError))) {
      return AI_CREDITS_EMPTY_MESSAGE;
    }
    if (typeof apiError === 'string' && apiError.trim()) return apiError.trim();
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return fallback;
}

export function formatUsageMessage(usage: AiUsageSummary): string {
  if (!usage.charged) {
    return 'Not billed';
  }
  const used = usage.consumed || usage.credits;
  const creditWord = used === 1 ? 'credit' : 'credits';
  if (usage.balance != null && Number.isFinite(usage.balance)) {
    return `Used ${used} ${creditWord} · ${usage.balance} remaining`;
  }
  return `Used ${used} ${creditWord}`;
}

/**
 * Shared snackbar + Credits-tag invalidation after Generate-with-AI actions.
 */
export function useAiCreditFeedback() {
  const dispatch = useAppDispatch();
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  } | null>(null);

  const reportUsage = useCallback(
    (usage: AiUsageSummary | null | undefined) => {
      if (!usage) return;
      if (usage.charged) {
        dispatch(organizationApi.util.invalidateTags(['Credits']));
      }
      setSnackbar({
        message: formatUsageMessage(usage),
        severity: usage.charged ? 'success' : 'info',
      });
    },
    [dispatch],
  );

  const reportError = useCallback((err: unknown, fallback?: string) => {
    setSnackbar({
      message: aiGenerateErrorMessage(err, fallback),
      severity: 'error',
    });
  }, []);

  const feedbackSnackbar = (
    <Snackbar
      open={Boolean(snackbar)}
      autoHideDuration={4500}
      onClose={() => setSnackbar(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {snackbar ? (
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );

  return { reportUsage, reportError, feedbackSnackbar, aiGenerateErrorMessage };
}
