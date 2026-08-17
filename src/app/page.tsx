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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // An anonymous visitor gets the public landing page, whatever the configured
  // default route says.
  //
  // The default route (`navigation_items.is_default`) is a *signed-in*
  // preference: it decides where returning users land. Applying it to everyone,
  // with a hardcoded /dashboard fallback, meant `/` answered 307 into the app
  // and then showed a sign-in wall — the marketing page could not be reached at
  // all, and the first thing a prospective customer saw was a login form for a
  // product they had not been told about. The fallback is now '/' and this
  // branch keeps visitors on it regardless. Roadmap §7.1.
  const session = await getSession();

  if (!session) {
    const home = await resolvePageWithDb('home');
    if (home) {
      // The proxy bounces unauthenticated requests for gated routes here and
      // preserves where they were headed. Without surfacing that, the visitor
      // silently loses their destination and lands on marketing copy with no
      // hint of why — so show the sign-in above the page, which reads the same
      // `redirect` parameter and returns them once they are in.
      const bouncedFrom = (await searchParams).redirect_reason === 'auth_required';

      return (
        <Suspense fallback={null}>
          {bouncedFrom ? <SignInPanelGate requiredTier="google" /> : null}
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
