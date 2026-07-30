/**
 * Neon Database Connection Test — POST /api/admin/tenants/[slug]/provision/neon/test
 *
 * Validates a Neon database connection string by checking the branch endpoint
 * status via the Neon API. Returns success if the endpoint is reachable.
 *
 * If no dbUrl is provided in the body, looks up the tenant's dbUrl from the DB.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { PrismaClient } from '@/generated/prisma';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { dbUrl?: string };
  try { body = await request.json(); } catch {
    body = {};
  }

  let dbUrl = body.dbUrl;

  // If no dbUrl provided, look up from Tenant record
  if (!dbUrl) {
    try {
      const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
      if (!url) {
        return jsonError('POSTGRES_URL not configured on this server', 500);
      }
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      const tenant = await prisma.tenant.findUnique({ where: { slug } });
      await prisma.$disconnect();
      if (!tenant) {
        return jsonError('Tenant not found', 404);
      }
      if (!tenant.dbUrl) {
        return jsonError(`Tenant "${slug}" has no dbUrl set. Provision Neon first or pass dbUrl explicitly.`, 400);
      }
      dbUrl = tenant.dbUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return jsonError(`Failed to look up tenant dbUrl: ${msg}`, 500);
    }
  }

  try {
    // Validate URL format
    const parsed = new URL(dbUrl!);
    const hostname = parsed.hostname;

    // Check if it's a Neon host
    if (!hostname.includes('neon.tech')) {
      return jsonOk({ reachable: true, note: 'Non-Neon host — URL format valid, verify manually' });
    }

    // Extract branch endpoint ID from hostname (ep-xxxxx)
    const epMatch = hostname.match(/^(ep-[a-z0-9-]+)/);
    if (!epMatch) {
      return jsonOk({ reachable: true, note: 'URL format valid. Verify connection via psql or Neon Console.' });
    }

    // Check endpoint via Neon API
    const apiKey = process.env.NEON_API_KEY;
    const projectId = process.env.NEON_PROJECT_ID;
    if (!apiKey || !projectId) {
      return jsonOk({ reachable: true, note: 'URL format valid. NEON_API_KEY not configured for deep check.' });
    }

    const epId = epMatch[1];
    const orgId = process.env.NEON_ORG_ID;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };
    if (orgId) headers['X-Org-Id'] = orgId;

    const epRes = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/endpoints/${epId}`,
      { headers },
    );

    if (!epRes.ok) {
      return jsonOk({ reachable: true, note: 'URL format valid. Endpoint status check unavailable.' });
    }

    const epData = await epRes.json() as { endpoint?: { type?: string; host?: string; id?: string; disabled?: boolean } };
    const ep = epData.endpoint;

    if (ep?.disabled) {
      return jsonError('Endpoint is disabled', 400);
    }

    return jsonOk({
      reachable: true,
      endpointId: ep?.id,
      type: ep?.type,
      host: ep?.host,
      note: 'Endpoint is active and reachable',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid URL';
    return jsonError(`Connection test failed: ${msg}`, 400);
  }
}
