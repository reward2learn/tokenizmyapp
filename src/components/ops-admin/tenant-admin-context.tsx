'use client';

/**
 * TenantAdminContext — Provides the currently selected tenant to admin components.
 *
 * This allows the tenant admin panel to override the default tenant context
 * (which comes from the URL/config) with a user-selected tenant.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { TenantEntry } from '@/store/apis/tenant-api';

interface TenantAdminContextValue {
  /** The currently selected tenant (from admin panel selector) */
  selectedTenant: TenantEntry | null;
  /** Whether we're in "admin mode" viewing a specific tenant */
  isAdminMode: boolean;
}

const TenantAdminContext = createContext<TenantAdminContextValue>({
  selectedTenant: null,
  isAdminMode: false,
});

export function TenantAdminProvider({
  children,
  selectedTenant,
}: {
  children: ReactNode;
  selectedTenant: TenantEntry | null;
}) {
  return (
    <TenantAdminContext.Provider value={{ selectedTenant, isAdminMode: !!selectedTenant }}>
      {children}
    </TenantAdminContext.Provider>
  );
}

export function useTenantAdmin() {
  return useContext(TenantAdminContext);
}

/**
 * Hook to get the effective tenant — either the selected admin tenant
 * or the default client tenant config.
 */
export function useEffectiveTenant(): { slug: string; displayName: string } {
  const { selectedTenant, isAdminMode } = useTenantAdmin();
  
  if (isAdminMode && selectedTenant) {
    return {
      slug: selectedTenant.slug,
      displayName: selectedTenant.displayName,
    };
  }
  
  // Fallback to client config (for non-admin contexts)
  // This will be imported dynamically to avoid circular deps
  return { slug: 'tokenizmyapp', displayName: 'TokenizMyApp' };
}
