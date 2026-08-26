'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import type { SheetSeedStatus } from '@/lib/sheet-seed-progress';
import { sheetPhaseLabel } from '@/lib/sheet-seed-progress';

function statusIcon(status: SheetSeedStatus['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />;
    case 'active':
      return <BrandedLoadingIndicator size={14} />;
    case 'error':
      return <ErrorIcon color="error" sx={{ fontSize: 16 }} />;
    case 'skipped':
      return <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 16 }} />;
    case 'pending':
    default:
      return <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 16 }} />;
  }
}

function statusColor(status: SheetSeedStatus['status']): string {
  switch (status) {
    case 'completed':
      return 'success.main';
    case 'active':
      return 'primary.main';
    case 'error':
      return 'error.main';
    case 'skipped':
    case 'pending':
    default:
      return 'text.secondary';
  }
}

export function SheetSeedProgressList({ sheets }: { sheets: SheetSeedStatus[] }) {
  if (!sheets.length) return null;

  const done = sheets.filter((s) => s.status === 'completed' || s.status === 'skipped').length;

  return (
    <Stack spacing={0.75} data-testid="sheet-seed-progress">
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Sheets {done}/{sheets.length}
      </Typography>
      <Stack spacing={0.5}>
        {sheets.map((sheet) => {
          const phase = sheetPhaseLabel(sheet.phase);
          const secondary = sheet.detail;

          return (
            <Stack
              key={sheet.name}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'flex-start',
                opacity: sheet.status === 'pending' ? 0.5 : 1,
              }}
            >
              <Stack sx={{ pt: 0.25, flexShrink: 0 }}>{statusIcon(sheet.status)}</Stack>
              <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: sheet.status === 'active' ? 700 : 500,
                    color: statusColor(sheet.status),
                    lineHeight: 1.35,
                  }}
                >
                  {sheet.name}
                  {phase && sheet.status !== 'pending' ? ` · ${phase}` : ''}
                </Typography>
                {secondary ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.3, display: 'block' }}
                  >
                    {secondary}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
