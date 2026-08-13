/**
 * Suite Provisioning Pipeline — provisions infrastructure for each app in a suite.
 *
 * Called after app pack materialization (or when user clicks "Deploy All Apps").
 * For each pending/deploying app:
 *   1. Provisions Neon database branch
 *   2. Deploys Vercel project
 *   3. Seeds tenant defaults (pages, nav, security groups)
 *   4. Updates SuiteAppInstance status + metadata with deployed state
 *
 * This bridges the gap between app-pack generation (which only writes config) and
 * actual infrastructure provisioning (which needs per-app Neon + Vercel).
 */

import { createRawClient } from '@/lib/db';
import { provisionTenantDatabase, type ProvisionedDatabase } from '@/domain/tenant/neon-provision-service';
import { deployTenant } from '@/domain/tenant/vercel-deploy-service';
import { seedTenantDefaults, seedTemplateSecurityGroups } from '@/domain/tenant/tenant-seed-service';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { getTemplate } from '@/domain/tenant/template-catalog';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export interface SuiteProvisionResult {
  /** Total apps in the suite */
  totalApps: number;
  /** Apps successfully provisioned */
  successful: Array<{ appId: string; dbUrl?: string; appUrl?: string; projectId?: string }>;
  /** Apps that failed provisioning */
  errors: Array<{ appId: string; error: string }>;
}

interface SuiteProvisionOptions {
  /** Only provision specific app IDs (default: all pending/deploying apps) */
  appIds?: string[];
  /** Whether to skip apps that are already live */
  skipLive?: boolean;
}

/**
 * Get the appPack config from tenant metadata.
 */
function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/**
 * Save the updated appPack back to tenant metadata.
 */
async function saveAppPack(db: ReturnType<typeof createRawClient>, slug: string, appPack: AppPackConfig): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

/**
 * Update a single app's status within the appPack.
 */
async function updateAppStatus(
  db: ReturnType<typeof createRawClient>,
  slug: string,
  appPack: AppPackConfig,
  appId: string,
  patch: Partial<SuiteAppInstance>,
): Promise<void> {
  const idx = appPack.apps.findIndex((a) => a.appId === appId);
  if (idx === -1) return;
  appPack.apps[idx] = { ...appPack.apps[idx], ...patch };
  await saveAppPack(db, slug, appPack);
}

/**
 * Provision all apps in a suite.
 *
 * This is the bridge between app-pack generation and actual infrastructure.
 * It's called automatically after materializing a suite (from POST /tenants),
 * or manually by clicking "Deploy All Apps" from the dashboard.
 */
