/**
 * Organization registry.
 *
 * GET  /api/admin/organizations        — list all organizations
 * POST /api/admin/organizations        — create one
 *
 * Always operates on the platform root DB. Billing state is control-plane;
 * it must never be written into a tenant's dedicated database.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  createOrganization,
  listOrganizations,
  backfillDefaultOrganization,
} from '@/domain/billing/organization-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  try {
    // Converge the default org on first read so a platform that has never run
    // the migrate route still returns something usable. Also reclaims tenants
    // pointing at an organization that no longer exists, which the old
    // NULL-only condition could never repair.
    const backfill = await backfillDefaultOrganization(db);
    if (backfill.tenantsAssigned > 0) {
      console.log(
        `[organizations] Backfill assigned ${backfill.tenantsAssigned} tenant(s) to the default organization`,
      );
    }
    const organizations = await listOrganizations(db);
    // `assigned` lets the console say what was repaired instead of silently
    // changing the mapping under the administrator.
    return jsonOk({ organizations, assigned: backfill.tenantsAssigned });
  } catch (err) {
    return jsonError('Failed to list organizations: ' + (err as Error).message, 500);
  }
}

/**
 * Where an organization came from, for org_attribution.
 *
 * Nothing used to pass this, so every row recorded the literal 'unknown' — and
 * the value cannot be reconstructed once the request is gone, so the table was
 * accumulating a constant. An explicit `channel` in the body wins; otherwise a
 * `utm_source` on the request carries campaign traffic through.
 *
 * The floor is 'admin_console', not 'unknown': this endpoint is behind
 * requireWriteAuth, so a request with no other signal *is* an operator creating
 * an organization by hand, and saying so is more truthful than a shrug. When a
 * public signup funnel exists it must pass the visitor's real channel here
 * rather than inheriting this default.
 */
function attributionChannel(request: Request, body: Record<string, unknown>): string {
  if (typeof body.channel === 'string' && body.channel.trim()) return body.channel.trim();

  const utm = new URL(request.url).searchParams.get('utm_source')?.trim();
  if (utm) return utm;

  return 'admin_console';
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  if (!displayName) return jsonError('displayName is required', 400);

  const db = createRawClient();
  try {
    const organization = await createOrganization(db, {
      displayName,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      ownerUserId: typeof body.ownerUserId === 'string' ? body.ownerUserId : null,
      referredBy: typeof body.referredBy === 'string' ? body.referredBy : null,
      channel: attributionChannel(request, body),
    });
    return jsonOk({ organization }, { status: 201 });
  } catch (err) {
    const message = (err as Error).message;
    if (/unique/i.test(message)) return jsonError('An organization with that slug already exists', 409);
    return jsonError('Failed to create organization: ' + message, 500);
  }
}
