'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

export interface BrandColors {
  primary: string;
  secondary: string;
}

const FALLBACK_COLORS: BrandColors = { primary: '#eb3d28', secondary: '#0af9fe' };

/**
 * Build an MUI dark theme using the given brand colors.
 * Falls back to default palette when brand config is not yet loaded.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.5 ? '#0f0f14' : '#f0f0f5';
}

function buildTheme(brand: BrandColors) {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: brand.primary, contrastText: contrastText(brand.primary) },
      secondary: { main: brand.secondary, contrastText: contrastText(brand.secondary) },
      background: {
        default: '#0f0f14',
        paper: '#1a1a22',
      },
      text: {
        primary: '#f0f0f5',
        secondary: '#8888a0',
      },
      divider: 'rgba(255,255,255,0.06)',
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(15,15,20,0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1a1a22',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
          },
        },
      },
      // ── Mobile touch target overrides ─────────────────────────
      // Ensure all small variants meet minimum 48×48px tap target.
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: {
            width: 48,
            height: 48,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          sizeSmall: {
            minHeight: 48,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          sizeSmall: {
            width: 70,
            height: 48,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          // Reference spec (see DevTools target markup):
          //   .MuiSwitch-root (sizeMedium): padding 9px; width 70px
          //   .MuiSwitch-switchBase:         padding 14px (checked AND unchecked)
          //   .MuiSwitch-track:              border-radius 15px
          // Scoped to sizeMedium — size="small" switches keep their
          // compact geometry. Touch target is met via the 70px-wide root
          // + MuiFormControlLabel minHeight 48 below.
          root: ({ ownerState }) => ownerState.size === 'medium' ? {
            width: 70,
            padding: 9,
          } : {},
          switchBase: ({ ownerState }) => ownerState.size === 'medium' ? {
            padding: 14,
            '&.Mui-checked, &.MuiSwitch-checked': {
              padding: 14, // keep identical when checked so the thumb doesn't jump
            },
          } : {},
          track: ({ ownerState }) => ownerState.size === 'medium' ? {
            borderRadius: 15,
            padding: 15,
          } : {},
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            minHeight: 48,
          },
        },
      },
    },
  });
}

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandColors>(FALLBACK_COLORS);

  useEffect(() => {
    fetch('/api/brand-config')
      .then((r) => r.json())
      .then((d) => {
        // Handle both wrapped ({ success, data }) and unwrapped responses
        const config = d?.data ?? d;
        const primary = config.brandPrimaryColor && /^#[0-9a-fA-F]{6}$/.test(config.brandPrimaryColor)
          ? config.brandPrimaryColor
          : FALLBACK_COLORS.primary;
        const secondary = config.brandSecondaryColor && /^#[0-9a-fA-F]{6}$/.test(config.brandSecondaryColor)
          ? config.brandSecondaryColor
          : FALLBACK_COLORS.secondary;
        setBrand({ primary, secondary });
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  const theme = useMemo(() => buildTheme(brand), [brand]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
