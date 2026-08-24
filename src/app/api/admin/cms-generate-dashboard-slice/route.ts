/**
 * POST /api/admin/cms-generate-dashboard-slice
 *
 * Regenerate one dashboard_data slice (actionPhases | levers | targetRows)
 * from a CMS block settings drawer — without a full Generate Content run.
 */

import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveActiveAiConfig } from '@/lib/ai-providers';
import {
  BLOCK_TO_DASHBOARD_SLICE,
  DASHBOARD_SLICES,
  generateAndSaveDashboardSlice,
} from '@/domain/ai-content/dashboard-slice-generator';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { normalizeCmsScope } from '@shared/lib/cms-scope';
import { CREDIT_FLOORS, requireCreditsForTenant } from '@/domain/billing/credit-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const bodySchema = z.object({
  pageSlug: z.string().min(1).max(120),
  pageTitle: z.string().min(1).max(200),
  blockType: z.string().min(1).max(80),
  slice: z.enum(DASHBOARD_SLICES).optional(),
  currentValue: z.unknown().optional(),
  additionalContext: z.string().max(8000).optional(),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Invalid request body', 400);
  }

  const slice = body.slice ?? BLOCK_TO_DASHBOARD_SLICE[body.blockType];
  if (!slice) {
    return jsonError(
      `Block type "${body.blockType}" has no dashboard content slice. Supported: ${Object.keys(BLOCK_TO_DASHBOARD_SLICE).join(', ')}.`,
      400,
    );
  }

  const db = createClient();
  const ai = await resolveActiveAiConfig(undefined, db);
  if (!ai) {
    return jsonError('No AI provider configured. Set up AI in Config → AI Provider.', 503);
  }

  const cmsScope = normalizeCmsScope({
    tenantSlug: body.tenantSlug ?? getTenantConfig().slug,
    appId: body.appId ?? (getCurrentAppId() || undefined),
  });

  if (ai.keySource === 'env') {
    const gate = await requireCreditsForTenant(
      cmsScope.deploymentSlug,
      undefined,
      auth.session.email,
      CREDIT_FLOORS.contentGeneration,
    );
    if (!gate.ok) {
      return gate.response;
    }
  }

  try {
    const result = await generateAndSaveDashboardSlice({
      slice,
      blockType: body.blockType,
      pageSlug: body.pageSlug,
      pageTitle: body.pageTitle,
      currentValue: body.currentValue,
      additionalContext: body.additionalContext,
      ai,
      tenantSlug: cmsScope.deploymentSlug,
      db,
    });
    return jsonOk({
      slice: result.slice,
      value: result.value,
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Dashboard slice generation failed', 500);
  }
}
