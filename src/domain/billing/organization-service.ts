/**
 * Organization Service — the billing-owner entity that sits *above* tenants.
 *
 * Hierarchy: Organization → Tenant → Apps.
 * The Organization owns the subscription, credit balances and payment method;
 * a Tenant owns a Neon database and its deployed apps.
 *
 * ⚠️ Placement rule: every table here lives in the **platform root DB**, never in
 * a tenant's dedicated database. A tenant DB is a customer-controlled data plane;
 * billing state belongs to the control plane. This is deliberately the opposite of
 * the routing used by `admin/users` and `admin/groups`, which resolve to the
 * tenant's own DB — do not "fix" this by adding resolveDedicatedTenantDbUrl() here.
 *
 * Follows the established no-migration-files pattern: idempotent DDL applied at
 * runtime, same as ensureTenantsTable() / ensureSecurityTables().
 */
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';

export type OrgMemberRole = 'owner' | 'admin' | 'member' | 'billing';

export interface Organization {
  id: string;
  slug: string;
  displayName: string;
  logoUrl: string | null;
  ownerUserId: string | null;
  /** Affiliate attribution. Cheap to record now, impossible to backfill later. */
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Tenants this organization pays for.
   *
   * Populated by `listOrganizations`; absent on single-org reads where the
   * caller has not asked for it. The mapping is the whole point of the
   * Organization → Tenant → Apps hierarchy, and it was previously impossible to
   * see from the admin console: the only view of it was the reverse lookup for
   * one selected tenant, so an organization with no tenants and an organization
   * whose tenants were orphaned looked identical.
   */
  tenants?: { slug: string; displayName: string }[];
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgMemberRole;
  createdAt: string;
}

/** Slug of the org every pre-existing tenant is backfilled into. */
export const DEFAULT_ORG_SLUG = 'default';

type RawDb = ReturnType<typeof createRawClient>;

const ORGANIZATIONS_DDL = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  owner_user_id TEXT,
  referred_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const ORG_MEMBERS_DDL = `
CREATE TABLE IF NOT EXISTS org_members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT org_members_org_user_unique UNIQUE (org_id, user_id)
);`;

/**
 * Public, copyable organization id — `org_` + 24 lowercase base36 chars.
 *
 * Prefixed on purpose: support asks users to copy this, and an opaque UUID is
 * both unreadable over the phone and indistinguishable from every other id in
 * the system. Generated here rather than by a column DEFAULT because Prisma's
 * `@default(cuid())` is applied client-side and never becomes a SQL DEFAULT —
 * raw INSERTs must always supply `id` themselves.
 */
export function newOrgId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 24);
  return `org_${body}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'org';
}

/** Idempotent DDL for the organization layer. Safe to call on every request. */
export async function ensureOrganizationTables(db: RawDb): Promise<void> {
  await db.$executeRawUnsafe(ORGANIZATIONS_DDL);
  await db.$executeRawUnsafe(ORG_MEMBERS_DDL);

  // `prisma db push` creates these tables first, from the zmodel, where
  // `@updatedAt` yields NOT NULL with no default — so the DEFAULT in the DDL
  // above never lands and raw inserts fail with 23502. See db-updated-at.ts.
  const { ensureUpdatedAtDefaults } = await import('@/lib/db-updated-at');
  await ensureUpdatedAtDefaults(db, ['organizations']);

  // Columns added after the table first shipped.
  for (const col of ['ADD COLUMN IF NOT EXISTS referred_by TEXT', 'ADD COLUMN IF NOT EXISTS logo_url TEXT']) {
    try {
      await db.$executeRawUnsafe(`ALTER TABLE organizations ${col}`);
    } catch {
      // Already present — ignore, same as ensureTenantsTable().
    }
  }

  // The tenants registry gains the FK column. ensureTenantsTable() is called
  // first so the table exists even on a cold platform DB.
  await ensureTenantsTable(db);
  try {
    await db.$executeRawUnsafe(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS organization_id TEXT`);
  } catch {
    // Already present.
  }
  try {
    await db.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_tenants_organization ON tenants (organization_id)`,
    );
  } catch {
    // Index already present.
  }
}

function mapOrg(row: Record<string, unknown>): Organization {
  return {
    id: String(row.id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    logoUrl: row.logo_url == null ? null : String(row.logo_url),
    ownerUserId: row.owner_user_id == null ? null : String(row.owner_user_id),
    referredBy: row.referred_by == null ? null : String(row.referred_by),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export async function listOrganizations(db: RawDb): Promise<Organization[]> {
  await ensureOrganizationTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM organizations ORDER BY created_at ASC;`,
  )) as Record<string, unknown>[];

  // One extra query for the whole set rather than one per organization — there
  // are few organizations and this runs on every admin page load.
  const tenantRows = (await db.$queryRawUnsafe(
    `SELECT organization_id, slug, display_name
       FROM tenants
      WHERE organization_id IS NOT NULL
      ORDER BY slug ASC;`,
  )) as Record<string, unknown>[];

  const byOrg = new Map<string, { slug: string; displayName: string }[]>();
  for (const row of tenantRows) {
    const key = String(row.organization_id);
    const list = byOrg.get(key) ?? [];
    list.push({ slug: String(row.slug), displayName: String(row.display_name) });
    byOrg.set(key, list);
  }

  return rows.map((row) => ({ ...mapOrg(row), tenants: byOrg.get(String(row.id)) ?? [] }));
}

