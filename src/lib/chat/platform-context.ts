/**
 * Live platform registry context for the tokenizmyapp factory chat assistant.
 *
 * Keyword-gated injection (`fetchPlatformContext`) and on-demand tools
 * (`fetchPlatformRegistry`, etc.) share these query helpers.
 */
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { listOrganizations } from '@/domain/billing/organization-service';
import { getSubscription } from '@/domain/billing/entitlement-service';
import { getCreditBalance } from '@/domain/billing/credit-service';
import {
  listRegisteredDeployTargets,
  listVercelTeamProjects,
} from '@/domain/tenant/vercel-hot-deploy-service';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

const PLATFORM_QUERY_KEYWORDS = [
  'tenant', 'tenants',
  'app', 'apps',
  'deploy', 'deployment', 'deployed', 'deployments',
  'provision', 'provisioning', 'provisioned',
  'suite', 'multi-app', 'multi app', 'app pack', 'apppack',
  'registry', 'registered',
  'how many', 'how much', 'count', 'total',
  'vercel', 'project',
  'organization', 'organizations', ' org',
  'platform', 'factory', 'control plane',
  'ops admin', 'live url', 'app url',
  'failed', 'error status', 'needs attention',
  'credit', 'credits', 'billing', 'plan',
  'unregistered',
];

export type PlatformRegistryQuery = {
  status?: string;
  tenantSlug?: string;
  errorsOnly?: boolean;
};

type TenantRow = {
  slug: string;
  display_name: string;
  status: string;
  template: string;
  vercel_project_id: string | null;
  app_url: string | null;
  metadata: unknown;
  created_at: string;
};

function getTemplateMode(row: TenantRow): 'single' | 'suite' {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return cfg.templateMode === 'suite' ? 'suite' : 'single';
}

function getAppPack(row: TenantRow): AppPackConfig | null {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

function tenantHasErrors(row: TenantRow): boolean {
  if (row.status === 'error' || row.status === 'deploying') return true;
  const pack = getAppPack(row);
  return (pack?.apps ?? []).some((app) => app.status === 'error' || app.status === 'provisioning');
}

function formatAppStatus(app: SuiteAppInstance): string {
  const url = app.appUrl ? ` url=${app.appUrl}` : '';
  const project = app.vercelProjectId ? ' vercel=registered' : ' vercel=none';
  return `${app.appId} (${app.name}, ${app.status})${url}${project}`;
}

/** True when the user message likely asks about tenants, apps, or deployments. */
export function detectPlatformQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return PLATFORM_QUERY_KEYWORDS.some((k) => lower.includes(k));
}

async function loadTenantRows(): Promise<TenantRow[]> {
  const db = createRawClient();
  await ensureTenantsTable(db);
  return db.$queryRawUnsafe(
    `SELECT slug, display_name, status, template, vercel_project_id, app_url, metadata, created_at
     FROM tenants
     ORDER BY created_at DESC;`,
  ) as Promise<TenantRow[]>;
}

function filterTenantRows(rows: TenantRow[], query: PlatformRegistryQuery = {}): TenantRow[] {
  let filtered = [...rows];

  if (query.tenantSlug?.trim()) {
    const slug = query.tenantSlug.trim().toLowerCase();
    filtered = filtered.filter((row) => row.slug.toLowerCase() === slug);
  }

  if (query.status?.trim()) {
    const status = query.status.trim().toLowerCase();
    filtered = filtered.filter((row) => row.status.toLowerCase() === status);
  }

  if (query.errorsOnly) {
    filtered = filtered.filter(tenantHasErrors);
  }

  return filtered;
}

/**
 * Load tenant/app inventory with optional filters.
 * Never includes secrets (db URLs, API keys, OAuth creds).
 */
export async function fetchPlatformRegistry(query: PlatformRegistryQuery = {}): Promise<string> {
  const rows = filterTenantRows(await loadTenantRows(), query);

  if (!rows.length) {
    if (query.tenantSlug || query.status || query.errorsOnly) {
      return '=== PLATFORM REGISTRY ===\nNo tenants match the requested filters.';
    }
    return '=== PLATFORM REGISTRY ===\nNo tenants are registered yet.';
  }

  const factorySlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'tokenizmyapp';
  const customerTenants = rows.filter((r) => r.slug !== factorySlug);

  const statusCounts = new Map<string, number>();
  let singleMode = 0;
  let suiteMode = 0;
  let suiteAppsTotal = 0;
  let suiteAppsLive = 0;
  let suiteAppsError = 0;
  let tenantProjectsRegistered = 0;
  let tenantProjectsLive = 0;

  const lines: string[] = [];

  for (const row of rows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
    const mode = getTemplateMode(row);
    if (mode === 'suite') {
      suiteMode += 1;
    } else {
      singleMode += 1;
    }

    if (row.vercel_project_id?.trim()) {
      tenantProjectsRegistered += 1;
      if (row.app_url?.trim()) tenantProjectsLive += 1;
    }

    const pack = getAppPack(row);
    for (const app of pack?.apps ?? []) {
      suiteAppsTotal += 1;
      if (app.status === 'live') suiteAppsLive += 1;
      if (app.status === 'error') suiteAppsError += 1;
    }
  }

  const singleAppsLive = rows.filter(
    (r) => getTemplateMode(r) === 'single' && Boolean(r.app_url?.trim()),
  ).length;

  const totalApps = singleMode + suiteAppsTotal;
  const totalLiveApps = singleAppsLive + suiteAppsLive;

  lines.push('=== PLATFORM REGISTRY SUMMARY ===');
  lines.push(`As of: ${new Date().toISOString()}`);
  if (query.tenantSlug) lines.push(`Filter: tenantSlug=${query.tenantSlug}`);
  if (query.status) lines.push(`Filter: status=${query.status}`);
  if (query.errorsOnly) lines.push('Filter: errorsOnly=true');
  lines.push(`Matching tenant records: ${rows.length} (${customerTenants.length} customer tenant(s), excluding factory slug "${factorySlug}")`);
  lines.push(`Template mode: ${singleMode} single-app, ${suiteMode} suite`);
  lines.push(`Total apps: ${totalApps} (${singleMode} single-tenant app(s) + ${suiteAppsTotal} suite app instance(s))`);
  lines.push(`Live apps (appUrl set or suite status=live): ${totalLiveApps}`);
  if (suiteAppsError > 0) {
    lines.push(`Suite apps in error: ${suiteAppsError}`);
  }
  lines.push(`Tenant-level Vercel projects registered: ${tenantProjectsRegistered} (${tenantProjectsLive} with live appUrl)`);

  const statusLine = [...statusCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, count]) => `${status}=${count}`)
    .join(', ');
  lines.push(`Tenant status breakdown: ${statusLine}`);

  lines.push('');
  lines.push('=== TENANT DETAILS (most recent first) ===');
  lines.push('slug | display_name | status | mode | template | tenant_app_url | suite_apps');

  for (const row of rows) {
    const mode = getTemplateMode(row);
    const pack = getAppPack(row);
    const suiteApps = pack?.apps ?? [];
    const suiteSummary = mode === 'suite'
      ? suiteApps.length
        ? suiteApps.map(formatAppStatus).join('; ')
        : 'none'
      : '-';
    const tenantUrl = row.app_url?.trim() || '-';
    lines.push(
      `${row.slug} | ${row.display_name} | ${row.status} | ${mode} | ${row.template} | ${tenantUrl} | ${suiteSummary}`,
    );
  }

  return lines.join('\n');
}

