'use client';

import { createContext, useContext } from 'react';

export interface CmsEditorContextValue {
  pageSlug: string;
  pageTitle: string;
  blockType: string;
  /** Full block config for AI context */
  config: Record<string, unknown>;
  tenantSlug?: string;
  appId?: string;
}

const CmsEditorContext = createContext<CmsEditorContextValue | null>(null);

export function CmsEditorProvider({
  value,
  children,
}: {
  value: CmsEditorContextValue;
  children: React.ReactNode;
}) {
  return <CmsEditorContext.Provider value={value}>{children}</CmsEditorContext.Provider>;
}

export function useCmsEditorContext(): CmsEditorContextValue | null {
  return useContext(CmsEditorContext);
}
