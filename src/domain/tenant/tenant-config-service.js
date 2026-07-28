/**
 * Tenant Config Service — manages tenant license key, configuration parameters,
 * and environment variable settings.
 */
/**
 * Ensure the `api_key` column exists on the `tenants` table.
 */
export async function ensureTenantConfigColumns(db) {
    try {
        await db.$executeRawUnsafe(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS api_key TEXT;`);
    }
    catch (err) {
        console.error('[tenant-config] Failed to ensure api_key column:', err);
    }
}
/**
 * Update a tenant's API key (license key).
 */
export async function setTenantApiKey(db, slug, apiKey) {
    await db.$executeRawUnsafe(`UPDATE tenants SET api_key = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`, apiKey, slug);
}
/**
 * Update tenant metadata config (merge into existing JSONB).
 */
export async function updateTenantConfig(db, slug, config) {
    const rows = await db.$queryRawUnsafe(`SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
    const existing = rows[0]?.metadata ?? {};
    const merged = { ...existing, ...config };
    await db.$executeRawUnsafe(`UPDATE tenants SET metadata = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`, JSON.stringify(merged), slug);
}
/**
 * Get the full config for a tenant, including api_key and parsed metadata.
 */
export async function getTenantConfig(db, slug) {
    const rows = await db.$queryRawUnsafe(`SELECT api_key, metadata FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
    if (rows.length === 0)
        return null;
    return {
        apiKey: rows[0].api_key,
        config: (rows[0].metadata ?? {}),
    };
}
