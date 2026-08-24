/**
 * POST /api/admin/tenants/[slug]/seed-ai-credits
 *
 * Platform-admin only. Recalculates the tenant org rate card from live counts,
 * refreshes plan/pack credits from catalog faces × markup, syncs the current
 * period plan grant, and propagates billing identity to all suite apps.
 *
 * Body: { confirm: true, appId?: string }
 * `appId` is optional UI scope — seeding always applies at org + all apps.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { seedTenantAiCredits } from '@/domain/billing/seed-tenant-ai-credits';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  confirm: z.literal(true),
  appId: z.string().min(1).optional().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}. Pass { confirm: true }.`,
      400,
    );
  }

  const db = createRawClient();
  try {
    const result = await seedTenantAiCredits(
      slug,
      { scopedAppId: parsed.data.appId ?? null },
      db,
    );
    return jsonOk({
      ...result,
      message: `AI credits seeded for org ${result.orgId} across ${result.apps.length} app(s). Plan grant: ${result.planAllowance.action}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /not found|no organization_id|is not in tenant/i.test(message) ? 400 : 500;
    return jsonError(`Failed to seed AI credits: ${message}`, status);
  }
}
