import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { reconcileNavigation } from '@/lib/navigation/db';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { getCurrentAppId, getTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient(url: string) {
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const bodySchema = z.object({
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

/**
 * POST /api/admin/navigation/reconcile
 *
 * Seeds default infra nav items, removes path duplicates, nests workbook sheets
 * under Excel, and applies the default Admin → (Ops Admin, Tracking, Config) hierarchy.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (isPlatformApp() && !sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const tenantSlug = isPlatformAdmin
    ? (parsed.data.tenantSlug ?? null)
    : getTenantConfig().slug;
  const appId = isPlatformAdmin
    ? (parsed.data.appId ?? null)
    : getCurrentAppId();

  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    const result = await reconcileNavigation(prisma, { tenantSlug, appId });
    return jsonOk(result);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
