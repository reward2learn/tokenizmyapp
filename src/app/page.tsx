import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { getDefaultRoutePath } from '@/lib/navigation/default-route';
import { getSession } from '@/lib/auth/session';
import { resolvePageWithDb } from '@/lib/pages/page-resolver';

// Resolve the configured default route per request — never prerender the
// landing behavior at build time (the DB state can change at runtime).
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // An anonymous visitor gets the public landing page, whatever the configured
  // default route says.
  //
  // The default route (`navigation_items.is_default`, falling back to
  // /dashboard) is a *signed-in* preference: it decides where returning users
  // land. Applying it to everyone meant `/` answered 307 to /dashboard, which
  // then showed a sign-in wall — so the marketing page could not be reached at
  // all, and the first thing a prospective customer saw was a login form for a
  // product they had not been told about. That is the signup wall roadmap §7.1
  // exists to remove.
  const session = await getSession();

  if (!session) {
    const home = await resolvePageWithDb('home');
    if (home) {
      return (
        <Suspense fallback={null}>
          <DynamicPage page={home} />
        </Suspense>
      );
    }
  }

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
