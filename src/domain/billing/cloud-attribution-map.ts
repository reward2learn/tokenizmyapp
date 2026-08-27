/**
 * Org ↔ Vercel project / Neon branch registry for Cloud Credits attribution.
 *
 * Control-plane only — used by the collector to allocate team-level Vercel
 * Usage and shared Neon project totals onto paying organizations.
 *
 * Sources:
 *  - `tenants.vercel_project_id` (single-app tenants)
 *  - `metadata.config.appPack.apps[].vercelProjectId` (suite apps — each counts)
 *  - Neon branch key `tenant-{slug}` (derived; provision later may persist ids)
 */
import type { createRawClient } from '@/lib/db';
import type { AppPackConfig } from '@/store/apis/tenant-api';

type RawDb = ReturnType<typeof createRawClient>;

/** One Vercel project owned by an org, with the tenant/app it belongs to. */
export interface AttributedProject {
  projectId: string;
  tenantSlug: string;
  /** Suite app id, or null for the tenant's root project. */
  appId: string | null;
}

export interface OrgAttribution {
  orgId: string;
  projectIds: string[];
  tenantSlugs: string[];
  /** Neon branch names: `tenant-{slug}` for each known tenant. */
  branchNames: string[];
  projects: AttributedProject[];
}

export type AttributionMap = Map<string, OrgAttribution>;

function getAppPack(metadata: unknown): AppPackConfig | null {
  const meta = (metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/** Canonical Neon branch name for a tenant slug. */
export function neonBranchNameForSlug(slug: string): string {
  return `tenant-${slug}`;
}

/**
 * Load every tenant with an organization and at least one attributable Vercel
 * project or (always) a Neon branch name derived from the slug.
 *
 * Orgs with only a Neon branch and no Vercel project still appear so Neon
 * Free-path allocation can map `tenant-*` branches.
 */
export async function loadCloudAttributionMap(db: RawDb): Promise<AttributionMap> {
  let rows: Array<{
    organization_id: string | null;
    slug: string;
    vercel_project_id: string | null;
    metadata: unknown;
  }> = [];
  try {
    rows = (await db.$queryRawUnsafe(
      `SELECT organization_id, slug, vercel_project_id, metadata
         FROM tenants
        WHERE organization_id IS NOT NULL
        ORDER BY slug ASC;`,
    )) as typeof rows;
  } catch {
    return new Map();
  }

  const map: AttributionMap = new Map();

  for (const row of rows) {
    const orgId = String(row.organization_id ?? '').trim();
    const slug = String(row.slug ?? '').trim();
    if (!orgId || !slug) continue;

    let entry = map.get(orgId);
    if (!entry) {
      entry = {
        orgId,
        projectIds: [],
        tenantSlugs: [],
        branchNames: [],
        projects: [],
      };
      map.set(orgId, entry);
    }

    if (!entry.tenantSlugs.includes(slug)) {
      entry.tenantSlugs.push(slug);
    }
    const branch = neonBranchNameForSlug(slug);
    if (!entry.branchNames.includes(branch)) {
      entry.branchNames.push(branch);
    }

    const seenProjects = new Set(entry.projectIds);
    const rootProjectId = String(row.vercel_project_id ?? '').trim();
    if (rootProjectId && !seenProjects.has(rootProjectId)) {
      seenProjects.add(rootProjectId);
      entry.projectIds.push(rootProjectId);
      entry.projects.push({
        projectId: rootProjectId,
        tenantSlug: slug,
        appId: null,
      });
    }

    const pack = getAppPack(row.metadata);
    for (const app of pack?.apps ?? []) {
      const projectId = String(app.vercelProjectId ?? '').trim();
      if (!projectId || seenProjects.has(projectId)) continue;
      seenProjects.add(projectId);
      entry.projectIds.push(projectId);
      entry.projects.push({
        projectId,
        tenantSlug: slug,
        appId: app.appId ?? null,
      });
    }
  }

  return map;
}

/** Total attributed Vercel projects across all orgs (suite apps count separately). */
export function totalAttributedProjects(map: AttributionMap): number {
  let n = 0;
  for (const entry of map.values()) n += entry.projectIds.length;
  return n;
}

/** Invert branch name → org id for Neon allocation. */
export function branchToOrgIndex(map: AttributionMap): Map<string, string> {
  const index = new Map<string, string>();
  for (const entry of map.values()) {
    for (const branch of entry.branchNames) {
      index.set(branch, entry.orgId);
    }
  }
  return index;
}

/**
 * Split an integer amount across `weights` so shares sum exactly to `total`.
 * Larger remainders go to earlier indices (stable, deterministic).
 */
export function allocateByWeights(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total === 0 || sum <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }
  const raw = weights.map((w) => (total * w) / sum);
  const floors = raw.map((x) => Math.floor(x));
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  const out = [...floors];
  for (const { i } of order) {
    if (remainder <= 0) break;
    out[i] += 1;
    remainder -= 1;
  }
  return out;
}

/**
 * Split a floating quantity across weights (no integer constraint).
 * Last bucket absorbs floating residual so the sum matches `total`.
 */
export function allocateQuantityByWeights(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total === 0 || sum <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }
  const out: number[] = [];
  let allocated = 0;
  for (let i = 0; i < weights.length; i++) {
    if (i === weights.length - 1) {
      out.push(total - allocated);
    } else {
      const share = (total * weights[i]) / sum;
      out.push(share);
      allocated += share;
    }
  }
  return out;
}
