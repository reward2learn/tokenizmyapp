/**
 * Push OLLAMA_TUNNEL_HOST onto tenant Vercel project(s) and the factory
 * control-plane project so `/api/ollama` and server-side ollama-studio chat
 * resolve the Mac Studio tunnel.
 */
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import {
  collectTenantVercelProjectIds,
} from '@/domain/billing/sec-user-agent-service';
import {
  DEFAULT_OLLAMA_TUNNEL_HOST,
  normalizeOllamaTunnelHost,
  OLLAMA_TUNNEL_HOST_ENV_KEY,
} from '@/lib/ollama-tunnel-host';

type RawDb = ReturnType<typeof createRawClient>;

export interface OllamaTunnelHostProjectResult {
  projectId: string;
  appId: string | null;
  ok: boolean;
  error?: string;
}

export interface PushOllamaTunnelHostResult {
  tenantSlug: string;
  tunnelHost: string;
  updated: OllamaTunnelHostProjectResult[];
  skippedNoProject: string[];
  errors: string[];
  /** True when tenant row was missing — only factory (if any) was updated. */
  factoryOnly: boolean;
}

async function resolveFactoryProjectId(): Promise<string | null> {
  try {
    const { FACTORY_VERCEL_PROJECT_ID } = await import(
      '@/domain/billing/stripe-webhook-test-service'
    );
    return (
      process.env.VERCEL_PROJECT_ID?.trim()
      || process.env.FACTORY_VERCEL_PROJECT_ID?.trim()
      || FACTORY_VERCEL_PROJECT_ID
      || null
    );
  } catch {
    return process.env.VERCEL_PROJECT_ID?.trim()
      || process.env.FACTORY_VERCEL_PROJECT_ID?.trim()
      || null;
  }
}

/**
 * Collect Vercel project ids for OLLAMA_TUNNEL_HOST: tenant root + suite apps
 * + factory control-plane (deduped).
 */
export async function collectOllamaTunnelHostProjectIds(
  tenantSlug: string,
  tenant: Record<string, unknown> | null,
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

  if (tenant) {
    const { projectRefs: tenantRefs, skippedNoProject: tenantSkipped } =
      await collectTenantVercelProjectIds(tenantSlug, tenant);
    for (const ref of tenantRefs) add(ref.projectId, ref.appId);
    skippedNoProject.push(...tenantSkipped);
  }

  const factoryId = await resolveFactoryProjectId();
  if (factoryId) add(factoryId, null);

  return { projectRefs, skippedNoProject };
}

/**
 * Upsert OLLAMA_TUNNEL_HOST on linked Vercel projects. When the tenant row
 * does not exist yet (create wizard), pushes to the factory project only.
 */
