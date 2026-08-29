/**
 * Full Tenant Migrate — schema + repoint existing Vercel / auth / Neon / Stripe
 * instances that are already configured on the tenant (and suite apps).
 *
 * Invoked by POST /api/admin/tenants/[slug]/migrate with `{ mode: 'full' }`.
 * Each step is best-effort: failures are collected in `steps` so one CLI/API
 * outage does not abort the rest.
 *
 * Order matches the safe repoint path:
 *   1. Neon URL refresh (existing branch only) + connectivity check
 *   2. Schema / security-group migrate (tenant DB + per-app template groups)
 *   3. Google OAuth sync (SDK / gcloud CLI twin of scripts/google-oauth-sync.mjs)
 *   4. Vercel env push (DB, OAuth, relay, identity) for root + each app project
 *   5. Billing identity (ORGANIZATION_ID / PLATFORM_POSTGRES_URL)
 *   6. Stripe keys + STRIPE_PRICE_* + agentic catalog (cron twin)
 *   7. Optional deploy-hook redeploys so NEXT_PUBLIC_* reach client bundles
 */
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { addTenantColumnsIfMissing, seedTemplateSecurityGroups } from '@/domain/tenant/tenant-seed-service';
import { ensureTenantConfigColumns } from '@/domain/tenant/tenant-config-service';
import { backfillDefaultOrganization } from '@/domain/billing/organization-service';
import { ensureBillingTables, getSubscription } from '@/domain/billing/entitlement-service';
import { propagateBillingIdentityForTenant } from '@/domain/billing/propagate-billing-identity';
import { refreshTenantDatabaseUrls } from '@/domain/tenant/neon-provision-service';
import {
  fetchGoogleOAuthClientInfo,
  updateGoogleOAuthClientRedirectUris,
} from '@/domain/tenant/google-cloud-service';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

type RawDb = ReturnType<typeof createRawClient>;

export type MigrateStepStatus = 'ok' | 'skipped' | 'error';

export interface MigrateStepResult {
  status: MigrateStepStatus;
  detail: string;
}

export interface FullTenantMigrateResult {
  migrated: true;
  mode: 'full';
  steps: Record<string, MigrateStepResult>;
  /** Flat string map for snackbar / legacy UI */
  results: Record<string, string>;
}

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function stepOk(detail: string): MigrateStepResult {
  return { status: 'ok', detail };
}
function stepSkipped(detail: string): MigrateStepResult {
  return { status: 'skipped', detail };
}
function stepError(detail: string): MigrateStepResult {
  return { status: 'error', detail };
}

function flattenSteps(steps: Record<string, MigrateStepResult>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, step] of Object.entries(steps)) {
    out[key] = `${step.status}: ${step.detail}`;
  }
  return out;
}

async function pingTenantDb(dbUrl: string): Promise<boolean> {
  const client = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  try {
    await client.$queryRawUnsafe('SELECT 1');
    return true;
  } finally {
    await client.$disconnect().catch(() => undefined);
  }
}

/** Registry + billing + tenant isolation columns + security groups. */
export async function runSchemaMigrate(
  slug: string,
  db: RawDb,
): Promise<{ results: Record<string, string>; tenant: Record<string, unknown>; groupsSynced: number }> {
  const results: Record<string, string> = {};

  await ensureTenantsTable(db);
  results.tenantsTable = 'ok';

  await ensureBillingTables(db);
  const backfill = await backfillDefaultOrganization(db);
  results.billingTables = 'ok';
  results.organizationBackfill = backfill.created
    ? `created default org, assigned ${backfill.tenantsAssigned} tenant(s)`
    : `assigned ${backfill.tenantsAssigned} tenant(s)`;

  const sub = await getSubscription(backfill.orgId, db);
  results.subscription = `${sub.planId} (${sub.status})`;

  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) {
    throw new Error('Tenant not found');
  }
  const tenant = rows[0];
  results.tenantExists = 'ok';

  const tenantDbUrl = (tenant.db_url as string | null) ?? null;
  const migrateClient = tenantDbUrl
    ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
    : null;
  let groupsSynced = 0;
  try {
    await addTenantColumnsIfMissing(migrateClient ?? db);
    results.tenantColumns = 'ok';

    const template = String(tenant.template ?? 'restaurant');
    groupsSynced = await seedTemplateSecurityGroups(migrateClient ?? db, template);
    results.securityGroups = `${groupsSynced} synced`;

    const pack = getAppPack(tenant);
    const templates = new Set<string>();
    for (const app of pack?.apps ?? []) {
      if (app.templateId) templates.add(app.templateId);
    }
    let appGroups = 0;
    for (const templateId of templates) {
      if (templateId === template) continue;
      appGroups += await seedTemplateSecurityGroups(migrateClient ?? db, templateId);
    }
    if (templates.size > 0) {
      results.appSecurityGroups = `${appGroups} synced across ${templates.size} template(s)`;
    }
  } finally {
    if (migrateClient) await migrateClient.$disconnect();
  }

  await ensureTenantConfigColumns(db);
  results.configColumns = 'ok';

  return { results, tenant, groupsSynced };
}

