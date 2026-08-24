/**
 * GET/POST /api/admin/ai-credits-calculator/threads
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  createCalculatorThread,
  listCalculatorThreads,
} from '@/domain/billing/ai-credits-calculator-chat-service';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  orgId: z.string().trim().min(1).optional().nullable(),
  tenantSlug: z.string().trim().min(1).max(64).optional().nullable(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const userId = String(guard.session.sub ?? guard.session.email ?? 'platform-admin');
  const threads = await listCalculatorThreads(userId);
  return jsonOk({ threads });
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  const userId = String(guard.session.sub ?? guard.session.email ?? 'platform-admin');
  const thread = await createCalculatorThread({
    createdBy: userId,
    title: parsed.data.title,
    orgId: parsed.data.orgId,
    tenantSlug: parsed.data.tenantSlug,
  });
  return jsonOk({ thread });
}
