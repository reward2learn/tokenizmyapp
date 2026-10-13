'use client';

import type { ReactNode } from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

/**
 * Root Emotion cache for Next.js App Router. Must wrap the app directly under
 * <body> so SSR and client share the same `mui-*` class prefix (see MUI
 * Next.js integration + CSS layers docs).
 */
export function MuiCacheProvider({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <GlobalStyles styles="@layer theme,base,mui,components,utilities;" />
      {children}
    </AppRouterCacheProvider>
  );
}