export async function getOrganization(db: RawDb, orgId: string): Promise<Organization | null> {
  await ensureOrganizationTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM organizations WHERE id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];
  return rows.length ? mapOrg(rows[0]) : null;
}

export interface CreateOrganizationInput {
  displayName: string;
  slug?: string;
  ownerUserId?: string | null;
  referredBy?: string | null;
  channel?: string;
}

export async function createOrganization(
  db: RawDb,
  input: CreateOrganizationInput,
): Promise<Organization> {
  await ensureOrganizationTables(db);
  const id = newOrgId();
  const slug = slugify(input.slug ?? input.displayName);

  await db.$executeRawUnsafe(
    `INSERT INTO organizations (id, org_id, slug, display_name, owner_user_id, referred_by, channel, updated_at)
     VALUES ($1, $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP);`,
    id,
    slug,
    input.displayName,
    input.ownerUserId ?? null,
    input.referredBy ?? null,
    input.channel ?? 'unknown',
  );

  if (input.ownerUserId) {
    await addOrgMember(db, id, input.ownerUserId, 'owner');
  }

  // Record attribution at signup — impossible to backfill later
  const attributionChannel = input.channel ?? 'unknown';
  await db.$executeRawUnsafe(
    `INSERT INTO org_attribution (id, org_id, channel, captured_at)
     VALUES (gen_random_uuid()::TEXT, $1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (org_id)
     DO UPDATE SET channel = EXCLUDED.channel, captured_at = NOW()`,
    [id, attributionChannel],
  );

  const created = await getOrganization(db, id);
  if (!created) throw new Error(`Organization ${id} vanished immediately after insert`);
  return created;
}

export interface UpdateOrganizationInput {
  displayName?: string;
  slug?: string;
  logoUrl?: string | null;
}

export async function updateOrganization(
  db: RawDb,
  orgId: string,
  input: UpdateOrganizationInput,
): Promise<Organization | null> {
  await ensureOrganizationTables(db);

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (input.displayName !== undefined) {
    sets.push(`display_name = $${i++}`);
    values.push(input.displayName);
  }
  if (input.slug !== undefined) {
    sets.push(`slug = $${i++}`);
    values.push(slugify(input.slug));
  }
  if (input.logoUrl !== undefined) {
    sets.push(`logo_url = $${i++}`);
    values.push(input.logoUrl);
  }
  if (sets.length === 0) return getOrganization(db, orgId);

  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(orgId);
  await db.$executeRawUnsafe(
    `UPDATE organizations SET ${sets.join(', ')} WHERE id = $${i};`,
    ...values,
  );
  return getOrganization(db, orgId);
}

export async function addOrgMember(
  db: RawDb,
  orgId: string,
  userId: string,
  role: OrgMemberRole = 'member',
): Promise<void> {
  await db.$executeRawUnsafe(
    `INSERT INTO org_members (id, org_id, user_id, role)
     VALUES (gen_random_uuid()::TEXT, $1, $2, $3)
     ON CONFLICT (org_id, user_id) DO UPDATE SET role = $3;`,
    orgId,
    userId,
    role,
  );
}

