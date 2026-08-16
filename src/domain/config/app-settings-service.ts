import type { DbClient } from '@/lib/db';

const APP_SETTINGS_ID = 'default';

const APP_SETTINGS_DDL = `
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  web_search_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  tenant_slug TEXT NOT NULL DEFAULT 'tokenizmyapp',
  tenant_display_name TEXT NOT NULL DEFAULT '',
  tenant_template TEXT NOT NULL DEFAULT 'default',
  tenant_metadata JSONB DEFAULT '{}',
  app_id TEXT NOT NULL DEFAULT '',
  brand_logo_text TEXT NOT NULL DEFAULT '',
  brand_logo_url TEXT NOT NULL DEFAULT '',
  brand_primary_color TEXT NOT NULL DEFAULT '#eb3d28',
  brand_secondary_color TEXT NOT NULL DEFAULT '#0af9fe',
  theme_mode TEXT NOT NULL DEFAULT 'system',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export interface AppSettingsDto {
  webSearchEnabled: boolean;
  tenantSlug: string;
  tenantDisplayName: string;
  tenantTemplate: string;
  tenantMetadata: Record<string, unknown>;
  /** Suite-mode app id (empty for single-app tenants). */
  appId: string;
  brandLogoText: string;
  brandLogoUrl: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  themeMode: string;
  updatedAt: Date;
}

/** Row id convention: "{tenantSlug}__{appId}" when appId is set, "{tenantSlug}" otherwise. */
function buildRowId(tenantSlug: string | undefined, appId: string | undefined): string {
  const slug = tenantSlug ?? APP_SETTINGS_ID;
  return appId ? `${slug}__${appId}` : slug;
}

export async function ensureAppSettingsTable(db: DbClient): Promise<void> {
  await db.$executeRawUnsafe(APP_SETTINGS_DDL);

  // Migrate: add columns if they don't exist (idempotent for existing deployments)
  const migrationCols = [
    'ADD COLUMN IF NOT EXISTS tenant_slug TEXT NOT NULL DEFAULT \'tokenizmyapp\'',
    'ADD COLUMN IF NOT EXISTS tenant_display_name TEXT NOT NULL DEFAULT \'\'',
    'ADD COLUMN IF NOT EXISTS tenant_template TEXT NOT NULL DEFAULT \'default\'',
    'ADD COLUMN IF NOT EXISTS tenant_metadata JSONB DEFAULT \'{}\'',
    'ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT \'\'',
    'ADD COLUMN IF NOT EXISTS brand_logo_text TEXT NOT NULL DEFAULT \'\'',
    'ADD COLUMN IF NOT EXISTS brand_logo_url TEXT NOT NULL DEFAULT \'\'',
    'ADD COLUMN IF NOT EXISTS brand_primary_color TEXT NOT NULL DEFAULT \'#eb3d28\'',
    'ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT NOT NULL DEFAULT \'#0af9fe\'',
  ];
  for (const col of migrationCols) {
    try {
      await db.$executeRawUnsafe(`ALTER TABLE app_settings ${col}`);
    } catch {
      // column may already exist — ignore
    }
  }

  // Ensure index on (tenant_slug, app_id) for multi-tenant / multi-app lookups
  try {
    await db.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS idx_app_settings_tenant_app ON app_settings(tenant_slug, app_id);'
    );
  } catch {
    // index may already exist
  }
}

/**
 * Get app settings for a specific tenant (and, in suite mode, a specific app).
 * @param tenantSlug - tenant slug. Falls back to 'default' if not provided.
 * @param appId - suite-mode app id. Row id becomes "{tenantSlug}__{appId}"; omit for single-app tenants.
 */
export async function getAppSettings(db: DbClient, tenantSlug?: string, appId?: string): Promise<AppSettingsDto> {
  await ensureAppSettingsTable(db);

  const id = buildRowId(tenantSlug, appId);

  const existing = await db.appSetting.findUnique({ where: { id } });
  if (existing) {
    const ex = existing as Record<string, unknown>;
    return {
      webSearchEnabled: existing.webSearchEnabled,
      tenantSlug: String(ex.tenantSlug ?? ex.tenant_slug ?? 'tokenizmyapp'),
      tenantDisplayName: String(ex.tenantDisplayName ?? ex.tenant_display_name ?? ''),
      tenantTemplate: String(ex.tenantTemplate ?? ex.tenant_template ?? 'default'),
      tenantMetadata: (ex.tenantMetadata ?? ex.tenant_metadata ?? {}) as Record<string, unknown>,
      appId: String(ex.appId ?? ex.app_id ?? ''),
      brandLogoText: String(ex.brandLogoText ?? ex.brand_logo_text ?? ''),
      brandLogoUrl: String(ex.brandLogoUrl ?? ex.brand_logo_url ?? ''),
      brandPrimaryColor: String(ex.brandPrimaryColor ?? ex.brand_primary_color ?? '#eb3d28'),
      brandSecondaryColor: String(ex.brandSecondaryColor ?? ex.brand_secondary_color ?? '#0af9fe'),
      updatedAt: existing.updatedAt,
    };
  }

  // Create a new row for this tenant/app
  const created = await db.appSetting.create({
    data: { id, tenantSlug: tenantSlug ?? 'tokenizmyapp', appId: appId ?? '' },
  });
  const cr = created as Record<string, unknown>;

  return {
    webSearchEnabled: created.webSearchEnabled,
    tenantSlug: String(cr.tenantSlug ?? cr.tenant_slug ?? 'tokenizmyapp'),
    tenantDisplayName: String(cr.tenantDisplayName ?? cr.tenant_display_name ?? ''),
    tenantTemplate: String(cr.tenantTemplate ?? cr.tenant_template ?? 'default'),
    tenantMetadata: (cr.tenantMetadata ?? cr.tenant_metadata ?? {}) as Record<string, unknown>,
    appId: String(cr.appId ?? cr.app_id ?? ''),
    brandLogoText: String(cr.brandLogoText ?? cr.brand_logo_text ?? ''),
    brandLogoUrl: String(cr.brandLogoUrl ?? cr.brand_logo_url ?? ''),
    brandPrimaryColor: String(cr.brandPrimaryColor ?? cr.brand_primary_color ?? '#eb3d28'),
    brandSecondaryColor: String(cr.brandSecondaryColor ?? cr.brand_secondary_color ?? '#0af9fe'),
    themeMode: String(cr.themeMode ?? cr.theme_mode ?? "system"),
    updatedAt: created.updatedAt,
  };
}

export async function updateAppSettings(
  db: DbClient,
  patch: {
    webSearchEnabled?: boolean;
    tenantSlug?: string;
    tenantDisplayName?: string;
    tenantTemplate?: string;
    tenantMetadata?: Record<string, unknown>;
    brandLogoText?: string;
    brandLogoUrl?: string;
    brandPrimaryColor?: string;
    brandSecondaryColor?: string;
  },
  tenantSlug?: string,
  appId?: string,
): Promise<AppSettingsDto> {
  await ensureAppSettingsTable(db);

  const id = buildRowId(tenantSlug, appId);

  // Build Prisma update data — map camelCase patch keys to Prisma model field names
  const data: Record<string, unknown> = {};

  if (patch.webSearchEnabled !== undefined) data.webSearchEnabled = patch.webSearchEnabled;
  if (patch.tenantSlug !== undefined) data.tenantSlug = patch.tenantSlug;
  if (patch.tenantDisplayName !== undefined) data.tenantDisplayName = patch.tenantDisplayName;
  if (patch.tenantTemplate !== undefined) data.tenantTemplate = patch.tenantTemplate;
  if (patch.tenantMetadata !== undefined) data.tenantMetadata = patch.tenantMetadata;
  if (patch.brandLogoText !== undefined) data.brandLogoText = patch.brandLogoText;
  if (patch.brandLogoUrl !== undefined) data.brandLogoUrl = patch.brandLogoUrl;
  if (patch.brandPrimaryColor !== undefined) data.brandPrimaryColor = patch.brandPrimaryColor;
  if (patch.themeMode !== undefined) data.themeMode = patch.themeMode;
  if (patch.brandSecondaryColor !== undefined) data.brandSecondaryColor = patch.brandSecondaryColor;

  if (Object.keys(data).length === 0) {
    // Nothing to update — just read back
    return getAppSettings(db, tenantSlug, appId);
  }

  // Ensure a row exists (upsert via Prisma)
  await db.appSetting.upsert({
    where: { id },
    create: { id, tenantSlug: tenantSlug ?? 'tokenizmyapp', appId: appId ?? '' },
    update: data,
  });

  // Read back the full row via Prisma model (not raw SQL)
  return getAppSettings(db, tenantSlug, appId);
}
