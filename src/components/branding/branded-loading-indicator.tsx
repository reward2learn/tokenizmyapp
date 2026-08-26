'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { SxProps, Theme } from '@mui/material/styles';
import { useBranding } from '@/components/branding/branding-provider';

interface BrandedLoadingIndicatorProps {
  /** Pixel size — applies to both the built-in spinner and custom graphic. */
  size?: number;
  sx?: SxProps<Theme>;
}

/**
 * Page/content loading indicator — uses the org's custom loading graphic when
 * set in Settings → Branding, otherwise the built-in circular spinner.
 */
export function BrandedLoadingIndicator({ size = 28, sx }: BrandedLoadingIndicatorProps) {
  const { loadingGraphicUrl } = useBranding();

  if (loadingGraphicUrl) {
    return (
      <Box
        component="img"
        src={loadingGraphicUrl}
        alt=""
        role="progressbar"
        aria-label="Loading"
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          ...sx,
        }}
      />
    );
  }

  return <CircularProgress size={size} sx={sx} />;
}
