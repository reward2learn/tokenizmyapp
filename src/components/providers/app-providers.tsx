import type { ReactNode } from 'react';
import { StoreProvider } from '@/components/providers/store-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { BrandingProvider } from '@/components/branding/branding-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
        <BrandingProvider>{children}</BrandingProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
