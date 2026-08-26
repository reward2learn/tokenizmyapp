/**
 * POST /api/admin/tenants/[slug]/ollama-tunnel-host
 *
 * Platform-admin only. Upserts OLLAMA_TUNNEL_HOST on the tenant root Vercel
 * project, every suite app project, and the factory control-plane project.
 *
 * Body: { confirm: true, tunnelHost: string }
 *
 * When the tenant row does not exist yet (create wizard), only the factory
 * project is updated so the tunnel can be confirmed before deploy.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { pushOllamaTunnelHostForTenant } from '@/domain/config/ollama-tunnel-host-service';
import { DEFAULT_OLLAMA_TUNNEL_HOST } from '@/lib/ollama-tunnel-host';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  confirm: z.literal(true),
  tunnelHost: z.string().min(1).max(500).optional(),
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
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}. Pass { confirm: true, tunnelHost?: string }.`,
      400,
    );
  }

  const db = createRawClient();
  try {
    const result = await pushOllamaTunnelHostForTenant(
      slug,
      {
        confirm: true,
        tunnelHost: parsed.data.tunnelHost ?? DEFAULT_OLLAMA_TUNNEL_HOST,
      },
      db,
    );

    const updatedOk = result.updated.filter((u) => u.ok).length;
    const updatedFail = result.updated.filter((u) => !u.ok).length;

    if (result.errors.length > 0 && updatedOk === 0) {
      const status = /not found|No Vercel project|No Vercel token|not created yet/i.test(
        result.errors[0] ?? '',
      )
        ? 400
        : 500;
      return jsonError(result.errors[0] ?? 'Failed to push OLLAMA_TUNNEL_HOST', status);
    }

    const factoryNote = result.factoryOnly
      ? ' Tenant not created yet — factory project only. Re-run after deploy to sync tenant apps.'
      : '';

    return jsonOk({
      ...result,
      message: `OLLAMA_TUNNEL_HOST set on ${updatedOk} project(s)${
        updatedFail > 0 ? ` (${updatedFail} failed)` : ''
      }${
        result.skippedNoProject.length > 0
          ? `; skipped ${result.skippedNoProject.length} app(s) without project id`
          : ''
      }. Value: ${result.tunnelHost}.${factoryNote}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /not found|confirm|must be a valid URL|required/i.test(message) ? 400 : 500;
    return jsonError(`Failed to push OLLAMA_TUNNEL_HOST: ${message}`, status);
  }
}
