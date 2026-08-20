/**
 * Tenant User Service — manages tenant-scoped user accounts.
 * Handles the tenant_slug column on user_accounts table.
 */

/**
 * Ensure the `tenant_slug` column exists on the `user_accounts` table.
 * Run at the start of each tenant-users API request.
 */
export async function ensureTenantUserColumn(db: import('@/lib/db').RawDb): Promise<void> {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS tenant_slug TEXT NOT NULL DEFAULT 'tokenizmyapp';`,
    );
  } catch (err) {
    console.error('[tenant-user] Failed to ensure tenant_slug column:', err);
  }

  // Ensure index on tenant_slug for filtering
  try {
    await db.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_user_accounts_tenant_slug ON user_accounts (tenant_slug);`,
    );
  } catch {
    // Index already exists or not supported
  }
}

export interface TenantUserRow {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  tier: string;
  role_code: string | null;
  is_active: boolean;
  last_seen_at: Date | null;
  created_at: Date;
  tenant_slug: string;
}

export interface TenantUserView {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  tier: string;
  roleCode: string | null;
  isActive: boolean;
  groups: string[];
  permissions: string[];
  lastSeenAt: string | null;
  createdAt: string;
  tenantSlug: string;
}
