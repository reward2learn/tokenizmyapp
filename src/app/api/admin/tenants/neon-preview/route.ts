/**
 * POST /api/admin/tenants/neon-preview
 *
 * Provision a Neon branch for a slug that does not yet have a tenants row
 * (create-tenant wizard Database step). Returns connection strings only —
 * the createTenant handler persists them when the tenant is saved.
 */
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { provisionTenantDatabase } from '@/domain/tenant/neon-provision-service';
import { formatNeonConnectionStrings } from '@/domain/tenant/neon-output-formatter';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const bodySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export async function POST(request: Request): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Invalid request body', 400);
  }

  if (!process.env.NEON_API_KEY) {
    return jsonError(
      'NEON_API_KEY is not configured — enter connection strings manually, or set the key and retry.',
      503,
    );
  }

  try {
    const neonDb = await provisionTenantDatabase(body.slug);
    const formatted = formatNeonConnectionStrings(neonDb, body.slug);
    return jsonOk({
      slug: body.slug,
      branchId: neonDb.branchId,
      databaseName: neonDb.databaseName,
      pooledUrl: neonDb.pooledUrl,
      directUrl: neonDb.directUrl,
      envVars: formatted.envVars,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[neon-preview] Failed for ${body.slug}:`, message);
    return jsonError(`Neon database provisioning failed: ${message}`, 500);
  }
}
