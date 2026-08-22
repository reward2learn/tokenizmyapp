'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircularProgress from '@mui/material/CircularProgress';
import type { SheetSeedStatus } from '@/lib/sheet-seed-progress';

function statusIcon(status: SheetSeedStatus['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />;
    case 'active':
      return <CircularProgress size={14} />;
    case 'error':
      return <ErrorIcon color="error" sx={{ fontSize: 16 }} />;
    case 'skipped':
      return <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 16 }} />;
    case 'pending':
    default:
      return <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 16 }} />;
  }
}

export function SheetSeedProgressList({ sheets }: { sheets: SheetSeedStatus[] }) {
  if (!sheets.length) return null;

  const done = sheets.filter((s) => s.status === 'completed' || s.status === 'skipped').length;

  return (
    <Stack spacing={1} sx={{ mt: 1.5 }} data-testid="sheet-seed-progress">
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Sheets {done}/{sheets.length}
      </Typography>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
        {sheets.map((sheet) => (
          <Chip
            key={sheet.name}
            size="small"
            icon={statusIcon(sheet.status)}
            label={
              sheet.phase && sheet.status === 'active'
                ? `${sheet.name} · ${sheet.phase}`
                : sheet.name
            }
            color={
              sheet.status === 'completed'
                ? 'success'
                : sheet.status === 'error'
                  ? 'error'
                  : sheet.status === 'active'
                    ? 'primary'
                    : 'default'
            }
            variant="outlined"
          />
        ))}
      </Stack>
    </Stack>
  );
}
