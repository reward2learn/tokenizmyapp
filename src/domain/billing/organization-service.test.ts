import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domain/tenant/tenant-service', () => ({
  ensureTenantsTable: vi.fn(async () => {}),
}));
vi.mock('@/lib/db-updated-at', () => ({
  ensureUpdatedAtDefaults: vi.fn(async () => {}),
}));

interface FakeOrg {
  id: string;
  slug: string;
  display_name: string;
  logo_url: string | null;
  owner_user_id: string | null;
  referred_by: string | null;
  created_at: Date;
  updated_at: Date;
}

interface FakeTenant {
  slug: string;
  display_name: string;
  organization_id: string | null;
}

/**
 * In-memory stand-in for `organizations` + the `tenants` registry.
 *
 * The backfill's whole job is a single UPDATE with a compound WHERE, so the
 * fake models that predicate exactly rather than approximating it — the bug it
 * exists to catch lived in that predicate.
 */

/** Columns the organizations table actually has. See ORGANIZATIONS_DDL. */
const ORGANIZATION_COLUMNS = new Set([
  'id',
  'slug',
  'display_name',
  'logo_url',
  'owner_user_id',
  'referred_by',
  'created_at',
  'updated_at',
]);

/**
 * Check an INSERT the way Postgres would, before the fake pretends it worked.
 *
 * This exists because the fake is positional: it reads args[0] as the id and
 * args[1] as the slug and never looks at the column list, so two real bugs sat
 * in front of it unnoticed — an INSERT naming `org_id` and `channel`, columns
 * that do not exist (42703), and a second one naming five columns against four
 * values. Both would have taken organization creation down in production and
 * both left every test green.
 *
 * A test double that accepts SQL the database would reject is not testing the
 * statement, only the arguments. These two checks are cheap and cover the
 * mistakes raw SQL actually invites.
 */
function assertInsertIsWellFormed(sql: string, args: unknown[], columns: Set<string>) {
  const match = /INSERT INTO \w+ \(([^)]*)\)\s*VALUES\s*\(([^)]*)\)/i.exec(sql);
  if (!match) throw new Error(`Could not parse INSERT: ${sql}`);

  const named = match[1].split(',').map((c) => c.trim());
  const values = match[2].split(',').map((v) => v.trim());

  const unknown = named.filter((c) => !columns.has(c));
  if (unknown.length > 0) {
    throw new Error(
      `column "${unknown[0]}" of relation "organizations" does not exist (42703)`,
    );
  }
  if (named.length !== values.length) {
    throw new Error(
      `INSERT has more target columns than expressions: ${named.length} columns, ${values.length} values (42601)`,
    );
  }

  // Every $n placeholder must be bound. Literals like CURRENT_TIMESTAMP do not
  // consume an argument.
  const placeholders = new Set(values.filter((v) => v.startsWith('$')));
  if (placeholders.size !== args.length) {
    throw new Error(
      `bind mismatch: ${placeholders.size} placeholder(s), ${args.length} argument(s)`,
    );
  }
}

function makeDb(tenants: FakeTenant[] = [], opts: { attributionFails?: boolean } = {}) {
  const orgs: FakeOrg[] = [];
  const attribution: { org_id: string; channel: string }[] = [];

  const db = {
    orgs,
    tenants,
    attribution,
    $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('INSERT INTO org_attribution')) {
        // Stands in for 42P10 — the table exists but nothing unique covers
        // org_id, so Postgres refuses the ON CONFLICT target.
        if (opts.attributionFails) {
          throw new Error('there is no unique or exclusion constraint matching the ON CONFLICT specification');
        }
        if (!attribution.some((a) => a.org_id === args[0])) {
          // Positional, matching the varargs the service passes: $1 org, $2 channel.
          attribution.push({ org_id: args[0] as string, channel: args[1] as string });
        }
        return 1;
      }
      if (sql.includes('INSERT INTO organizations')) {
        assertInsertIsWellFormed(sql, args, ORGANIZATION_COLUMNS);
        const slug = args[1] as string;
        if (orgs.some((o) => o.slug === slug)) return 0; // ON CONFLICT DO NOTHING
        orgs.push({
          id: args[0] as string,
          slug,
          display_name: args[2] as string,
          logo_url: null,
          owner_user_id: null,
          referred_by: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
        return 1;
      }
      if (sql.includes('UPDATE tenants') && sql.includes('SET organization_id')) {
        const orgId = args[0] as string;
        const known = new Set(orgs.map((o) => o.id));
        // Mirrors the real predicate: null OR pointing at a missing org.
        const reclaimsOrphans = sql.includes('NOT IN (SELECT id FROM organizations)');
        const targets = tenants.filter(
          (t) =>
            t.organization_id === null ||
            (reclaimsOrphans && t.organization_id !== null && !known.has(t.organization_id)),
        );
        for (const t of targets) t.organization_id = orgId;
        return targets.length;
      }
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('FROM organizations') && sql.includes('WHERE slug')) {
        return orgs.filter((o) => o.slug === args[0]).slice(0, 1);
      }
      if (sql.includes('FROM organizations') && sql.includes('WHERE id')) {
        return orgs.filter((o) => o.id === args[0]).slice(0, 1);
      }
      if (sql.includes('FROM organizations')) return orgs;
      if (sql.includes('FROM tenants') && sql.includes('organization_id IS NOT NULL')) {
        return tenants.filter((t) => t.organization_id !== null).map((t) => ({
          organization_id: t.organization_id,
          slug: t.slug,
          display_name: t.display_name,
        }));
      }
      return [];
    }),
  };

  return db as unknown as Parameters<
    typeof import('./organization-service').backfillDefaultOrganization
  >[0] & typeof db;
}

