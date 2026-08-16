import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import '../../style.css';
import { AppProviders } from '@/components/providers/app-providers';
import { ThemeRegistry } from '@/theme/theme-registry';
import { AppShell } from '@/components/layout/app-shell';
import { getTenantConfig } from '@shared/lib/config/tenant';

const tenant = getTenantConfig();

// Exposed as CSS vars and consumed by the theme's typography tokens
// (see src/theme/design-tokens.ts) so the font is declared in exactly one place.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  title: tenant.appTitle,
  description: tenant.description,
  icons: {
    icon: '/api/favicon',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <AppProviders>
          <ThemeRegistry>
            <AppShell>{children}</AppShell>
          </ThemeRegistry>
        </AppProviders>
      </body>
    </html>
  );
}
