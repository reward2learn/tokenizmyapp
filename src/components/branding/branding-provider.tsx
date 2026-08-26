'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useGetOrganizationBrandingQuery } from '@/store/apis/auth-api';
import { useBillingOrgId } from '@/components/billing/use-billing-org';

export interface BrandingContextValue {
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  backgroundVideoUrl: string | null;
  loadingGraphicUrl: string | null;
  customCss: string | null;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextValue>({
  logoUrl: null,
  backgroundImageUrl: null,
  backgroundVideoUrl: null,
  loadingGraphicUrl: null,
  customCss: null,
  isLoading: false,
});

export function useBranding(): BrandingContextValue {
  return useContext(BrandingContext);
}

/**
 * Loads organization branding once per session and injects custom CSS.
 */
export function BrandingProvider({ children }: { children: ReactNode }) {
  const orgId = useBillingOrgId();
  const { data, isLoading, isFetching } = useGetOrganizationBrandingQuery(orgId ?? '', {
    skip: !orgId,
  });

  const branding = data?.data;

  const value = useMemo<BrandingContextValue>(
    () => ({
      logoUrl: branding?.logoUrl ?? null,
      backgroundImageUrl: branding?.backgroundImageUrl ?? null,
      backgroundVideoUrl: branding?.backgroundVideoUrl ?? null,
      loadingGraphicUrl: branding?.loadingGraphicUrl ?? null,
      customCss: branding?.customCss ?? null,
      isLoading: isLoading || isFetching,
    }),
    [branding, isLoading, isFetching],
  );

  useEffect(() => {
    const css = value.customCss?.trim();
    const styleId = 'org-branding-custom-css';
    let el = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!css) {
      el?.remove();
      return;
    }

    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [value.customCss]);

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}
