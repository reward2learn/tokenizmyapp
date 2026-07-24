/**
 * Tenant Config Service — manages tenant license key, configuration parameters,
 * and environment variable settings.
 */

export interface TenantConfig {
  /** License / subscription API key */
  apiKey?: string;
  /** Google OAuth configuration */
  googleOAuth?: {
    clientId: string;
    clientSecret: string;
    projectId: string;
  };
  /** Vercel project settings */
  vercel?: {
    projectId: string;
    rootDirectory: string;
    framework: string;
  };
  /** Database connection overrides */
  database?: {
    postgresUrl: string;
    databaseUrl: string;
    pgUser: string;
    pgPassword: string;
    pgHost: string;
  };
  /** Custom env vars to set on the tenant's Vercel project */
  envVars?: Record<string, { value: string; sensitive?: boolean }>;
  /** PIN codes for functional roles */
  pins?: Record<string, string>;
  /** Subscription tier */
  subscriptionTier?: 'early' | 'basic' | 'premium' | 'enterprise';
  /** License expiry */
  licenseExpiresAt?: string;
}

/**
 * Ensure the `api_key` column exists on the `tenants` table.
 */
export async function ensureTenantConfigColumns(db: any): Promise<void> {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE tenants ADD COLUMN IF NOT EXISTS api_key TEXT;`,
    );
  } catch (err) {
    console.error('[tenant-config] Failed to ensure api_key column:', err);
  }
}

/**
 * Update a tenant's API key (license key).
 */
export async function setTenantApiKey(db: any, slug: string, apiKey: string): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET api_key = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    apiKey, slug,
  );
}

/**
 * Update tenant metadata config (merge into existing JSONB).
 */
export async function updateTenantConfig(
  db: any,
  slug: string,
  config: Partial<TenantConfig>,
): Promise<void> {
  const rows = await db.$queryRawUnsafe(
    `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  ) as { metadata: Record<string, unknown> }[];

  const existing = rows[0]?.metadata ?? {};
  const merged = { ...existing, ...config };

  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(merged), slug,
  );
}

/**
 * Get the full config for a tenant, including api_key and parsed metadata.
 */
export async function getTenantConfig(
  db: any,
  slug: string,
): Promise<{ apiKey: string | null; config: TenantConfig } | null> {
  const rows = await db.$queryRawUnsafe(
    `SELECT api_key, metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  ) as { api_key: string | null; metadata: Record<string, unknown> }[];

  if (rows.length === 0) return null;

  return {
    apiKey: rows[0].api_key,
    config: (rows[0].metadata ?? {}) as TenantConfig,
  };
}
