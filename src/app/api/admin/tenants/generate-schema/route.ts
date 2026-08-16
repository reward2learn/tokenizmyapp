/**
 * POST /api/admin/tenants/generate-schema
 *
 * Generates a W3C-aligned ZenStack schema from a natural language prompt.
 *
 * Request body:
 *   {
 *     "prompt": "I run a restaurant in Bali with 20 tables...",
 *     "templateId": "restaurant"
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "schema": { ...SchemaGenerationResult },
 *       "zmodel": "// Auto-generated ZenStack schema...",
 *       "pageCatalog": "export const GENERATED_PAGES...",
 *       "modelCount": 4,
 *       "useCaseCount": 6,
 *       "pageCount": 5
 *     }
 *   }
 */

import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { generateSchemaFromPrompt, mockGenerateSchema } from '@/domain/ai/schema-generator';
import { compileToZModel, compileToPageCatalog } from '@/domain/ai/zmodel-compiler';
import { requireCreditsForTenant } from '@/domain/billing/credit-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: { prompt?: string; templateId?: string; mock?: boolean; tenantSlug?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  if (!body.templateId) {
    return jsonError('templateId is required', 400);
  }

  // Support mock mode for testing without AI API calls
  if (body.mock) {
    const mockSchema = mockGenerateSchema(body.templateId);
    const mockZmodel = compileToZModel(mockSchema);
    const mockPageCatalog = compileToPageCatalog(mockSchema);
    return jsonOk({
      schema: mockSchema,
      zmodel: mockZmodel,
      pageCatalog: mockPageCatalog,
      modelCount: mockSchema.models.length,
      useCaseCount: mockSchema.useCases.length,
      pageCount: mockSchema.pages.length,
      mock: true,
    });
  }

  if (!body.prompt) {
    return jsonError('prompt is required (or set mock=true for testing)', 400);
  }

  // ── Pre-flight credit gate (real AI only) ──
  // Schema generation runs on the platform key (env) — require credits up
  // front so an empty balance returns 402 instead of a failed provider call.
  const tenantSlug = body.tenantSlug ?? process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'tokenizmyapp';
  const gate = await requireCreditsForTenant(tenantSlug);
  if (!gate.ok) return gate.response;

  try {
    const schema = await generateSchemaFromPrompt(body.prompt, body.templateId, tenantSlug);
    const zmodel = compileToZModel(schema);
    const pageCatalog = compileToPageCatalog(schema);

    return jsonOk({
      schema,
      zmodel,
      pageCatalog,
      modelCount: schema.models.length,
      useCaseCount: schema.useCases.length,
      pageCount: schema.pages.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[generate-schema] Error:', msg);
    if (err instanceof Error && err.stack) {
      console.error('[generate-schema] Stack:', err.stack.split('\n').slice(0, 5).join('\n'));
    }
    return jsonError(`Schema generation failed: ${msg.slice(0, 200)}`, 500);
  }
}