export async function pushOllamaTunnelHostForTenant(
  tenantSlug: string,
  opts: {
    tunnelHost: string;
    confirm: true;
  },
  db: RawDb = createRawClient(),
): Promise<PushOllamaTunnelHostResult> {
  if (opts.confirm !== true) {
    throw new Error('Pushing OLLAMA_TUNNEL_HOST requires confirm: true');
  }

  const slug = tenantSlug.trim();
  if (!slug) {
    throw new Error('tenantSlug is required');
  }

  const tunnelHost = normalizeOllamaTunnelHost(opts.tunnelHost || DEFAULT_OLLAMA_TUNNEL_HOST);

  const result: PushOllamaTunnelHostResult = {
    tenantSlug: slug,
    tunnelHost,
    updated: [],
    skippedNoProject: [],
    errors: [],
    factoryOnly: false,
  };

  await ensureTenantsTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, vercel_project_id, metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];

  const tenant = rows[0] ?? null;
  if (!tenant) {
    result.factoryOnly = true;
  }

  const { projectRefs, skippedNoProject } = await collectOllamaTunnelHostProjectIds(
    slug,
    tenant,
  );
  result.skippedNoProject = skippedNoProject;

  if (projectRefs.length === 0) {
    result.errors.push(
      tenant
        ? `No Vercel project id for tenant "${slug}" (root, suite apps, or factory). Link a project or set VERCEL_PROJECT_ID on the factory.`
        : `Tenant "${slug}" is not created yet and no factory Vercel project id is configured (VERCEL_PROJECT_ID).`,
    );
    return result;
  }

  try {
    const { listVercelBearerTokens } = await import('@/domain/tenant/vercel-sdk-client');
    const tokens = await listVercelBearerTokens();
    if (tokens.length === 0) {
      result.errors.push(
        'No Vercel token (set VERCEL_TOKEN or Connect to Vercel) — OLLAMA_TUNNEL_HOST not pushed.',
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
      const ok = await upsertProjectEnvVar(
        ref.projectId,
        OLLAMA_TUNNEL_HOST_ENV_KEY,
        tunnelHost,
      );
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

export interface PushOllamaTunnelHostAllResult {
  tunnelHost: string;
  tenantSlugs: string[];
  updated: OllamaTunnelHostProjectResult[];
  skippedNoProject: string[];
  errors: string[];
}

/**
 * Collect unique Vercel project ids across every tenant (root + suite apps) plus
 * the factory control-plane project.
 */
export async function collectAllOllamaTunnelHostProjectRefs(
  db: RawDb = createRawClient(),
): Promise<{
  projectRefs: Array<{ projectId: string; appId: string | null; tenantSlug: string | null }>;
  skippedNoProject: string[];
  tenantSlugs: string[];
}> {
  await ensureTenantsTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, vercel_project_id, metadata FROM tenants ORDER BY slug;`,
  )) as Record<string, unknown>[];

  const projectRefs: Array<{ projectId: string; appId: string | null; tenantSlug: string | null }> = [];
  const seen = new Set<string>();
  const skippedNoProject: string[] = [];
  const tenantSlugs: string[] = [];

  const add = (projectId: string, appId: string | null, tenantSlug: string | null) => {
    const id = projectId.trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    projectRefs.push({ projectId: id, appId, tenantSlug });
  };

  for (const row of rows) {
    const slug = String(row.slug ?? '').trim();
    if (!slug) continue;
    tenantSlugs.push(slug);
    const { projectRefs: tenantRefs, skippedNoProject: tenantSkipped } =
      await collectOllamaTunnelHostProjectIds(slug, row);
    for (const ref of tenantRefs) {
      add(ref.projectId, ref.appId, slug);
    }
    for (const appId of tenantSkipped) {
      skippedNoProject.push(`${slug}:${appId}`);
    }
  }

  if (rows.length === 0) {
    const factoryId = await resolveFactoryProjectId();
    if (factoryId) add(factoryId, null, null);
  }

  return { projectRefs, skippedNoProject, tenantSlugs };
}

/**
 * Upsert OLLAMA_TUNNEL_HOST on every linked tenant Vercel project (deduped) and
 * the factory control-plane project.
 */
export async function pushOllamaTunnelHostForAllTenants(
  opts: {
    tunnelHost?: string;
    confirm: true;
  },
  db: RawDb = createRawClient(),
): Promise<PushOllamaTunnelHostAllResult> {
  if (opts.confirm !== true) {
    throw new Error('Pushing OLLAMA_TUNNEL_HOST requires confirm: true');
  }

  const tunnelHost = normalizeOllamaTunnelHost(opts.tunnelHost || DEFAULT_OLLAMA_TUNNEL_HOST);

  const result: PushOllamaTunnelHostAllResult = {
    tunnelHost,
    tenantSlugs: [],
    updated: [],
    skippedNoProject: [],
    errors: [],
  };

  const { projectRefs, skippedNoProject, tenantSlugs } =
    await collectAllOllamaTunnelHostProjectRefs(db);
  result.tenantSlugs = tenantSlugs;
  result.skippedNoProject = skippedNoProject;

  if (projectRefs.length === 0) {
    result.errors.push(
      'No Vercel project ids found — link tenant projects or set VERCEL_PROJECT_ID on the factory.',
    );
    return result;
  }

  try {
    const { listVercelBearerTokens } = await import('@/domain/tenant/vercel-sdk-client');
    const tokens = await listVercelBearerTokens();
    if (tokens.length === 0) {
      result.errors.push(
        'No Vercel token (set VERCEL_TOKEN or Connect to Vercel) — OLLAMA_TUNNEL_HOST not pushed.',
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
      const ok = await upsertProjectEnvVar(
        ref.projectId,
        OLLAMA_TUNNEL_HOST_ENV_KEY,
        tunnelHost,
      );
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
