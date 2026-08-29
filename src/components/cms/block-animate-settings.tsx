'use client';

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  DEFAULT_BLOCK_ANIMATE,
  mergeAnimateIntoConfig,
  resolveBlockAnimate,
  type BlockAnimateConfig,
} from '@/lib/schemas/block-animate';

export interface BlockAnimateSettingsProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}

function numField(
  label: string,
  value: number,
  onChange: (n: number) => void,
  readOnly?: boolean,
  inputProps?: { min?: number; max?: number; step?: number },
) {
  return (
    <TextField
      label={label}
      size="small"
      type="number"
      fullWidth
      value={value}
      disabled={readOnly}
      slotProps={{ input: inputProps }}
      onChange={(e) => {
        const next = Number(e.target.value);
        if (!Number.isFinite(next)) return;
        onChange(next);
      }}
    />
  );
}

export function BlockAnimateSettings({ config, onChange, readOnly = false }: BlockAnimateSettingsProps) {
  const animate = resolveBlockAnimate(config.animate);

  const patchAnimate = (patch: Partial<BlockAnimateConfig>) => {
    onChange(mergeAnimateIntoConfig(config, { ...animate, ...patch }));
  };

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Animate</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={animate.enabled}
              onChange={(e) => patchAnimate({ enabled: e.target.checked })}
              disabled={readOnly}
            />
          }
          label="Animate on scroll into view"
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {numField(
            'Y from (px)',
            animate.translateYFrom,
            (translateYFrom) => patchAnimate({ translateYFrom }),
            readOnly,
          )}
          {numField(
            'Y to (px)',
            animate.translateYTo,
            (translateYTo) => patchAnimate({ translateYTo }),
            readOnly,
          )}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {numField(
            'Alpha from',
            animate.alphaFrom,
            (alphaFrom) => patchAnimate({ alphaFrom }),
            readOnly,
            { min: 0, max: 1, step: 0.05 },
          )}
          {numField(
            'Alpha to',
            animate.alphaTo,
            (alphaTo) => patchAnimate({ alphaTo }),
            readOnly,
            { min: 0, max: 1, step: 0.05 },
          )}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {numField(
            'Duration (ms)',
            animate.durationMs,
            (durationMs) => patchAnimate({ durationMs }),
            readOnly,
            { min: 0, max: 5000, step: 50 },
          )}
          {numField(
            'Initial delay (ms)',
            animate.delayMs,
            (delayMs) => patchAnimate({ delayMs }),
            readOnly,
            { min: 0, max: 5000, step: 50 },
          )}
        </Stack>
        {numField(
          'Stagger between containers (ms)',
          animate.staggerMs,
          (staggerMs) => patchAnimate({ staggerMs }),
          readOnly,
          { min: 0, max: 5000, step: 50 },
        )}
        <Typography variant="caption" color="text.secondary">
          Each container inside the block animates in sequence. Default: rise from{' '}
          {DEFAULT_BLOCK_ANIMATE.translateYFrom}px below, alpha {DEFAULT_BLOCK_ANIMATE.alphaFrom} →{' '}
          {DEFAULT_BLOCK_ANIMATE.alphaTo}, {DEFAULT_BLOCK_ANIMATE.staggerMs}ms between containers.
        </Typography>
      </Stack>
    </Box>
  );
}
