'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { CircularProgressProps } from '@mui/material/CircularProgress';
import type { SxProps, Theme } from '@mui/material/styles';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';
import { useBranding } from '@/components/branding/branding-provider';

interface BrandedLoadingIndicatorProps {
  /** Pixel size — applies to both the built-in spinner and custom graphic. */
  size?: number;
  /** Passed to the fallback CircularProgress (ignored for custom loading graphics). */
  color?: CircularProgressProps['color'];
  sx?: SxProps<Theme>;
}

/**
 * Page/content loading indicator — uses the tenant or app brand loading graphic
 * when configured, otherwise the built-in circular spinner.
 */
export function BrandedLoadingIndicator({ size = 28, color, sx }: BrandedLoadingIndicatorProps) {
  const { data } = useGetBrandConfigQuery();
  const { loadingGraphicUrl: orgLoadingGraphicUrl } = useBranding();
  const loadingGraphicUrl = data?.data?.loadingGraphicUrl ?? orgLoadingGraphicUrl ?? null;

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

  return <CircularProgress size={size} color={color} sx={sx} />;
}