export async function provisionSuiteApps(
  parentSlug: string,
  options?: SuiteProvisionOptions,
): Promise<SuiteProvisionResult> {
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, parentSlug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      throw new Error(`Tenant "${parentSlug}" not found`);
    }

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) {
      throw new Error('Tenant is not in suite mode');
    }

    // Get apps to provision (pending or deploying)
    const statusFilter = options?.skipLive ? ['pending', 'deploying'] : ['pending'];
    const appsToProvision = appPack.apps.filter((a) => {
      if (statusFilter.includes(a.status)) return true;
      if (options?.appIds && options.appIds.length > 0) {
        return options.appIds.includes(a.appId);
      }
      return false;
    });

    // If no apps match, check if we should provision all pending ones
    const finalApps = appsToProvision.length > 0 ? appsToProvision : appPack.apps.filter((a) => a.status === 'pending');

    if (finalApps.length === 0) {
      return { totalApps: appPack.apps.length, successful: [], errors: [] };
    }

    const result: SuiteProvisionResult = {
      totalApps: appPack.apps.length,
      successful: [],
      errors: [],
    };

    for (const app of finalApps) {
      try {
        // Update status to provisioning
        await updateAppStatus(db, parentSlug, appPack, app.appId, { status: 'provisioning' });

        const appSlug = `${parentSlug}__${app.appId}`;
        const tpl = getTemplate(app.templateId);

        // Step 1: Provision Neon database for this app
        let dbUrl: string | undefined;
        try {
          const neonDb = await provisionTenantDatabase(appSlug);
          dbUrl = neonDb.pooledUrl;
        } catch (dbErr) {
          console.warn(`[suite-provision] Neon provisioning skipped for "${app.appId}":`, dbErr instanceof Error ? dbErr.message : String(dbErr));
        }

        // Step 2: Deploy to Vercel
        const deployResult = await deployTenant({
          slug: appSlug,
          displayName: app.name,
          template: app.templateId,
          primaryColor: tpl.defaultColors.primary,
          secondaryColor: tpl.defaultColors.secondary,
          metadata: {
            parentSlug,
            appId: app.appId,
            department: app.department,
            suitePackId: appPack.packId,
          },
        });

        // Step 3: Seed this app's defaults (pages, nav, security groups)
        const seedResult = await seedTenantDefaults({
          slug: appSlug,
          displayName: app.name,
          template: app.templateId,
          primaryColor: tpl.defaultColors.primary,
          secondaryColor: tpl.defaultColors.secondary,
          db,
        });

        await seedTemplateSecurityGroups(db, app.templateId);

        // Update app with deployment results
        await updateAppStatus(db, parentSlug, appPack, app.appId, {
          status: 'live',
          dbUrl: dbUrl ?? null,
          vercelProjectId: deployResult.projectId,
          appUrl: deployResult.appUrl,
          metadata: {
            ...app.metadata,
            models: seedResult.pages || 0, // reuse as model count proxy
            pages: seedResult.pages || 0,
            navItems: seedResult.navItems || 0,
          },
        });

        result.successful.push({
          appId: app.appId,
          dbUrl,
          appUrl: deployResult.appUrl,
          projectId: deployResult.projectId,
        });

        console.log(`[suite-provision] ✅ Provisioned "${app.appId}": ${deployResult.appUrl}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[suite-provision] ❌ Failed to provision "${app.appId}":`, errorMsg);

        // Update status to error
        await updateAppStatus(db, parentSlug, appPack, app.appId, { status: 'error' });

        result.errors.push({ appId: app.appId, error: errorMsg });
      }
    }

    return result;
  } catch (err) {
    console.error('[suite-provision] Fatal error:', err);
    throw err;
  }
}

/**
 * Deploy only (skip Neon provisioning). Useful for re-deploying apps that already have DBs.
 */
export async function redeploySuiteApps(
  parentSlug: string,
  options?: { appIds?: string[] },
): Promise<SuiteProvisionResult> {
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, parentSlug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      throw new Error(`Tenant "${parentSlug}" not found`);
    }

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) {
      throw new Error('Tenant is not in suite mode');
    }

    const appsToDeploy = options?.appIds
      ? appPack.apps.filter((a) => options.appIds!.includes(a.appId))
      : appPack.apps.filter((a) => a.status === 'live' || a.status === 'deploying' || a.status === 'error');

    if (appsToDeploy.length === 0) {
      return { totalApps: appPack.apps.length, successful: [], errors: [] };
    }

    const result: SuiteProvisionResult = {
      totalApps: appPack.apps.length,
      successful: [],
      errors: [],
    };

    for (const app of appsToDeploy) {
      try {
        await updateAppStatus(db, parentSlug, appPack, app.appId, { status: 'deploying' });

        const appSlug = `${parentSlug}__${app.appId}`;
        const tpl = getTemplate(app.templateId);

        const deployResult = await deployTenant({
          slug: appSlug,
          displayName: app.name,
          template: app.templateId,
          primaryColor: tpl.defaultColors.primary,
          secondaryColor: tpl.defaultColors.secondary,
          metadata: {
            parentSlug,
            appId: app.appId,
            department: app.department,
            suitePackId: appPack.packId,
          },
        });

        await updateAppStatus(db, parentSlug, appPack, app.appId, {
          status: 'live',
          appUrl: deployResult.appUrl,
          vercelProjectId: deployResult.projectId,
        });

        result.successful.push({
          appId: app.appId,
          appUrl: deployResult.appUrl,
          projectId: deployResult.projectId,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[suite-redeploy] ❌ Failed to redeploy "${app.appId}":`, errorMsg);

        await updateAppStatus(db, parentSlug, appPack, app.appId, { status: 'error' });
        result.errors.push({ appId: app.appId, error: errorMsg });
      }
    }

    return result;
  } catch (err) {
    console.error('[suite-redeploy] Fatal error:', err);
    throw err;
  }
}