export async function listOrgMembers(db: RawDb, orgId: string): Promise<OrgMember[]> {
  await ensureOrganizationTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM org_members WHERE org_id = $1 ORDER BY created_at ASC;`,
    orgId,
  )) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    orgId: String(r.org_id),
    userId: String(r.user_id),
    role: String(r.role) as OrgMemberRole,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/**
 * Ensure the fallback organization exists and owns every unassigned tenant.
 *
 * Idempotent and safe to run repeatedly — it is called from the migrate route
 * and from resolveOrgForTenant() when a tenant has no org yet, so a platform
 * that has never seen this code still converges on first use.
 */
export async function backfillDefaultOrganization(
  db: RawDb,
): Promise<{ orgId: string; tenantsAssigned: number; created: boolean }> {
  await ensureOrganizationTables(db);

  const existing = (await db.$queryRawUnsafe(
    `SELECT * FROM organizations WHERE slug = $1 LIMIT 1;`,
    DEFAULT_ORG_SLUG,
  )) as Record<string, unknown>[];

  let orgId: string;
  let created = false;
  if (existing.length > 0) {
    orgId = String(existing[0].id);
  } else {
    orgId = newOrgId();
    created = true;
    await db.$executeRawUnsafe(
      `INSERT INTO organizations (id, org_id, slug, display_name, updated_at)
       VALUES ($1, $1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (slug) DO NOTHING;`,
      orgId,
      DEFAULT_ORG_SLUG,
      'Default Organization',
    );
    // Another request may have won the race — re-read rather than trusting the id.
    const reread = (await db.$queryRawUnsafe(
      `SELECT id FROM organizations WHERE slug = $1 LIMIT 1;`,
      DEFAULT_ORG_SLUG,
    )) as Record<string, unknown>[];
    if (reread.length > 0) orgId = String(reread[0].id);
  }

  // Two conditions, not one.
  //
  // `IS NULL` catches tenants that predate the organization layer. The second
  // clause catches tenants pointing at an organization that no longer exists —
  // which the original condition could never fix, because such a row is not
  // null and so was skipped on every subsequent run. Permanently orphaned, and
  // invisible: `resolveOrgForTenant` INNER JOINs organizations, so the tenant
  // reads as having no billing owner while the backfill reads it as already
  // assigned.
  //
  // Orphans are reachable because the column has two creation paths that
  // disagree: `prisma db push` builds it with a foreign key (so a deleted org
  // nulls the reference), while the idempotent DDL below adds a bare
  // `organization_id TEXT` with no constraint at all.
  const assigned = await db.$executeRawUnsafe(
    `UPDATE tenants
        SET organization_id = $1
      WHERE organization_id IS NULL
         OR organization_id NOT IN (SELECT id FROM organizations);`,
    orgId,
  );

  return { orgId, tenantsAssigned: Number(assigned ?? 0), created };
}

/**
 * Resolve the owning organization for a tenant slug.
 *
 * Mirrors resolveTenantDbUrl(): every billing read and write goes through this
 * so there is exactly one place that answers "who pays for this tenant?".
 * Self-heals by backfilling when a tenant predates the organization layer.
 */
export async function resolveOrgForTenant(
  tenantSlug: string,
  db: RawDb = createRawClient(),
): Promise<Organization | null> {
  await ensureOrganizationTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT o.* FROM tenants t
       JOIN organizations o ON o.id = t.organization_id
      WHERE t.slug = $1
      LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];

  if (rows.length > 0) return mapOrg(rows[0]);

  // Tenant exists but predates the org layer — converge it now.
  const tenantRows = (await db.$queryRawUnsafe(
    `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];
  if (tenantRows.length === 0) return null;

  const { orgId } = await backfillDefaultOrganization(db);
  return getOrganization(db, orgId);
}

/** Assign a tenant to an organization. Used by the admin org selector. */
export async function assignTenantToOrg(
  db: RawDb,
  tenantSlug: string,
  orgId: string,
): Promise<boolean> {
  await ensureOrganizationTables(db);
  const updated = await db.$executeRawUnsafe(
    `UPDATE tenants SET organization_id = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    orgId,
    tenantSlug,
  );
  return Number(updated ?? 0) > 0;
}
