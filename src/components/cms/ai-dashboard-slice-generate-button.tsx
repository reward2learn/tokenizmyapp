'use client';

import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useGenerateDashboardSliceMutation } from '@/store/apis/admin-api';
import { useCmsEditorContext } from '@/components/cms/cms-editor-context';
import type { DashboardSliceKey } from '@/domain/ai-content/dashboard-slice-generator';

export interface AiGenerateDashboardSliceButtonProps {
  slice: DashboardSliceKey;
  currentValue?: unknown;
  disabled?: boolean;
  label?: string;
  onGenerated?: (value: unknown) => void;
  onError?: (message: string) => void;
  size?: 'small' | 'medium';
}

const SLICE_LABELS: Record<DashboardSliceKey, string> = {
  actionPhases: 'Regenerate action plan',
  levers: 'Regenerate levers',
  targetRows: 'Regenerate target rows',
};

/**
 * Regenerates dashboard_data content (not section config JSON) for blocks
 * whose live content is loaded from knowledge_snippets.dashboard_data.
 */
export function AiGenerateDashboardSliceButton({
  slice,
  currentValue,
  disabled,
  label,
  onGenerated,
  onError,
  size = 'small',
}: AiGenerateDashboardSliceButtonProps) {
  const ctx = useCmsEditorContext();
  const [generate, { isLoading }] = useGenerateDashboardSliceMutation();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    if (!ctx) {
      onError?.('Page context unavailable');
      return;
    }
    setLocalError(null);
    try {
      const result = await generate({
        pageSlug: ctx.pageSlug,
        pageTitle: ctx.pageTitle,
        blockType: ctx.blockType,
        slice,
        currentValue,
        tenantSlug: ctx.tenantSlug,
        appId: ctx.appId,
      }).unwrap();
      onGenerated?.(result.data?.value);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { error?: string } }).data?.error ?? 'Generation failed')
          : err instanceof Error
            ? err.message
            : 'Generation failed';
      setLocalError(message);
      onError?.(message);
    }
  }, [ctx, currentValue, generate, onError, onGenerated, slice]);

  const buttonLabel = label ?? SLICE_LABELS[slice];
  const tooltip = localError
    ? localError
    : `Generate ${slice} with AI from the uploaded workbook and save to dashboard_data`;

  return (
    <Tooltip title={tooltip}>
      <span>
        <Button
          size={size}
          variant="contained"
          color="primary"
          disabled={disabled || isLoading || !ctx}
          onClick={() => void handleClick()}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon fontSize="small" />}
          sx={{ whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }}
        >
          {isLoading ? 'Generating…' : buttonLabel}
        </Button>
      </span>
    </Tooltip>
  );
}
