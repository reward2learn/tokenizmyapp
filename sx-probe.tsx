import type { SxProps, SystemStyleObject } from '@mui/system';
import type { DataGridProps } from '@mui/x-data-grid';
import type { Theme } from '@mui/material/styles';

type CssVal = Record<string, Record<string, unknown> | string | number> | string | number;

// Option B: unknown + cast
export const b = (() => {
  const sx: Record<string, unknown> = {
    border: '1px solid',
    '& .hover': { bgcolor: 'primary.100 !important', '&:hover': { bgcolor: 'x' } },
  };
  const k = '& .extra';
  sx[k] = { position: 'sticky', left: 5 };
  return sx as SxProps<Theme>;
})();

export const gridProps: Partial<DataGridProps> = {
  sx: b,
};

// Option C: SystemStyleObject local
export const c = (() => {
  const sx: SystemStyleObject<Theme> = {
    border: '1px solid',
    '& .hover': { bgcolor: 'primary.100 !important', '&:hover': { bgcolor: 'x' } },
  };
  const k = '& .extra';
  (sx as Record<string, unknown>)[k] = { position: 'sticky', left: 5 };
  return sx;
})();

export const gridPropsC: Partial<DataGridProps> = {
  sx: c,
};
