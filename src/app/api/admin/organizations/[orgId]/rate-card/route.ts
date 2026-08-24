/**
 * GET/PUT /api/admin/organizations/[orgId]/rate-card
 *
 * Platform-admin secured tenant/org AI markup rate card. PUT accepts inputs
 * and optional manual markup lock; GET returns the persisted card (computing
 * a preview from query params when none exists yet).
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  getOrgRateCard,
  recalculateOrgRateCard,
  upsertOrgRateCard,
} from '@/domain/billing/org-rate-card-service';
import {
  computeTenantRateCard,
  defaultRateCardInputs,
  DEFAULT_MAC_STUDIO_ULTRA_256_USD,
} from '@/lib/billing/tenant-rate-card';

export const maxDuration = 30;

const putSchema = z.object({
  inputs: z
    .object({
      appCount: z.number().int().min(1).optional(),
      userCount: z.number().int().min(1).optional(),
      annualRevenueUsd: z.number().min(0).optional(),
      macStudioCostUsd: z.number().min(0).optional(),
      monthlyThirdPartyUsd: z.number().min(0).optional(),
    })
    .optional()
    .default({}),
  /** Set to lock markup; null clears the lock and recomputes. */
  manualMarkupPercent: z.number().min(0.3).max(0.95).nullable().optional(),
  /** Force a live recalc from apps/users/usage after applying inputs. */
  recalculate: z.boolean().optional().default(false),
});

type RouteContext = { params: Promise<{ orgId: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const { orgId } = await context.params;
  const card = await getOrgRateCard(orgId);
  if (card) return jsonOk(card);

  // Preview defaults when no card has been saved yet
  const preview = computeTenantRateCard(
    defaultRateCardInputs({
      macStudioCostUsd: DEFAULT_MAC_STUDIO_ULTRA_256_USD,
    }),
  );
  return jsonOk({
    ...preview,
    inputs: defaultRateCardInputs({ macStudioCostUsd: DEFAULT_MAC_STUDIO_ULTRA_256_USD }),
    manualMarkupPercent: null,
    computedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    persisted: false,
  });
}

export async function PUT(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const { orgId } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  try {
    let card = await upsertOrgRateCard(orgId, {
      inputs: parsed.data.inputs,
      manualMarkupPercent: parsed.data.manualMarkupPercent,
      preserveManual: parsed.data.manualMarkupPercent === undefined,
    });

    if (parsed.data.recalculate) {
      card = await recalculateOrgRateCard(orgId);
    }

    return jsonOk({ ...card, persisted: true });
  } catch (err) {
    return jsonError(
      `Failed to save rate card: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
