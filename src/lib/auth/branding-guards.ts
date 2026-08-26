import { NextResponse } from 'next/server';
import { createBillingRawClient } from '@/lib/db';
import { getTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';
import { resolveOrgForTenant } from '@/domain/billing/organization-service';
import { requireWriteAuth, type GuardResult } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';

function forbidden(message: string): GuardResult {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error: message }, { status: 403 }),
  };
}

async function assertTenantOrgAccess(orgId: string): Promise<GuardResult | { ok: true }> {
  const deploymentSlug = getTenantConfig().slug;
  const db = createBillingRawClient();
  const org = await resolveOrgForTenant(deploymentSlug, db);
  if (!org || org.id !== orgId) {
    return forbidden('Not authorized for this organization.');
  }
  return { ok: true };
}

/**
 * Read or update organization branding — platform admin on factory, or any
 * signed-in user on a tenant app for that deployment's billing org.
 */
export async function requireOrgBrandingAccess(
  request: Request,
  orgId: string,
): Promise<GuardResult> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard;

  if (isPlatformApp()) {
    if (!sessionIsPlatformAdmin(guard.session)) {
      return forbidden('Platform admin only');
    }
    return guard;
  }

  const access = await assertTenantOrgAccess(orgId);
  if (!access.ok) return access;
  return guard;
}
