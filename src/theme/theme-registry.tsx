'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import {
  DEFAULT_MODE,
  createAppTheme,
  type BrandColors,
  type ResolvedThemeMode,
  type ThemeMode,
} from './design-tokens';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';

const FALLBACK_COLORS: BrandColors = { primary: '#eb3d28', secondary: '#0af9fe' };

function useSystemTheme(): Exclude<ThemeMode, 'system'> {
  const [mode, setMode] = useState<Exclude<ThemeMode, 'system'>>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setMode(mq.matches ? 'dark' : 'light');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return mode;
}

export interface BrandConfigState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  brandColors: BrandColors;
}

const ThemeModeContext = createContext<Pick<BrandConfigState, 'themeMode' | 'setThemeMode'> | null>(null);

export function useThemeMode(): Pick<BrandConfigState, 'themeMode' | 'setThemeMode'> {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeRegistry');
  }
  return ctx;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [brandColors, setBrandColors] = useState<BrandColors>(FALLBACK_COLORS);
  const { data: brandData } = useGetBrandConfigQuery();
  const userOverrideRef = useRef(false);
  const systemPref = useSystemTheme();
  const resolvedMode: ResolvedThemeMode =
    themeMode === 'system' ? systemPref : themeMode;

  const setThemeMode = useCallback((mode: ThemeMode) => {
    userOverrideRef.current = true;
    setThemeModeState(mode);
  }, []);

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

  // Apply tenant default once; do not overwrite an in-session user toggle.
  useEffect(() => {
    if (userOverrideRef.current) return;
    const fromBrand = brandData?.data?.themeMode;
    if (isThemeMode(fromBrand)) {
      setThemeModeState(fromBrand);
    }
  }, [brandData]);

  // Sync the HTML class when themeMode changes
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark', 'system');
    html.classList.add(themeMode);
  }, [themeMode]);

  const theme = useMemo(() => createAppTheme(brandColors, resolvedMode), [brandColors, resolvedMode]);
  const themeModeValue = useMemo(() => ({ themeMode, setThemeMode }), [themeMode, setThemeMode]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <ThemeModeContext.Provider value={themeModeValue}>
          <CssBaseline />
          {children}
        </ThemeModeContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
