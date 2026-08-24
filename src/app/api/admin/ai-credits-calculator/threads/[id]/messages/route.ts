/**
 * POST /api/admin/ai-credits-calculator/threads/[id]/messages
 * Multi-turn calculator chat (tool-scoped).
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  getCalculatorThread,
  sendCalculatorChatMessage,
} from '@/domain/billing/ai-credits-calculator-chat-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  message: z.string().trim().min(1).max(8000),
  draftInputs: z
    .object({
      appCount: z.number().int().min(1).optional(),
      userCount: z.number().int().min(1).optional(),
      annualRevenueUsd: z.number().min(0).optional(),
      macStudioCostUsd: z.number().min(0).optional(),
      monthlyThirdPartyUsd: z.number().min(0).optional(),
    })
    .optional(),
  websiteUrl: z.string().url().optional().nullable(),
  secCikOrTicker: z.string().optional().nullable(),
  companiesHouseNumber: z.string().optional().nullable(),
});

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const { id } = await context.params;
  const existing = await getCalculatorThread(id);
  if (!existing) return jsonError('Thread not found', 404);

  const userId = String(guard.session.sub ?? guard.session.email ?? 'platform-admin');
  if (existing.thread.createdBy !== userId) {
    return jsonError('Thread not found', 404);
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
    const result = await sendCalculatorChatMessage({
      threadId: id,
      userId,
      message: parsed.data.message,
      draftInputs: parsed.data.draftInputs,
      websiteUrl: parsed.data.websiteUrl,
      secCikOrTicker: parsed.data.secCikOrTicker,
      companiesHouseNumber: parsed.data.companiesHouseNumber,
      meterTenantSlug: 'tokenizmyapp',
    });
    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Chat failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
