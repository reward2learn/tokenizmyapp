import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { AiFindingsBlock } from '@/components/blocks/ai-findings-block';
import { resolvePageWithDb } from '@/lib/pages/page-resolver';

export default async function DashboardPage() {
  const page = await resolvePageWithDb('dashboard');

  if (!page) {
    notFound();
  }

  return (
    <AuthGate requiredTier={page.authTier} fallback={<SignInPanelGate requiredTier={page.authTier} />}>
      <Suspense fallback={null}>
        <DynamicPage page={page} />
      </Suspense>
      <AiFindingsBlock />
    </AuthGate>
  );
}
