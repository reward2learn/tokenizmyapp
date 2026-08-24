/**
 * Push SEC_USER_AGENT onto a tenant's linked Vercel project(s) for EDGAR filings.
 *
 * Formula: `{OrgOrTenantName} AI Credits Calculator admin@{tenantSlug}.com`
 *
 * The contact fragment is identification for SEC's fair-access policy — not a
 * guaranteed mailbox. Factory was seeded once via CLI with alex@tokenizin.com;
 * tenants use this service / calculator button with admin@{slug}.com.
 *
 * Targets production + preview + development (same as upsertProjectEnvVar).
 */
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { listTenantSuiteApps } from '@/domain/billing/seed-tenant-ai-credits';
import {
  buildSecUserAgent,
  sanitizeSecUserAgentName,
  DEFAULT_SEC_ORG_DISPLAY_NAME,
  SEC_USER_AGENT_ENV_KEY,
} from '@/lib/billing/sec-user-agent';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export {
  buildSecUserAgent,
  sanitizeSecUserAgentName,
  DEFAULT_SEC_ORG_DISPLAY_NAME,
  SEC_USER_AGENT_ENV_KEY,
} from '@/lib/billing/sec-user-agent';

type RawDb = ReturnType<typeof createRawClient>;

export interface SecUserAgentProjectResult {
  projectId: string;
  appId: string | null;
  ok: boolean;
  error?: string;
}

export interface PushSecUserAgentResult {
  tenantSlug: string;
  secUserAgent: string;
  organizationName: string;
  updated: SecUserAgentProjectResult[];
  skippedNoProject: string[];
  errors: string[];
}

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/**
 * Collect unique Vercel project ids for a tenant: root project + every suite
 * app with a linked project. For factory slug with no DB project id, falls
 * back to FACTORY_VERCEL_PROJECT_ID / VERCEL_PROJECT_ID.
 */
export async function collectTenantVercelProjectIds(
  tenantSlug: string,
  tenant: Record<string, unknown>,
): Promise<{
  projectRefs: Array<{ projectId: string; appId: string | null }>;
  skippedNoProject: string[];
}> {
  const projectRefs: Array<{ projectId: string; appId: string | null }> = [];
  const seen = new Set<string>();
  const skippedNoProject: string[] = [];

  const add = (projectId: string, appId: string | null) => {
    const id = projectId.trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    projectRefs.push({ projectId: id, appId });
  };

  const rootId = String(tenant.vercel_project_id ?? '').trim();
  if (rootId) add(rootId, null);

  const apps = listTenantSuiteApps(tenantSlug, tenant);
  const pack = getAppPack(tenant);
  const hasSuite = Boolean(pack?.apps && pack.apps.length > 0);

  for (const app of apps) {
    if (app.vercelProjectId) {
      add(app.vercelProjectId, app.appId);
    } else if (hasSuite) {
      skippedNoProject.push(app.appId);
    }
  }

  // Factory: ensure control-plane project is included when slug is tokenizmyapp
  // and no (or incomplete) registry project ids.
  if (tenantSlug === 'tokenizmyapp' && projectRefs.length === 0) {
    try {
      const { FACTORY_VERCEL_PROJECT_ID } = await import(
        '@/domain/billing/stripe-webhook-test-service'
      );
      const factoryId =
        process.env.VERCEL_PROJECT_ID?.trim()
        || process.env.FACTORY_VERCEL_PROJECT_ID?.trim()
        || FACTORY_VERCEL_PROJECT_ID;
      if (factoryId) add(factoryId, null);
    } catch {
      // leave empty — caller reports skip
    }
  }

  return { projectRefs, skippedNoProject };
}

/**
 * Upsert SEC_USER_AGENT on all linked Vercel projects for the tenant.
 * Requires confirm: true at the API layer.
 */
export async function pushSecUserAgentForTenant(
  tenantSlug: string,
  opts: {
    organizationName?: string | null;
    confirm: true;
  },
  db: RawDb = createRawClient(),
): Promise<PushSecUserAgentResult> {
  if (opts.confirm !== true) {
    throw new Error('Pushing SEC_USER_AGENT requires confirm: true');
  }

  const slug = tenantSlug.trim();
  if (!slug) {
    throw new Error('tenantSlug is required');
  }

  await ensureTenantsTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, display_name, vercel_project_id, metadata, organization_id
     FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];

  if (rows.length === 0) {
    throw new Error(`Tenant "${slug}" not found.`);
  }

  const tenant = rows[0];
  const tenantDisplayName = String(tenant.display_name ?? '').trim() || null;

  let organizationName = opts.organizationName?.trim() || null;
  if (!organizationName) {
    const orgId = String(tenant.organization_id ?? '').trim();
    if (orgId) {
      try {
        const orgRows = (await db.$queryRawUnsafe(
          `SELECT display_name, slug FROM organizations WHERE id = $1 LIMIT 1;`,
          orgId,
        )) as Record<string, unknown>[];
        const org = orgRows[0];
        if (org) {
          organizationName =
            String(org.display_name ?? org.slug ?? '').trim() || null;
        }
      } catch {
        // organizations table may vary — fall through to tenant / default
      }
    }
  }

  const secUserAgent = buildSecUserAgent({
    tenantSlug: slug,
    organizationName,
    tenantDisplayName,
  });

  const result: PushSecUserAgentResult = {
    tenantSlug: slug,
    secUserAgent,
    organizationName:
      sanitizeSecUserAgentName(organizationName ?? '')
      || sanitizeSecUserAgentName(tenantDisplayName ?? '')
      || (slug === 'tokenizmyapp' ? DEFAULT_SEC_ORG_DISPLAY_NAME : slug),
    updated: [],
    skippedNoProject: [],
    errors: [],
  };

  const { projectRefs, skippedNoProject } = await collectTenantVercelProjectIds(slug, tenant);
  result.skippedNoProject = skippedNoProject;

  if (projectRefs.length === 0) {
    result.errors.push(
      `No Vercel project id for tenant "${slug}" (root or suite apps). Link a project or set FACTORY_VERCEL_PROJECT_ID for the factory.`,
    );
    return result;
  }

  try {
    const { listVercelBearerTokens } = await import('@/domain/tenant/vercel-sdk-client');
    const tokens = await listVercelBearerTokens();
    if (tokens.length === 0) {
      result.errors.push(
        'No Vercel token (set VERCEL_TOKEN or Connect to Vercel) — SEC_USER_AGENT not pushed.',
      );
      return result;
    }
  } catch (err) {
    result.errors.push(
      `Vercel token check failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return result;
  }

  const { upsertProjectEnvVar } = await import('@/domain/tenant/vercel-deploy-service');

  for (const ref of projectRefs) {
    try {
      const ok = await upsertProjectEnvVar(ref.projectId, SEC_USER_AGENT_ENV_KEY, secUserAgent);
      result.updated.push({
        projectId: ref.projectId,
        appId: ref.appId,
        ok,
        error: ok ? undefined : 'upsertProjectEnvVar returned false',
      });
      if (!ok) {
        result.errors.push(`${ref.projectId}: upsert failed`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.updated.push({
        projectId: ref.projectId,
        appId: ref.appId,
        ok: false,
        error: message,
      });
      result.errors.push(`${ref.projectId}: ${message}`);
    }
  }

  return result;
}
