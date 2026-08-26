'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

type Props = {
  value: string | string[];
  /** Show only the first type (compact card footers). */
  firstOnly?: boolean;
};

/**
 * Renders schema.org types as wrapping chips. Arrays must not be passed as a
 * single Chip label — React concatenates array children without separators
 * (e.g. SoftwareApplicationWebApplication) and blows out mobile width.
 */
export function SchemaOrgTypeChips({ value, firstOnly = false }: Props) {
  const types = Array.isArray(value) ? value : [value];
  const shown = firstOnly ? types.slice(0, 1) : types;

  return (
    <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }}>
      {shown.map((t) => (
        <Chip
          key={t}
          label={t}
          size="small"
          variant="outlined"
          color="info"
          sx={{
            maxWidth: '100%',
            height: 'auto',
            '& .MuiChip-label': {
              display: 'block',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              py: 0.25,
            },
          }}
        />
      ))}
    </Stack>
  );
}