/** Keyword-gated fast path — full registry with no filters. */
export async function fetchPlatformContext(): Promise<string> {
  const body = await fetchPlatformRegistry();
  return `${body}\n\nUse these counts directly when answering how many tenants or apps exist. `
    + 'Customer tenants exclude the factory control-plane slug unless the user asks about the platform app itself.';
}

/** Organizations, subscription plans, and AI credit balances. */
export async function fetchOrganizationsBillingContext(orgSlug?: string): Promise<string> {
  const db = createRawClient();
  const organizations = await listOrganizations(db);
  const slugFilter = orgSlug?.trim().toLowerCase();

  const filtered = slugFilter
    ? organizations.filter((org) => org.slug.toLowerCase() === slugFilter)
    : organizations;

  if (!filtered.length) {
    return slugFilter
      ? `=== ORGANIZATIONS & BILLING ===\nNo organization found with slug "${orgSlug}".`
      : '=== ORGANIZATIONS & BILLING ===\nNo organizations are registered yet.';
  }

  const lines: string[] = [
    '=== ORGANIZATIONS & BILLING ===',
    `As of: ${new Date().toISOString()}`,
    `Organizations: ${filtered.length}`,
    '',
    'slug | display_name | plan | status | credits_available | expiring_soon | tenant_count | tenants',
  ];

  for (const org of filtered) {
    const [sub, balance] = await Promise.all([
      getSubscription(org.id, db),
      getCreditBalance(org.id, db),
    ]);
    const tenants = org.tenants ?? [];
    const tenantSlugs = tenants.map((t) => t.slug).join(', ') || '-';
    lines.push(
      `${org.slug} | ${org.displayName} | ${sub.planId} | ${sub.status} | ${balance.available} | ${balance.expiringSoon} | ${tenants.length} | ${tenantSlugs}`,
    );
  }

  lines.push('');
  lines.push(
    'Credits are AI usage balance for the organization. Never disclose billing emails, tax IDs, or Stripe identifiers.',
  );

  return lines.join('\n');
}

/** Registered vs unregistered Vercel team projects. */
export async function fetchVercelInventoryContext(): Promise<string> {
  const [targets, teamProjects] = await Promise.all([
    listRegisteredDeployTargets(),
    listVercelTeamProjects().catch((err) => {
      console.warn('[platform-context] Vercel team list failed:', err);
      return [];
    }),
  ]);

  const registeredIds = new Set(targets.map((t) => t.projectId));
  const unregistered = teamProjects.filter((p) => !registeredIds.has(p.id));

  const lines: string[] = [
    '=== VERCEL INVENTORY ===',
    `As of: ${new Date().toISOString()}`,
    `Registered deploy targets (in tenants DB): ${targets.length}`,
    `Vercel team projects (API): ${teamProjects.length}`,
    `Unregistered on Vercel (not linked in tenants DB): ${unregistered.length}`,
    '',
    '=== REGISTERED TARGETS ===',
    'tenant_slug | app_id | label | project_id | has_deploy_hook',
  ];

  for (const target of targets) {
    lines.push(
      `${target.tenantSlug} | ${target.appId ?? '-'} | ${target.label} | ${target.projectId} | ${target.deployHookUrl ? 'yes' : 'no'}`,
    );
  }

  if (unregistered.length) {
    lines.push('');
    lines.push('=== UNREGISTERED VERCEL PROJECTS ===');
    lines.push('project_id | name | framework');
    for (const project of unregistered) {
      lines.push(`${project.id} | ${project.name} | ${project.framework ?? '-'}`);
    }
  }

  lines.push('');
  lines.push(
    'Unregistered projects exist on the Vercel team but are not linked to any tenant or suite app in the registry.',
  );

  return lines.join('\n');
}
