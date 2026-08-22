import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { getTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';
import { resolveOrgForTenant } from '@/domain/billing/organization-service';
import { resolveTenantSelfServeBilling } from '@/domain/billing/self-serve-billing-service';
import { requireWriteAuth, type GuardResult } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';

function forbidden(message: string): GuardResult {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error: message }, { status: 403 }),
  };
}

async function assertSelfServeOrgAccess(orgId: string): Promise<GuardResult | { ok: true }> {
  if (isPlatformApp()) {
    return forbidden('Self-serve billing is only available on deployed tenant apps.');
  }

  const db = createRawClient();
  const { enabled, tenantSlug } = await resolveTenantSelfServeBilling(orgId, db);
  if (!enabled) {
    return forbidden('Self-serve billing is not enabled for this tenant.');
  }

  const deploymentSlug = getTenantConfig().slug;
  if (tenantSlug !== deploymentSlug) {
    return forbidden('Not authorized for this organization.');
  }

  const org = await resolveOrgForTenant(deploymentSlug, db);
  if (!org || org.id !== orgId) {
    return forbidden('Not authorized for this organization.');
  }

  return { ok: true };
}

/**
 * Read org credit balance / ledger — platform admin on factory, or self-serve
 * tenant users on their deployment's billing org.
 */
export async function requireOrgCreditsRead(
  request: Request,
  orgId: string,
): Promise<GuardResult> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard;
  if (sessionIsPlatformAdmin(guard.session)) return guard;
  if (isPlatformApp()) return forbidden('Platform admin only');

  const access = await assertSelfServeOrgAccess(orgId);
  if (!access.ok) return access;
  return guard;
}

/**
 * Start a paid AI credit top-up — platform teammates on factory, or self-serve
 * users on a deployed tenant app when the tenant toggle is on.
 */
export async function requireOrgCreditPurchase(
  request: Request,
  orgId: string,
): Promise<GuardResult> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard;
  if (sessionIsPlatformAdmin(guard.session)) return guard;
  if (isPlatformApp()) return guard;

  const access = await assertSelfServeOrgAccess(orgId);
  if (!access.ok) return access;
  return guard;
}
