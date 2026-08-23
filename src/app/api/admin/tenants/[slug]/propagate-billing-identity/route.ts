/**
 * POST /api/admin/tenants/[slug]/propagate-billing-identity
 *
 * Stamps the tenant's organization_id (and PLATFORM_POSTGRES_URL) onto the
 * tenant root Vercel project and every suite app project. Called from
 * "Seed All Apps" so Settings → Billing / credit top-up resolve the Pro org.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { propagateBillingIdentityForTenant } from '@/domain/billing/propagate-billing-identity';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    const result = await propagateBillingIdentityForTenant(slug, db);
    if (!result.orgId) {
      return jsonError(
        result.errors[0] ?? `Tenant "${slug}" has no organization_id to propagate.`,
        400,
      );
    }
    return jsonOk({
      orgId: result.orgId,
      appsTouched: result.appsTouched,
      envVarsPushed: result.envVarsPushed,
      skippedNoProject: result.skippedNoProject,
      errors: result.errors,
    });
  } catch (err) {
    return jsonError(
      'Failed to propagate billing identity: ' + (err as Error).message,
      500,
    );
  }
}
