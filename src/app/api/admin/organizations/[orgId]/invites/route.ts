/**
 * POST /api/admin/organizations/:orgId/invites
 *
 * Invite an **app user** by email: create PIN-tier viewer on a tenant of this
 * org and email the one-time PIN.
 *
 * Does NOT grant an organization billing seat — use POST .../members for that.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { inviteAppUserByEmail } from '@/domain/billing/org-teammate-invite';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  tenantSlug: z.string().trim().min(1, 'tenantSlug is required'),
  name: z.string().trim().max(200).optional().nullable(),
  appBaseUrl: z.string().url().optional().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  const db = createRawClient();
  try {
    const result = await inviteAppUserByEmail(db, {
      orgId,
      email: parsed.data.email,
      tenantSlug: parsed.data.tenantSlug,
      name: parsed.data.name,
      appBaseUrl: parsed.data.appBaseUrl,
    });

    if (!result.emailSent) {
      return jsonOk(
        {
          ...result,
          warning:
            'App user was provisioned, but the invite email could not be sent. Check RESEND_API_KEY.',
        },
        { status: 201 },
      );
    }

    return jsonOk(result, { status: 201 });
  } catch (err) {
    const message = (err as Error).message;
    if (/not found|not part of/i.test(message)) return jsonError(message, 404);
    return jsonError('Failed to invite app user: ' + message, 500);
  }
}