describe('backfillDefaultOrganization', () => {
  it('creates the default org and claims unassigned tenants', async () => {
    const service = await import('./organization-service');
    const db = makeDb([
      { slug: 'alpha', display_name: 'Alpha', organization_id: null },
      { slug: 'beta', display_name: 'Beta', organization_id: null },
    ]);

    const result = await service.backfillDefaultOrganization(db);

    expect(result.created).toBe(true);
    expect(result.tenantsAssigned).toBe(2);
    expect(db.tenants.every((t) => t.organization_id === result.orgId)).toBe(true);
  });

  it('reclaims a tenant pointing at an organization that no longer exists', async () => {
    // The bug this test exists for. The old predicate was `organization_id IS
    // NULL` alone, so a tenant whose org had been deleted was neither null nor
    // resolvable: resolveOrgForTenant INNER JOINs organizations and found
    // nothing, while the backfill saw a non-null value and skipped it. The
    // tenant was permanently unmapped and no repeat run could fix it.
    const service = await import('./organization-service');
    const db = makeDb([
      { slug: 'orphan', display_name: 'Orphan', organization_id: 'org_deleted_long_ago' },
    ]);

    const result = await service.backfillDefaultOrganization(db);

    expect(result.tenantsAssigned).toBe(1);
    expect(db.tenants[0].organization_id).toBe(result.orgId);
  });

  it('leaves correctly assigned tenants alone', async () => {
    // Reclaiming must not steal tenants from a real organization — moving a
    // tenant's billing owner is an explicit admin action, not a side effect of
    // loading a page.
    const service = await import('./organization-service');
    const db = makeDb();
    const first = await service.backfillDefaultOrganization(db);

    const other = await service.createOrganization(db, { displayName: 'Acme' });
    db.tenants.push({ slug: 'acme-app', display_name: 'Acme App', organization_id: other.id });

    const second = await service.backfillDefaultOrganization(db);

    expect(second.orgId).toBe(first.orgId);
    expect(second.tenantsAssigned).toBe(0);
    expect(db.tenants[0].organization_id).toBe(other.id);
  });

  it('is idempotent', async () => {
    const service = await import('./organization-service');
    const db = makeDb([{ slug: 'alpha', display_name: 'Alpha', organization_id: null }]);

    const first = await service.backfillDefaultOrganization(db);
    const second = await service.backfillDefaultOrganization(db);

    expect(second.orgId).toBe(first.orgId);
    expect(second.created).toBe(false);
    expect(second.tenantsAssigned).toBe(0);
    expect(db.orgs).toHaveLength(1);
  });
});

describe('listOrganizations', () => {
  it('reports which tenants each organization owns', async () => {
    // Without this the console could not distinguish an org that pays for
    // nothing from one whose tenants had been orphaned.
    const service = await import('./organization-service');
    const db = makeDb([
      { slug: 'alpha', display_name: 'Alpha', organization_id: null },
      { slug: 'beta', display_name: 'Beta', organization_id: null },
    ]);
    await service.backfillDefaultOrganization(db);

    const [defaultOrg] = await service.listOrganizations(db);

    expect(defaultOrg.slug).toBe(service.DEFAULT_ORG_SLUG);
    expect(defaultOrg.tenants?.map((t) => t.slug).sort()).toEqual(['alpha', 'beta']);
  });

  it('returns an empty list rather than undefined for an org with no tenants', async () => {
    const service = await import('./organization-service');
    const db = makeDb();
    await service.backfillDefaultOrganization(db);

    const [defaultOrg] = await service.listOrganizations(db);
    expect(defaultOrg.tenants).toEqual([]);
  });
});

describe('createOrganization attribution', () => {
  beforeEach(async () => {
    // The service converges its schema once per process. Each test brings a
    // fresh fake database, so the latch has to be dropped or only the first
    // test in the file would see the DDL run.
    const service = await import('./organization-service');
    service.resetOrganizationSchemaLatch();
  });

  it('records the channel the caller supplied', async () => {
    const service = await import('./organization-service');
    const db = makeDb();

    const org = await service.createOrganization(db, {
      displayName: 'Acme',
      channel: 'admin_console',
    });

    expect(db.attribution).toEqual([{ org_id: org.id, channel: 'admin_console' }]);
  });

  it('still creates the organization when attribution fails', async () => {
    // The failure this guards against is not losing an attribution row — it is
    // throwing *after* the organization and its owner are already committed,
    // with no transaction to roll them back. The caller would see a 500, the
    // organization would exist anyway, and retrying the same name collides on
    // the slug and answers 409: an organization the operator can neither reach
    // nor recreate.
    const service = await import('./organization-service');
    const db = makeDb([], { attributionFails: true });

    const org = await service.createOrganization(db, { displayName: 'Acme', channel: 'partner' });

    expect(org.slug).toBe('acme');
    expect(db.orgs).toHaveLength(1);
    expect(db.attribution).toEqual([]);
  });
});
