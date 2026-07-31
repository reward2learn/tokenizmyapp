import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { getDefaultRoutePath } from '@/lib/navigation/default-route';
import { resolvePageWithDb } from '@/lib/pages/page-resolver';

// Resolve the configured default route per request — never prerender the
// landing behavior at build time (the DB state can change at runtime).
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const defaultPath = await getDefaultRoutePath();

  // The default landing route IS the Home '/' page: render it directly
  // (standard layout — hero snippet by default) instead of redirecting.
  if (defaultPath === '/') {
    const home = await resolvePageWithDb('home');
    if (home) {
      return (
        <AuthGate requiredTier={home.authTier} fallback={<SignInPanelGate requiredTier={home.authTier} />}>
          <Suspense fallback={null}>
            <DynamicPage page={home} />
          </Suspense>
        </AuthGate>
      );
    }
  }

  redirect(defaultPath);
}
