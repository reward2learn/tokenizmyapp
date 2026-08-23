'use client';

import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useGenerateCmsFieldMutation } from '@/store/apis/admin-api';
import { useCmsEditorContext } from '@/components/cms/cms-editor-context';
import type { CmsFieldValueType } from '@/lib/cms-block-field-catalog';

export interface AiGenerateFieldButtonProps {
  fieldKey: string;
  fieldType?: CmsFieldValueType;
  fieldPath?: string;
  currentValue?: unknown;
  disabled?: boolean;
  onGenerated: (value: unknown) => void;
  onError?: (message: string) => void;
  size?: 'small' | 'medium';
}

export function AiGenerateFieldButton({
  fieldKey,
  fieldType,
  fieldPath,
  currentValue,
  disabled,
  onGenerated,
  onError,
  size = 'small',
}: AiGenerateFieldButtonProps) {
  const ctx = useCmsEditorContext();
  const [generate, { isLoading }] = useGenerateCmsFieldMutation();
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
        fieldKey,
        fieldPath,
        fieldType,
        currentConfig: ctx.config,
        currentValue,
        tenantSlug: ctx.tenantSlug,
        appId: ctx.appId,
      }).unwrap();
      onGenerated(result.data?.value);
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
  }, [ctx, currentValue, fieldKey, fieldPath, fieldType, generate, onError, onGenerated]);

  const tooltip = localError
    ? localError
    : 'Generate with AI Assistant using page, audience, and block context';

  return (
    <Tooltip title={tooltip}>
      <span>
        <Button
          size={size}
          variant="outlined"
          color="primary"
          disabled={disabled || isLoading || !ctx}
          onClick={() => void handleClick()}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon fontSize="small" />}
          sx={{ whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }}
        >
          {isLoading ? 'Generating…' : 'AI'}
        </Button>
      </span>
    </Tooltip>
  );
}
