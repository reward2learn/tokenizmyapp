import type { DbClient } from '@/lib/db';
import { createRawClient, createClientForUrl } from '@/lib/db';
import { getAppSettings, updateAppSettings } from '@/domain/config/app-settings-service';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';

export interface ResolvedLoadingGraphic {
  /** Effective graphic shown in the app (app override, else tenant default). */
  loadingGraphicUrl: string | null;
  /** App-level override when set; empty string means inherit tenant default. */
  brandLoadingGraphicUrl: string;
  /** Tenant-level default from registry or default app_settings row. */
  tenantLoadingGraphicUrl: string | null;
}

async function readRootTenantLoadingGraphicUrl(tenantSlug: string): Promise<string | null> {
  try {
    const rootDb = createRawClient();
    const rows = (await rootDb.$queryRawUnsafe(
      `SELECT loading_graphic_url FROM tenants WHERE slug = $1 LIMIT 1;`,
      tenantSlug,
    )) as { loading_graphic_url: string | null }[];
    const value = rows[0]?.loading_graphic_url;
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

async function readTenantDefaultGraphic(db: DbClient, tenantSlug: string): Promise<string | null> {
  const settings = await getAppSettings(db, tenantSlug);
  const value = settings.brandLoadingGraphicUrl?.trim();
  if (value) return value;
  return readRootTenantLoadingGraphicUrl(tenantSlug);
}

/**
 * Persist tenant default loading graphic to the tenant DB default app_settings row
 * so deployed apps can resolve it without querying the root registry.
 */
export async function syncTenantLoadingGraphicToAppDb(
  tenantSlug: string,
  loadingGraphicUrl: string | null,
): Promise<void> {
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug);
  const db = dbUrl ? createClientForUrl(dbUrl) : createRawClient();
  try {
    await updateAppSettings(
      db,
      { brandLoadingGraphicUrl: loadingGraphicUrl ?? '' },
      tenantSlug,
    );
  } finally {
    if (dbUrl) await db.$disconnect();
  }
}

/**
 * Resolve the loading graphic for a tenant deployment.
 * App override wins when non-empty; otherwise falls back to tenant default.
 */
export async function resolveLoadingGraphic(
  db: DbClient,
  tenantSlug: string,
  appId?: string,
): Promise<ResolvedLoadingGraphic> {
  if (!appId) {
    const settings = await getAppSettings(db, tenantSlug);
    const tenantDefault =
      settings.brandLoadingGraphicUrl?.trim() ||
      (await readRootTenantLoadingGraphicUrl(tenantSlug));
    const tenantLoadingGraphicUrl = tenantDefault || null;
    return {
      loadingGraphicUrl: tenantLoadingGraphicUrl,
      brandLoadingGraphicUrl: tenantLoadingGraphicUrl ?? '',
      tenantLoadingGraphicUrl,
    };
  }

  const settings = await getAppSettings(db, tenantSlug, appId);
  const brandLoadingGraphicUrl = settings.brandLoadingGraphicUrl?.trim() ?? '';
  const tenantLoadingGraphicUrl = await readTenantDefaultGraphic(db, tenantSlug);
  const loadingGraphicUrl =
    brandLoadingGraphicUrl.length > 0 ? brandLoadingGraphicUrl : tenantLoadingGraphicUrl;

  return {
    loadingGraphicUrl,
    brandLoadingGraphicUrl,
    tenantLoadingGraphicUrl,
  };
}
