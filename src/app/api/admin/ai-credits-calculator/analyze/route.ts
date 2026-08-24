/**
 * POST /api/admin/ai-credits-calculator/analyze
 * Platform-admin only — scrape + filings + AI + report.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { analyzeAiCreditsCalculator } from '@/domain/billing/ai-credits-calculator-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const bodySchema = z.object({
  websiteUrl: z.string().url().optional().nullable(),
  secCikOrTicker: z.string().trim().min(1).max(64).optional().nullable(),
  companiesHouseNumber: z.string().trim().min(1).max(32).optional().nullable(),
  orgId: z.string().trim().min(1).optional().nullable(),
  tenantSlug: z.string().trim().min(1).max(64).optional().nullable(),
  adminAnnualRevenueUsd: z.number().min(0).optional().nullable(),
  inputsOverride: z
    .object({
      appCount: z.number().int().min(1).optional(),
      userCount: z.number().int().min(1).optional(),
      annualRevenueUsd: z.number().min(0).optional(),
      macStudioCostUsd: z.number().min(0).optional(),
      monthlyThirdPartyUsd: z.number().min(0).optional(),
    })
    .optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  try {
    const result = await analyzeAiCreditsCalculator({
      ...parsed.data,
      meterTenantSlug: 'tokenizmyapp',
    });
    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Analyze failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
