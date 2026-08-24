/**
 * POST /api/admin/tenants/[slug]/sec-user-agent
 *
 * Platform-admin only. Upserts SEC_USER_AGENT on the tenant root Vercel project
 * and every suite app project (production + preview + development).
 *
 * Body: { confirm: true, organizationName?: string }
 *
 * Value formula: `{OrgOrTenantName} AI Credits Calculator admin@{slug}.com`
 * (identification for SEC EDGAR — not a guaranteed mailbox).
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { pushSecUserAgentForTenant } from '@/domain/billing/sec-user-agent-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  confirm: z.literal(true),
  organizationName: z.string().min(1).max(200).optional().nullable(),
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
    const result = await pushSecUserAgentForTenant(
      slug,
      {
        confirm: true,
        organizationName: parsed.data.organizationName ?? null,
      },
      db,
    );

    const updatedOk = result.updated.filter((u) => u.ok).length;
    const updatedFail = result.updated.filter((u) => !u.ok).length;

    if (result.errors.length > 0 && updatedOk === 0) {
      const status = /not found|No Vercel project|No Vercel token/i.test(
        result.errors[0] ?? '',
      )
        ? 400
        : 500;
      return jsonError(result.errors[0] ?? 'Failed to push SEC_USER_AGENT', status);
    }

    return jsonOk({
      ...result,
      message: `SEC_USER_AGENT set on ${updatedOk} project(s)${
        updatedFail > 0 ? ` (${updatedFail} failed)` : ''
      }${
        result.skippedNoProject.length > 0
          ? `; skipped ${result.skippedNoProject.length} app(s) without project id`
          : ''
      }. Value: ${result.secUserAgent}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /not found|confirm/i.test(message) ? 400 : 500;
    return jsonError(`Failed to push SEC_USER_AGENT: ${message}`, status);
  }
}
