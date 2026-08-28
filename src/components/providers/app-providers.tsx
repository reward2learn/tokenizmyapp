import type { ReactNode } from 'react';
import { StoreProvider } from '@/components/providers/store-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { SocialWalletSIWEHandler } from '@/components/auth/social-wallet-siwe-handler';
import { BrandingProvider } from '@/components/branding/branding-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
        <SocialWalletSIWEHandler />
        <BrandingProvider>{children}</BrandingProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
