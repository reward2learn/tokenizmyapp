/**
 * Propagate a tenant's billing organization id onto every associated suite app.
 *
 * Seed All Apps / deploy / Vercel env push call this so tenant Billing resolves
 * the Pro org (control-plane) instead of a local Free default org.
 */
import { createRawClient } from '@/lib/db';
import { billingIdentityEnvVars } from '@/lib/billing/organization-env';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import type { AppPackConfig } from '@/store/apis/tenant-api';

type RawDb = ReturnType<typeof createRawClient>;

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/** Read `tenants.organization_id` for a slug (factory / control-plane DB). */
export async function readTenantOrganizationId(
  tenantSlug: string,
  db: RawDb = createRawClient(),
): Promise<string | null> {
  await ensureTenantsTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT organization_id FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];
  const orgId = String(rows[0]?.organization_id ?? '').trim();
  return orgId || null;
}

/** Push ORGANIZATION_ID + PLATFORM_POSTGRES_URL onto one Vercel project. */
export async function pushBillingIdentityToProject(
  projectId: string,
  orgId: string,
): Promise<{ pushed: number; keys: string[] }> {
  const vars = billingIdentityEnvVars(orgId);
  const keys = Object.keys(vars);
  if (keys.length === 0) return { pushed: 0, keys: [] };

  const { upsertProjectEnvVar } = await import('@/domain/tenant/vercel-deploy-service');
  let pushed = 0;
  for (const [key, value] of Object.entries(vars)) {
    try {
      const ok = await upsertProjectEnvVar(projectId, key, value);
      if (ok) pushed += 1;
    } catch (err) {
      console.warn(
        `[billing-identity] Failed to set ${key} on ${projectId}:`,
        (err as Error).message,
      );
    }
  }
  return { pushed, keys };
}

export interface PropagateBillingIdentityResult {
  orgId: string | null;
  appsTouched: number;
  envVarsPushed: number;
  skippedNoProject: string[];
  errors: string[];
}

/**
 * For every suite app (and the tenant root project when present), stamp the
 * tenant's organization id into Vercel env so Billing / top-up hit the Pro org.
 */
export async function propagateBillingIdentityForTenant(
  tenantSlug: string,
  db: RawDb = createRawClient(),
): Promise<PropagateBillingIdentityResult> {
  const orgId = await readTenantOrganizationId(tenantSlug, db);
  const result: PropagateBillingIdentityResult = {
    orgId,
    appsTouched: 0,
    envVarsPushed: 0,
    skippedNoProject: [],
    errors: [],
  };
  if (!orgId) {
    result.errors.push(`Tenant "${tenantSlug}" has no organization_id assigned.`);
    return result;
  }

  const rows = (await db.$queryRawUnsafe(
    `SELECT vercel_project_id, metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) {
    result.errors.push(`Tenant "${tenantSlug}" not found.`);
    return result;
  }

  const projectIds = new Set<string>();
  const rootProjectId = String(rows[0].vercel_project_id ?? '').trim();
  if (rootProjectId) projectIds.add(rootProjectId);

  const pack = getAppPack(rows[0]);
  for (const app of pack?.apps ?? []) {
    const projectId = String(app.vercelProjectId ?? '').trim();
    if (!projectId) {
      result.skippedNoProject.push(app.appId);
      continue;
    }
    projectIds.add(projectId);
  }

  for (const projectId of projectIds) {
    try {
      const push = await pushBillingIdentityToProject(projectId, orgId);
      result.appsTouched += 1;
      result.envVarsPushed += push.pushed;
    } catch (err) {
      result.errors.push(`${projectId}: ${(err as Error).message}`);
    }
  }

  return result;
}
