/**
 * Tenant Registry Service — DB table lifecycle & migration.
 * Uses the same idempotent pattern as app-settings-service.
 */
import { PrismaClient } from '@/generated/prisma';
import { FUNCTIONAL_ROLES, DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/functional-roles';

const TENANTS_DDL = `
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'draft',
  vercel_project_id TEXT,
  app_url TEXT,
  db_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#eb3d28',
  secondary_color TEXT NOT NULL DEFAULT '#0af9fe',
  metadata JSONB DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export async function ensureTenantsTable(db: PrismaClient): Promise<void> {
  await db.$executeRawUnsafe(TENANTS_DDL);

  // Add any missing columns from schema evolution (idempotent)
  const migrationCols = [
    'ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT \'default\'',
    'ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT \'draft\'',
    'ADD COLUMN IF NOT EXISTS vercel_project_id TEXT',
    'ADD COLUMN IF NOT EXISTS app_url TEXT',
    'ADD COLUMN IF NOT EXISTS db_url TEXT',
    'ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT \'#eb3d28\'',
    'ADD COLUMN IF NOT EXISTS secondary_color TEXT NOT NULL DEFAULT \'#0af9fe\'',
    'ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'',
    'ADD COLUMN IF NOT EXISTS created_by TEXT',
  ];

  for (const col of migrationCols) {
    try {
      await db.$executeRawUnsafe(`ALTER TABLE tenants ${col}`);
    } catch {
      // Column may already exist — ignore
    }
  }
}

/**
 * Seed default platform-admin identity into a tenant Neon database.
 * Ensures DEFAULT_PLATFORM_ADMIN_EMAIL (from functional-roles.ts) is set in
 * app_config and seeds the roles table. See security-service.ts for user_accounts
 * backfill and group assignment. Legacy PERSONS usage minimized.
 */
export async function seedTenantAdminDefaults(
  tenantDbUrl: string | undefined,
  slug: string,
  adminEmail: string = DEFAULT_PLATFORM_ADMIN_EMAIL,
): Promise<{ success: boolean; adminEmail?: string; error?: string }> {
  if (!tenantDbUrl) {
    return { success: false, error: 'no-database-url' };
  }

  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: tenantDbUrl } },
  });

  try {
    await tenantPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        is_platform_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const fr of FUNCTIONAL_ROLES) {
      await tenantPrisma.$executeRawUnsafe(
        `INSERT INTO roles (id, code, name, is_platform_admin)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3)
         ON CONFLICT (code) DO UPDATE
           SET name = $2,
               is_platform_admin = $3;`,
        fr.code,
        fr.name,
        fr.isPlatformAdmin ?? false,
      );
    }

    await tenantPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS app_config (
        id TEXT PRIMARY KEY DEFAULT 'main',
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await tenantPrisma.$executeRawUnsafe(
      `INSERT INTO app_config (id, data)
       VALUES ('main', $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         data = COALESCE(app_config.data, '{}'::jsonb) || EXCLUDED.data,
         updated_at = CURRENT_TIMESTAMP;`,
      JSON.stringify({
        adminEmail,
        googleAuth: { dedicatedAdminEmail: adminEmail },
        lastAdminSeededAt: new Date().toISOString(),
        tenantSlug: slug,
      }),
    );

    await tenantPrisma.$disconnect();
    console.log(`[seedTenantAdminDefaults] Seeded adminEmail=${adminEmail} for tenant ${slug}`);
    return { success: true, adminEmail };
  } catch (error: unknown) {
    await tenantPrisma.$disconnect().catch(() => undefined);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[seedTenantAdminDefaults] Failed for ${slug}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}
