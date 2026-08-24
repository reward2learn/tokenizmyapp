'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import Typography from '@mui/material/Typography';

export interface CmsEditorContextValue {
  pageSlug: string;
  pageTitle: string;
  blockType: string;
  /** Full block config for AI context */
  config: Record<string, unknown>;
  tenantSlug?: string;
  appId?: string;
  /** Credits consumed by Generate-with-AI clicks in this drawer session. */
  sessionCreditsUsed: number;
  addSessionCredits?: (n: number) => void;
}

const CmsEditorContext = createContext<CmsEditorContextValue | null>(null);

export function CmsEditorProvider({
  value,
  children,
}: {
  value: Omit<CmsEditorContextValue, 'sessionCreditsUsed' | 'addSessionCredits'>;
  children: ReactNode;
}) {
  const [sessionCreditsUsed, setSessionCreditsUsed] = useState(0);
  const addSessionCredits = useCallback((n: number) => {
    if (n > 0) setSessionCreditsUsed((prev) => prev + n);
  }, []);

  return (
    <CmsEditorContext.Provider
      value={{
        ...value,
        sessionCreditsUsed,
        addSessionCredits,
      }}
    >
      {sessionCreditsUsed > 0 ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1, fontVariantNumeric: 'tabular-nums' }}
        >
          {sessionCreditsUsed} credit{sessionCreditsUsed === 1 ? '' : 's'} used this session
        </Typography>
      ) : null}
      {children}
    </CmsEditorContext.Provider>
  );
}

export function useCmsEditorContext(): CmsEditorContextValue | null {
  return useContext(CmsEditorContext);
}
