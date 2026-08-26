'use client';

import { useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const MAX_BYTES = 1024 * 1024;

export interface LoadingGraphicUploadProps {
  value: string | null;
  inheritedValue?: string | null;
  onChange: (value: string | null) => Promise<void> | void;
  onClear?: () => Promise<void> | void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  previewUrl?: string | null;
  /** When true, show inherited tenant graphic and offer reset-to-inherit. */
  showInheritance?: boolean;
  compact?: boolean;
}

export function LoadingGraphicUpload({
  value,
  inheritedValue = null,
  previewUrl: previewUrlOverride,
  onChange,
  onClear,
  disabled = false,
  label = 'Loading Graphic',
  helperText = 'Shown while pages and content load. Upload a GIF or image (max 1 MB).',
  showInheritance = false,
  compact = false,
}: LoadingGraphicUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = previewUrlOverride ?? value ?? (showInheritance ? inheritedValue : null);
  const hasOverride = Boolean(value);
  const inheritsTenant = showInheritance && !value && Boolean(inheritedValue);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_BYTES) {
        throw new Error('Loading graphic must be under 1 MB');
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      await onChange(dataUrl);
      e.target.value = '';
    },
    [onChange],
  );

  return (
    <Box>
      <Typography variant={compact ? 'caption' : 'subtitle2'} sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
        {label}
      </Typography>
      {helperText ? (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          {helperText}
        </Typography>
      ) : null}
      {inheritsTenant ? (
        <Typography variant="caption" color="info.main" sx={{ mb: 1, display: 'block' }}>
          Using tenant default — upload below to override for this app.
        </Typography>
      ) : null}

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: compact ? 48 : 72,
            height: compact ? 48 : 72,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default',
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Loading graphic preview"
              sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40, objectFit: 'contain' }}
            />
          ) : (
            <CircularProgress size={compact ? 24 : 32} />
          )}
        </Box>

        <Button
          variant="outlined"
          size="small"
          component="label"
          startIcon={<PhotoCameraIcon />}
          disabled={disabled}
        >
          {previewUrl && hasOverride ? 'Replace' : 'Upload'}
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => void handleFile(e).catch(() => undefined)}
            disabled={disabled}
          />
        </Button>

        {hasOverride && onClear ? (
          <Button size="small" color="error" variant="text" disabled={disabled} onClick={() => void onClear()}>
            {showInheritance ? 'Use tenant default' : 'Remove'}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
