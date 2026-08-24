'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  defaultContentGridForBlock,
  mergeContentGridIntoConfig,
  mergeGridIntoConfig,
  resolveBlockGrid,
  resolveContentGrid,
  type ResolvedBlockGrid,
} from '@/lib/schemas/block-grid';

export interface BlockGridSettingsProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  blockType?: string;
  readOnly?: boolean;
}

function spanField(
  label: string,
  value: number,
  onChange: (n: number) => void,
  readOnly?: boolean,
) {
  return (
    <TextField
      label={label}
      size="small"
      type="number"
      fullWidth
      value={value}
      disabled={readOnly}
      slotProps={{ htmlInput: { min: 1, max: 12, step: 1 } }}
      onChange={(e) => {
        const next = Number(e.target.value);
        if (!Number.isFinite(next)) return;
        onChange(Math.min(12, Math.max(1, Math.round(next))));
      }}
    />
  );
}

function SpanRow({
  values,
  onPatch,
  readOnly,
}: {
  values: ResolvedBlockGrid;
  onPatch: (patch: Partial<ResolvedBlockGrid>) => void;
  readOnly?: boolean;
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      {spanField('xs', values.xs, (xs) => onPatch({ xs }), readOnly)}
      {spanField('md', values.md, (md) => onPatch({ md }), readOnly)}
      {spanField('lg', values.lg, (lg) => onPatch({ lg }), readOnly)}
    </Stack>
  );
}

export function BlockGridSettings({
  config,
  onChange,
  blockType,
  readOnly = false,
}: BlockGridSettingsProps) {
  const grid = resolveBlockGrid(config.grid);
  const contentFallback = blockType
    ? defaultContentGridForBlock(blockType)
    : undefined;
  const contentGrid = resolveContentGrid(config.contentGrid, contentFallback);

  const patchGrid = (patch: Partial<ResolvedBlockGrid>) => {
    onChange(mergeGridIntoConfig(config, { ...grid, ...patch }));
  };

  const patchContentGrid = (patch: Partial<ResolvedBlockGrid>) => {
    onChange(mergeContentGridIntoConfig(config, { ...contentGrid, ...patch }));
  };

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={2}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Block width (page grid)</Typography>
          <SpanRow values={grid} onPatch={patchGrid} readOnly={readOnly} />
          <Typography variant="caption" color="text.secondary">
            xs defaults to 12 (full width). Spans are out of 12.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Content columns (inner assets)</Typography>
          <SpanRow values={contentGrid} onPatch={patchContentGrid} readOnly={readOnly} />
          <Typography variant="caption" color="text.secondary">
            Item width out of 12. Equal CSS grids use floor(12 ÷ span) columns
            (e.g. lg:4 → 3 columns).
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
