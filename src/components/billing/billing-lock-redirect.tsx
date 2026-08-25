'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPlatformApp } from '@shared/lib/config/tenant';
import { useBillingOrgId } from '@/components/billing/use-billing-org';
import { useGetBillingLockStatusQuery } from '@/store/apis/organization-api';

/**
 * When a tenant app is billing-locked, send the signed-in user to Settings →
 * Billing → Invoices. Platform factory is never redirected (ops still need the
 * admin console).
 */
export function BillingLockRedirect() {
  const onPlatform = isPlatformApp();
  const orgId = useBillingOrgId();
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useGetBillingLockStatusQuery(orgId ?? '', { skip: !orgId || onPlatform });

  useEffect(() => {
    if (onPlatform || !data?.data?.locked) return;
    if (pathname?.startsWith('/settings')) return;
    router.replace('/settings?section=billing&tab=invoices');
  }, [onPlatform, data?.data?.locked, pathname, router]);

  return null;
}
