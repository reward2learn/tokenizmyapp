/**
 * Hot-deploy + Vercel inventory for platform admin.
 *
 * Hot deploy only targets projects registered in the tenants DB
 * (tenant.vercel_project_id + suite app vercelProjectId). Unregistered
 * Vercel team projects are listed for ops visibility but never redeployed here.
 */

import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { resolveBearerToken, VERCEL_API, TEAM_ID } from '@/domain/tenant/vercel-sdk-client';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export type RegisteredDeployTarget = {
  tenantSlug: string;
  appId: string | null;
  label: string;
  projectId: string;
  deployHookUrl?: string;
};

export type VercelTeamProject = {
  id: string;
  name: string;
  framework?: string | null;
};

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/** Collect every Vercel project id stored on tenants / suite apps. */
export async function listRegisteredDeployTargets(): Promise<RegisteredDeployTarget[]> {
  const db = createRawClient();
  await ensureTenantsTable(db);
  const rows = await db.$queryRawUnsafe(
    `SELECT slug, vercel_project_id, metadata FROM tenants ORDER BY slug ASC;`,
  ) as Array<{ slug: string; vercel_project_id: string | null; metadata: unknown }>;

  const targets: RegisteredDeployTarget[] = [];

  for (const row of rows) {
    const slug = row.slug;
    const tenantProjectId = row.vercel_project_id?.trim();
    if (tenantProjectId) {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      const cfg = (meta.config ?? {}) as Record<string, unknown>;
      const hooks = (cfg.hooks ?? {}) as Record<string, unknown>;
      targets.push({
        tenantSlug: slug,
        appId: null,
        label: slug,
        projectId: tenantProjectId,
        deployHookUrl: String(hooks.deployHookUrl ?? '') || undefined,
      });
    }

    const pack = getAppPack({ metadata: row.metadata });
    for (const app of pack?.apps ?? []) {
      const projectId = app.vercelProjectId?.trim();
      if (!projectId) continue;
      targets.push({
        tenantSlug: slug,
        appId: app.appId,
        label: `${slug}/${app.appId}`,
        projectId,
        deployHookUrl: app.deployHookUrl || undefined,
      });
    }
  }

  return targets;
}

/** List projects on the configured Vercel team (paginated). */
export async function listVercelTeamProjects(): Promise<VercelTeamProject[]> {
  const bearer = await resolveBearerToken();
  const projects: VercelTeamProject[] = [];
  let until: string | undefined;

  for (let page = 0; page < 20; page++) {
    const url = new URL(`${VERCEL_API}/v10/projects`);
    if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);
    url.searchParams.set('limit', '100');
    if (until) url.searchParams.set('until', until);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${bearer}` },
    });
    if (!res.ok) {
      throw new Error(`Vercel list projects failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json() as {
      projects?: Array<{ id: string; name: string; framework?: string | null }>;
      pagination?: { next?: number | null };
    };
    const batch = data.projects ?? [];
    for (const p of batch) {
      projects.push({ id: p.id, name: p.name, framework: p.framework });
    }
    if (!data.pagination?.next || batch.length === 0) break;
    until = String(data.pagination.next);
  }

  return projects;
}

export type HotDeployResult = {
  registered: number;
  triggered: string[];
  skippedNoHook: string[];
  failed: Array<{ label: string; error: string }>;
  unregisteredOnVercel: VercelTeamProject[];
};

/**
 * Trigger production redeploys for DB-registered projects only (deploy hooks).
 * Also returns Vercel team projects that are not in the DB (informational).
 */
export async function hotDeployRegisteredApps(): Promise<HotDeployResult> {
  const [targets, teamProjects] = await Promise.all([
    listRegisteredDeployTargets(),
    listVercelTeamProjects().catch((err) => {
      console.warn('[hot-deploy] Could not list Vercel team projects:', err);
      return [] as VercelTeamProject[];
    }),
  ]);

  const registeredIds = new Set(targets.map((t) => t.projectId));
  const unregisteredOnVercel = teamProjects.filter((p) => !registeredIds.has(p.id));

  const triggered: string[] = [];
  const skippedNoHook: string[] = [];
  const failed: Array<{ label: string; error: string }> = [];

  for (const target of targets) {
    if (!target.deployHookUrl) {
      skippedNoHook.push(target.label);
      continue;
    }
    try {
      const res = await fetch(target.deployHookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        failed.push({ label: target.label, error: `HTTP ${res.status}` });
        continue;
      }
      triggered.push(target.label);
    } catch (err) {
      failed.push({
        label: target.label,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    registered: targets.length,
    triggered,
    skippedNoHook,
    failed,
    unregisteredOnVercel,
  };
}
