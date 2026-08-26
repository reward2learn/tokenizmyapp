'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { CircularProgressProps } from '@mui/material/CircularProgress';
import type { SxProps, Theme } from '@mui/material/styles';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';
import { useBranding } from '@/components/branding/branding-provider';

/** Custom brand GIFs/images render larger than the fallback spinner at the same `size`. */
const LOADING_GRAPHIC_SIZE_MULTIPLIER = 1.5;

interface BrandedLoadingIndicatorProps {
  /** Pixel size — fallback spinner uses this exactly; custom loading graphics render 50% larger. */
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
    const graphicSize = Math.round(size * LOADING_GRAPHIC_SIZE_MULTIPLIER);
    return (
      <Box
        component="img"
        src={loadingGraphicUrl}
        alt=""
        role="progressbar"
        aria-label="Loading"
        sx={{
          width: graphicSize,
          height: graphicSize,
          objectFit: 'contain',
          display: 'block',
          ...sx,
        }}
      />
    );
  }

  return <CircularProgress size={size} color={color} sx={sx} />;
}
