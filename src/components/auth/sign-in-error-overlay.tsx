'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignInPanel } from '@/components/auth/sign-in-panel';

function SignInErrorOverlayInner() {
  const searchParams = useSearchParams();
  const hasAuthError = searchParams.get('auth') === 'error';
  const showSignIn = searchParams.get('show') === 'signin';

  if (!hasAuthError && !showSignIn) return null;

  return <SignInPanel requiredTier="public" />;
}

export function SignInErrorOverlay() {
  return (
    <Suspense fallback={null}>
      <SignInErrorOverlayInner />
    </Suspense>
  );
}