async function stepNeon(
  slug: string,
  db: RawDb,
  tenant: Record<string, unknown>,
): Promise<{ step: MigrateStepResult; tenant: Record<string, unknown> }> {
  try {
    const refreshed = await refreshTenantDatabaseUrls(slug);
    if (refreshed) {
      const databaseConfig = {
        databaseUrl: refreshed.pooledUrl,
        pooledUrl: refreshed.pooledUrl,
        directUrl: refreshed.directUrl,
        dbUrl: refreshed.pooledUrl,
      };
      await db.$executeRawUnsafe(
        `UPDATE tenants
         SET db_url = $1,
             metadata = jsonb_set(
               jsonb_set(COALESCE(metadata, '{}'::jsonb), '{config}', COALESCE(metadata->'config', '{}'::jsonb), true),
               '{config,database}',
               $2::jsonb,
               true
             ),
             updated_at = CURRENT_TIMESTAMP
         WHERE slug = $3;`,
        refreshed.pooledUrl,
        JSON.stringify(databaseConfig),
        slug,
      );
      const rows = (await db.$queryRawUnsafe(
        `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
        slug,
      )) as Record<string, unknown>[];
      const ok = await pingTenantDb(refreshed.pooledUrl);
      return {
        step: stepOk(
          ok
            ? `Refreshed Neon branch tenant-${slug} (${refreshed.branchId}) — reachable`
            : `Refreshed Neon URLs but ping failed`,
        ),
        tenant: rows[0] ?? { ...tenant, db_url: refreshed.pooledUrl },
      };
    }

    const dbUrl = String(tenant.db_url ?? '').trim();
    if (!dbUrl) {
      return { step: stepSkipped('No tenants.db_url — Neon repoint skipped'), tenant };
    }
    const ok = await pingTenantDb(dbUrl);
    return {
      step: ok
        ? stepOk('Existing db_url reachable (no Neon branch tenant-* to refresh)')
        : stepError('Existing db_url ping failed'),
      tenant,
    };
  } catch (err) {
    return {
      step: stepError(err instanceof Error ? err.message : String(err)),
      tenant,
    };
  }
}

async function stepGoogleAuth(
  slug: string,
  db: RawDb,
  tenant: Record<string, unknown>,
): Promise<MigrateStepResult> {
  try {
    const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const savedGoogle = (cfg.googleAuth ?? {}) as Record<string, unknown>;
    const clientId = String(savedGoogle.clientId ?? process.env.GOOGLE_CLIENT_ID ?? '').trim();
    const projectId = String(savedGoogle.projectId ?? process.env.GOOGLE_PROJECT_ID ?? '').trim();
    if (!clientId || !projectId) {
      return stepSkipped('No Google OAuth client configured');
    }

    const pack = getAppPack(tenant);
    const knownUris = new Set<string>(asStringArray(savedGoogle.redirectUris));
    for (const app of pack?.apps ?? []) {
      const appGa = (app.config as { googleAuth?: { redirectUris?: unknown } } | undefined)?.googleAuth;
      for (const u of asStringArray(appGa?.redirectUris)) knownUris.add(u);
    }

    const info = await fetchGoogleOAuthClientInfo(clientId, projectId);
    if (!info) {
      const relay = Boolean(process.env.GOOGLE_RELAY_SECRET && process.env.GOOGLE_RELAY_REDIRECT_URI);
      return stepSkipped(
        relay
          ? `GCP OAuth API unavailable — factory relay configured (${process.env.GOOGLE_RELAY_REDIRECT_URI})`
          : 'GCP OAuth API unavailable and factory relay not configured',
      );
    }

    const liveUris = asStringArray(info.redirectUris);
    const merged = [...new Set([...liveUris, ...knownUris])];
    const patched = await updateGoogleOAuthClientRedirectUris(clientId, projectId, merged);

    const nextGoogle = {
      ...savedGoogle,
      clientId,
      projectId,
      redirectUris: merged,
    };
    const nextCfg = { ...cfg, googleAuth: nextGoogle };
    const nextMeta = { ...meta, config: nextCfg };
    await db.$executeRawUnsafe(
      `UPDATE tenants SET metadata = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
      JSON.stringify(nextMeta),
      slug,
    );

    return stepOk(
      patched
        ? `Synced ${merged.length} redirect URI(s) + patched GCP client`
        : `Synced ${merged.length} redirect URI(s) into tenant config (GCP patch skipped)`,
    );
  } catch (err) {
    return stepError(err instanceof Error ? err.message : String(err));
  }
}


/**
 * Step: Verify all Vercel projects exist under the current team.
 * After a team transfer, projects must be re-registered under the new team.
 * This step checks each project ID and warns if the project is not found
 * under the current VERCEL_TEAM_ID.
 */
async function stepVerifyVercelTeam(
  slug: string,
  tenant: Record<string, unknown>,
): Promise<MigrateStepResult> {
  const { VERCEL_TEAM_ID } = await import('@/lib/vercel-team');

  if (!VERCEL_TEAM_ID) {
    return stepSkipped('VERCEL_TEAM_ID not set — team verification skipped');
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return stepSkipped('VERCEL_TOKEN not set — team verification skipped');
  }

  const VERCEL_API = 'https://api.vercel.com';
  const projectIds: { id: string; name: string }[] = [];

  const rootId = String(tenant.vercel_project_id ?? '').trim();
  if (rootId) projectIds.push({ id: rootId, name: slug });

  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const pack = (cfg.appPack as { apps?: Array<{ appId: string; vercelProjectId?: string }> }) ?? null;
  for (const app of pack?.apps ?? []) {
    const pid = String(app.vercelProjectId ?? '').trim();
    if (pid) projectIds.push({ id: pid, name: `${slug}/${app.appId}` });
  }

  if (projectIds.length === 0) {
    return stepSkipped('No Vercel project IDs to verify');
  }

  const verified: string[] = [];
  const notFound: string[] = [];
  const errors: string[] = [];

  for (const project of projectIds) {
    try {
      const url = `${VERCEL_API}/v10/projects/${project.id}?teamId=${VERCEL_TEAM_ID}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        verified.push(project.name);
      } else if (res.status === 404) {
        notFound.push(`${project.name} (${project.id})`);
      } else {
        const body = await res.text().catch(() => '');
        errors.push(`${project.name}: HTTP ${res.status} ${body.slice(0, 100)}`);
      }
    } catch (err) {
      errors.push(`${project.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (notFound.length > 0) {
    return stepError(
      `Project(s) NOT found under team ${VERCEL_TEAM_ID}: ${notFound.join(', ')}. ` +
      `If you transferred projects to a new team, update VERCEL_TEAM_ID env var and re-run migrate.`
    );
  }
  if (errors.length > 0) {
    return stepError(`Team verification errors: ${errors.join('; ')}`);
  }
  return stepOk(`${verified.length} project(s) verified under team ${VERCEL_TEAM_ID}`);
}

async function stepVercelEnv(
  slug: string,
  db: RawDb,
  tenant: Record<string, unknown>,
): Promise<MigrateStepResult> {
  try {
    const { buildEnvVarsForProject, syncEnvVars } = await import('@/domain/tenant/vercel-deploy-service');
    const { resolveTemplate } = await import('@/domain/tenant/custom-template-service');

    const orgId = String(tenant.organization_id ?? '').trim() || null;
    const tenantDbUrl = (tenant.db_url as string | null) ?? null;
    const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const pack = getAppPack(tenant);

    const targets: { name: string; projectId: string; input: Parameters<typeof syncEnvVars>[1] }[] = [];

    const rootProjectId = String(tenant.vercel_project_id ?? '').trim();
    if (rootProjectId) {
      const tpl = await resolveTemplate(String(tenant.template ?? 'restaurant'));
      targets.push({
        name: slug,
        projectId: rootProjectId,
        input: {
          slug,
          displayName: String(tenant.display_name ?? slug),
          template: String(tenant.template ?? 'restaurant'),
          primaryColor: tpl.defaultColors.primary,
          secondaryColor: tpl.defaultColors.secondary,
          dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
          metadata: { ...meta, ...(orgId ? { organizationId: orgId } : {}) },
          projectId: rootProjectId,
        },
      });
    }

    for (const app of pack?.apps ?? []) {
      const projectId = String(app.vercelProjectId ?? '').trim();
      if (!projectId) continue;
      const tpl = await resolveTemplate(app.templateId);
      const appCfg = (app.config ?? {}) as Record<string, unknown>;
      const mergedMeta = {
        ...meta,
        config: { ...cfg, ...appCfg },
        appId: app.appId,
        ...(orgId ? { organizationId: orgId } : {}),
      };
      targets.push({
        name: `${slug}/${app.appId}`,
        projectId,
        input: {
          slug: `${slug}-${app.appId}`,
          displayName: app.name,
          template: app.templateId,
          primaryColor: tpl.defaultColors.primary,
          secondaryColor: tpl.defaultColors.secondary,
          dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
          metadata: mergedMeta,
          projectId,
        },
      });
    }

    if (targets.length === 0) {
      return stepSkipped('No Vercel project IDs on tenant or suite apps');
    }

    const pushed: string[] = [];
    const failed: string[] = [];
    let envTotal = 0;
    for (const t of targets) {
      try {
        // Touch buildEnvVars so we log key count; syncEnvVars builds again internally.
        const keys = Object.keys(await buildEnvVarsForProject(t.input));
        const count = await syncEnvVars(t.projectId, t.input);
        envTotal += count;
        pushed.push(`${t.name}(${count}/${keys.length})`);
      } catch (err) {
        failed.push(`${t.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Keep linter happy — db reserved for future root-project registry writes
    void db;

    if (failed.length > 0 && pushed.length === 0) {
      return stepError(failed.join('; '));
    }
    return stepOk(
      `Pushed env to ${pushed.length} project(s), ${envTotal} vars` +
        (failed.length ? ` · failed: ${failed.join('; ')}` : ''),
    );
  } catch (err) {
    return stepError(err instanceof Error ? err.message : String(err));
  }
}

async function stepBillingIdentity(slug: string, db: RawDb): Promise<MigrateStepResult> {
  try {
    const result = await propagateBillingIdentityForTenant(slug, db);
    if (!result.orgId) {
      return stepSkipped(result.errors[0] ?? 'No organization_id');
    }
    return stepOk(
      `org ${result.orgId} → ${result.appsTouched} project(s), ${result.envVarsPushed} env writes` +
        (result.skippedNoProject.length ? ` · no project: ${result.skippedNoProject.join(',')}` : '') +
        (result.errors.length ? ` · errors: ${result.errors.join('; ')}` : ''),
    );
  } catch (err) {
    return stepError(err instanceof Error ? err.message : String(err));
  }
}

async function stepStripeAndCron(
  slug: string,
  db: RawDb,
  tenant: Record<string, unknown>,
  options: { triggerRedeploy: boolean },
): Promise<{ stripe: MigrateStepResult; cron: MigrateStepResult; redeploy: MigrateStepResult }> {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
  let secretKey = String(stripe.secretKey ?? '').trim();
  const webhookSecret = String(stripe.webhookSecret ?? '').trim();
  let publishableKey = String(stripe.publishableKey ?? '').trim();
  const agentic = (stripe.agenticCommerce ?? {}) as Record<string, unknown>;
  const agenticEnabled = agentic.enabled === true;
  const selfServe = (stripe.selfServeBilling ?? {}) as Record<string, unknown>;
  const selfServeBillingEnabled = selfServe.enabled === true;

  const { readSubscriptionCatalogFromStripeMeta } = await import(
    '@/domain/billing/subscription-catalog-service'
  );
  const { amounts: subscriptionAmounts, prices: catalogPrices } =
    readSubscriptionCatalogFromStripeMeta(stripe);
  const hasSubscriptionAmounts = Object.values(subscriptionAmounts).some((c) => c > 0);
  const hasCatalogPriceIds = Object.values(catalogPrices).some((id) => id.trim());

  const tenantProjectId = String(tenant.vercel_project_id ?? '');
  if (tenantProjectId && (!secretKey || !publishableKey)) {
    try {
      const { getProjectEnvValues } = await import('@/domain/tenant/vercel-stripe-marketplace-service');
      const vercel = await getProjectEnvValues(tenantProjectId, [
        'STRIPE_SECRET_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      ]);
      if (!secretKey && vercel.STRIPE_SECRET_KEY) secretKey = vercel.STRIPE_SECRET_KEY.trim();
      if (!publishableKey && vercel.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        publishableKey = vercel.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim();
      }
    } catch {
      /* marketplace read is optional */
    }
  }

  const nothingToPush =
    !secretKey &&
    !webhookSecret &&
    !publishableKey &&
    !agenticEnabled &&
    !selfServeBillingEnabled &&
    !hasSubscriptionAmounts &&
    !hasCatalogPriceIds;

  if (nothingToPush) {
    return {
      stripe: stepSkipped('No Stripe keys / prices / agentic config on tenant'),
      cron: stepSkipped('Agentic catalog not enabled'),
      redeploy: stepSkipped('No Stripe push — redeploy hooks not fired'),
    };
  }

  if (webhookSecret.startsWith('eyJ') || (webhookSecret && !webhookSecret.startsWith('whsec_'))) {
    return {
      stripe: stepError('Invalid STRIPE_WEBHOOK_SECRET (need whsec_ signing secret)'),
      cron: stepSkipped('Skipped due to Stripe webhook secret error'),
      redeploy: stepSkipped('Skipped due to Stripe error'),
    };
  }

  try {
    const { syncStripeEnvVars } = await import('@/domain/tenant/vercel-deploy-service');
    let pricesToPush = { ...catalogPrices };
    let priceSyncMsg = '';

    if (secretKey && hasSubscriptionAmounts) {
      try {
        const { syncTenantSubscriptionCatalogFromMetadata } = await import(
          '@/domain/billing/subscription-catalog-service'
        );
        const { resolveTenantStripeConfig } = await import('@/domain/billing/organization-service');
        const orgId = String(tenant.organization_id ?? '').trim();
        const stripeConfig = orgId
          ? await resolveTenantStripeConfig(orgId, db)
          : { secretKey, webhookSecret, publishableKey, prices: catalogPrices };
        const syncResult = await syncTenantSubscriptionCatalogFromMetadata(
          slug,
          db,
          stripeConfig ?? { secretKey, webhookSecret, publishableKey, prices: catalogPrices },
        );
        if (syncResult) {
          pricesToPush = syncResult.prices;
          priceSyncMsg = syncResult.message;
        }
      } catch (err) {
        priceSyncMsg = err instanceof Error ? err.message : 'price sync failed';
      }
    }

    const projects: { id: string; name: string; deployHookUrl?: string }[] = [];
    if (tenantProjectId) {
      projects.push({
        id: tenantProjectId,
        name: slug,
        deployHookUrl:
          String((cfg.hooks as Record<string, unknown> | undefined)?.deployHookUrl ?? '') || undefined,
      });
    }
    const pack = getAppPack(tenant);
    for (const app of pack?.apps ?? []) {
      if (app.vercelProjectId) {
        projects.push({
          id: app.vercelProjectId,
          name: `${slug}/${app.appId}`,
          deployHookUrl: app.deployHookUrl || undefined,
        });
      }
    }

    if (projects.length === 0) {
      return {
        stripe: stepSkipped('Stripe configured but no Vercel projects to push to'),
        cron: agenticEnabled ? stepSkipped('No projects for catalog sync context') : stepSkipped('Agentic off'),
        redeploy: stepSkipped('No projects'),
      };
    }

    let envCount = 0;
    const pushed: string[] = [];
    const stripeFailed: string[] = [];
    // Per-project isolation: one stale vercelProjectId must not abort cron/redeploy
    // for healthy suite apps (matches stepVercelEnv).
    for (const project of projects) {
      try {
        const count = await syncStripeEnvVars(project.id, {
          secretKey,
          webhookSecret,
          publishableKey,
          selfServeBillingEnabled,
          prices: pricesToPush,
        });
        envCount += count;
        if (count > 0) pushed.push(project.name);
      } catch (err) {
        stripeFailed.push(
          `${project.name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    let cron: MigrateStepResult;
    if (agenticEnabled && secretKey) {
      try {
        const { syncAgenticCatalogForTenant } = await import('@/domain/billing/agentic-catalog-service');
        const result = await syncAgenticCatalogForTenant(slug, db, {
          secretKey,
          webhookSecret,
          publishableKey,
        });
        cron = stepOk(result.message);
      } catch (err) {
        cron = stepError(err instanceof Error ? err.message : String(err));
      }
    } else {
      cron = stepSkipped('Agentic commerce not enabled for this tenant');
    }

    let redeploy: MigrateStepResult;
    if (!options.triggerRedeploy) {
      redeploy = stepSkipped('Redeploy hooks disabled for this run');
    } else {
      const redeployTriggered: string[] = [];
      const redeployFailed: string[] = [];
      for (const project of projects) {
        if (!project.deployHookUrl) continue;
        try {
          await fetch(project.deployHookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          redeployTriggered.push(project.name);
        } catch (err) {
          redeployFailed.push(
            `${project.name}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
      if (redeployTriggered.length === 0 && redeployFailed.length === 0) {
        redeploy = stepSkipped('No deploy hooks configured on tenant/apps');
      } else if (redeployFailed.length && !redeployTriggered.length) {
        redeploy = stepError(redeployFailed.join('; '));
      } else {
        redeploy = stepOk(
          `Triggered ${redeployTriggered.length} hook(s)` +
            (redeployFailed.length ? ` · failed: ${redeployFailed.join('; ')}` : ''),
        );
      }
    }

    const stripeDetail =
      `Pushed to ${pushed.length}/${projects.length} project(s), ${envCount} vars` +
      (priceSyncMsg ? ` · ${priceSyncMsg}` : '') +
      (stripeFailed.length ? ` · failed: ${stripeFailed.join('; ')}` : '');

    // TODO(you): pick status for partial Stripe push — see learning prompt below
    if (stripeFailed.length > 0 && pushed.length === 0) {
      return { stripe: stepError(stripeDetail), cron, redeploy };
    }
    return { stripe: stepOk(stripeDetail), cron, redeploy };
  } catch (err) {
    return {
      stripe: stepError(err instanceof Error ? err.message : String(err)),
      cron: stepSkipped('Skipped due to Stripe error'),
      redeploy: stepSkipped('Skipped due to Stripe error'),
    };
  }
}

export interface FullMigrateOptions {
  /**
   * When true, fire each project's deploy hook after Stripe/NEXT_PUBLIC env push
   * so client bundles pick up publishable keys. Default true.
   */
  triggerRedeploy?: boolean;
}

/**
 * Full migrate for one tenant: schema + Neon + auth + Vercel + billing + Stripe + cron catalog.
 */
export async function runFullTenantMigrate(
  slug: string,
  options: FullMigrateOptions = {},
): Promise<FullTenantMigrateResult> {
  const triggerRedeploy = options.triggerRedeploy !== false;
  const db = createRawClient();
  const steps: Record<string, MigrateStepResult> = {};

  // 1–2. Schema migrate first so org/billing rows exist for later identity push.
  // Neon refresh runs before schema so migrate hits the latest connection string.
  let tenant: Record<string, unknown>;
  try {
    const loaded = (await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    if (loaded.length === 0) throw new Error('Tenant not found');

    const neon = await stepNeon(slug, db, loaded[0]);
    steps.neon = neon.step;
    tenant = neon.tenant;

    const schema = await runSchemaMigrate(slug, db);
    steps.schema = stepOk(
      Object.entries(schema.results)
        .map(([k, v]) => `${k}=${v}`)
        .join(', '),
    );
    // Reload after schema (metadata / org may have changed)
    const reloaded = (await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    tenant = reloaded[0] ?? schema.tenant;
  } catch (err) {
    throw err;
  }

  steps.googleAuth = await stepGoogleAuth(slug, db, tenant);
  // Reload metadata if auth wrote redirect URIs
  const afterAuth = (await db.$queryRawUnsafe(
    `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];
  if (afterAuth[0]) tenant = afterAuth[0];

  steps.verifyTeam = await stepVerifyVercelTeam(slug, tenant);
  steps.vercel = await stepVercelEnv(slug, db, tenant);
  steps.billingIdentity = await stepBillingIdentity(slug, db);

  const stripeBundle = await stepStripeAndCron(slug, db, tenant, { triggerRedeploy });
  steps.stripe = stripeBundle.stripe;
  steps.agenticCatalogCron = stripeBundle.cron;
  steps.redeploy = stripeBundle.redeploy;

  const pack = getAppPack(tenant);
  const appIds = (pack?.apps ?? []).map((a: SuiteAppInstance) => a.appId);
  steps.apps = appIds.length
    ? stepOk(`${appIds.length} suite app(s): ${appIds.join(', ')}`)
    : stepSkipped('Single-template tenant (no appPack)');

  console.log(`[full-migrate] Complete for "${slug}":`, flattenSteps(steps));

  return {
    migrated: true,
    mode: 'full',
    steps,
    results: flattenSteps(steps),
  };
}
