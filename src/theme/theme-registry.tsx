'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import {
  DEFAULT_MODE,
  ThemeMode,
  useSystemTheme,
  createAppTheme,
  type BrandColors,
  type NeutralRamp,
  type ThemeMode,
} from './design-tokens';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';

const FALLBACK_COLORS: BrandColors = { primary: '#eb3d28', secondary: '#0af9fe' };

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
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
  return luminance(bgHex) > 0.5 ? '#09090B' : '#FAFAFA';
}

function alpha(hex: string, a: number): string {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${a})` : hex;
}

/**
 * Build the app theme from the tenant's brand colours and a surface mode.
 *
 * Structure comes from the design tokens; only the accent is tenant-specific.
 * Exported so tests and Storybook-style previews can build a theme without
 * mounting the provider (which fetches brand config over the network).
 */
export function createAppTheme(brand: BrandColors, mode: ThemeMode = DEFAULT_MODE) {
  const n = NEUTRALS[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.primary, contrastText: contrastText(brand.primary) },
      secondary: { main: brand.secondary, contrastText: contrastText(brand.secondary) },
      error: { main: n.danger },
      background: { default: n.background, paper: n.surface },
      text: { primary: n.text, secondary: n.textMuted },
      divider: n.border,
      action: {
        hover: alpha(brand.primary, 0.06),
        selected: alpha(brand.primary, 0.1),
      },
    },
    shape: { borderRadius: RADIUS.base },
    typography: {
      fontFamily: TYPE.fontFamily,
      fontSize: TYPE.body.size,
      h1: { fontSize: '3rem', lineHeight: 1.1, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h2: { fontSize: '2.25rem', lineHeight: 1.11, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h3: { fontSize: '1.875rem', lineHeight: 1.2, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h4: { fontSize: '1.5rem', lineHeight: 1.25, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h5: { fontSize: '1.25rem', lineHeight: 1.3, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h6: { fontSize: '1rem', lineHeight: 1.4, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      body1: { fontSize: '1rem', lineHeight: TYPE.body.lineHeight },
      body2: { fontSize: '0.875rem', lineHeight: 1.45 },
      button: { fontWeight: TYPE.control.weight, textTransform: 'none', letterSpacing: 0 },
      caption: { fontSize: '0.8125rem', lineHeight: 1.4 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: n.background, color: n.text },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: RADIUS.card,
          },
          elevation0: { boxShadow: 'none' },
          elevation1: { boxShadow: SHADOWS.card },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.card,
            border: `1px solid ${n.border}`,
            boxShadow: SHADOWS.card,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: RADIUS.card, boxShadow: SHADOWS.overlay },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: RADIUS.base, border: `1px solid ${n.border}`, boxShadow: SHADOWS.overlay },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(n.background, 0.85),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${n.border}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            color: n.text,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: n.rail,
            borderColor: n.border,
            backgroundImage: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.control,
            '&.Mui-selected': {
              backgroundColor: n.railAccent,
              '&:hover': { backgroundColor: n.railAccent },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: RADIUS.pill, fontWeight: TYPE.control.weight },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: RADIUS.control, fontSize: '0.8125rem' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: RADIUS.control },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: TYPE.control.weight, letterSpacing: 0 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: RADIUS.control },
          contained: { boxShadow: SHADOWS.control, '&:hover': { boxShadow: SHADOWS.raised } },
          sizeSmall: { minHeight: 48 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: {
            width: 48,
            height: 48,
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

export interface BrandConfigState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  brandColors: BrandColors;
}

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [brandColors, setBrandColors] = useState<BrandColors>(FALLBACK_COLORS);
  const { data: brandData, isLoading } = useGetBrandConfigQuery();

  // Initialize brand colors from brand config API
  useEffect(() => {
    if (brandData?.data) {
      const config = brandData.data;
      const primary = config.brandPrimaryColor && /^#[0-9a-fA-F]{6}$/.test(config.brandPrimaryColor)
        ? config.brandPrimaryColor
        : FALLBACK_COLORS.primary;
      const secondary = config.brandSecondaryColor && /^#[0-9a-fA-F]{6}$/.test(config.brandSecondaryColor)
        ? config.brandSecondaryColor
        : FALLBACK_COLORS.secondary;
      setBrandColors({ primary, secondary });
    }
  }, [brandData]);

  // Initialize themeMode from brand config, then override with system preference
  useEffect(() => {
    if (brandData?.data?.themeMode) {
      setThemeMode(brandData.data.themeMode as ThemeMode);
    } else {
      // Fall back to system preference
      const systemMode = useSystemTheme();
      setThemeMode(systemMode);
    }
  }, [brandData, useSystemTheme()]);

  // Sync the HTML class when themeMode changes
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark', 'system');
    html.classList.add(themeMode);
  }, [themeMode]);

  const theme = useMemo(() => createAppTheme(brandColors, themeMode), [brandColors, themeMode]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
