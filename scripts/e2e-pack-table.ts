/**
 * E2E validation for the pack-table CRUD feature (spec: docs/workflows/pack-table-crud-spec.md).
 *
 * Phases:
 *   1. PIPELINE  — mock decompose → generate → compile → materializeAppPack → applyPackSchema
 *   2. DB STATE  — verify pack tables, columns, model CRUD pages/nav/sections (pack_table blocks)
 *   3. API       — live round-trip against the real route handlers (list/meta/create/patch/delete)
 *   4. EDGE      — auth 401, blocklist 404, unknown column 422, missing required 422,
 *                  server-managed 422, tenant scoping, NUMERIC→number, JSONB round-trip, sort, search
 *
 * Run:  bun run scripts/e2e-pack-table.ts   (from tokenizmyapp/)
 * Env:  E2E_DB_URL overrides the default disposable Postgres (postgres://test:test@localhost:55432/packtest)
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

// ── 0. Environment (must be set before importing modules that read env at call time) ──
const TEST_DB_URL = process.env.E2E_DB_URL ?? 'postgres://test:test@localhost:55432/packtest';
const TENANT_SLUG = 'test-tenant';

function parseEnv(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function loadEnvLocal(): Record<string, string> {
  // tokenizmyapp/.env.local first, then root .env.local (the key lives there)
  for (const rel of ['../.env.local', '../../.env.local']) {
    try {
      const raw = readFileSync(new URL(rel, import.meta.url), 'utf8');
      const parsed = parseEnv(raw);
      if (parsed.ENCRYPTION_KEY) return parsed;
    } catch {
      /* try next */
    }
  }
  return {};
}
const envLocal = loadEnvLocal();
process.env.POSTGRES_URL = TEST_DB_URL;
process.env.DATABASE_URL = TEST_DB_URL;
process.env.NEXT_PUBLIC_TENANT_SLUG = TENANT_SLUG;
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || envLocal.ENCRYPTION_KEY || '';
if (!process.env.ENCRYPTION_KEY) {
  console.error('ENCRYPTION_KEY missing from .env.local — cannot mint session JWT');
  process.exit(1);
}

// ── 1. Imports (after env) ──
import { mockDecomposePack, mockGenerateAppDefinition } from '../src/domain/app-pack/app-pack-generator';
import { compileAppArtifacts } from '../src/domain/app-pack/app-pack-compiler';
import { materializeAppPack } from '../src/domain/app-pack/app-pack-materializer';
import { applyPackSchema } from '../src/domain/app-pack/app-pack-schema-apply';
import { signSession } from '../src/lib/auth/jwt';
import { GET as listGET, POST as createPOST } from '../src/app/api/pack-tables/[table]/route';
import { GET as metaGET } from '../src/app/api/pack-tables/[table]/meta/route';
import { PATCH as rowPATCH, DELETE as rowDELETE } from '../src/app/api/pack-tables/[table]/[id]/route';

// ── Assertion helpers ──
let passes = 0;
let failures = 0;
function check(name: string, cond: boolean, detail?: unknown): void {
  if (cond) {
    passes++;
    console.log(`  ✅ ${name}`);
  } else {
    failures++;
    console.error(`  ❌ ${name}${detail !== undefined ? ` — ${JSON.stringify(detail)}` : ''}`);
  }
}

// ── Route-call helper (calls the real Next.js route handlers directly) ──
type RouteFn = (request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<{ status: number; json(): Promise<unknown> }>;
async function call(
  fn: RouteFn,
  url: string,
  init?: RequestInit,
  params?: Record<string, string>,
): Promise<{ status: number; body: any }> {
  const res = await fn(new Request(url, init), { params: Promise.resolve(params ?? {}) });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, body };
}

async function main(): Promise<void> {
  console.log(`\n═══ PACK-TABLE E2E — DB: ${TEST_DB_URL} — tenant: ${TENANT_SLUG} ═══\n`);

  // ── Phase 1: pipeline (mock mode, real domain code) ──
  console.log('── Phase 1: App Pack pipeline (mock) ──');
  const client = new Client({ connectionString: TEST_DB_URL });
  await client.connect();

  const decomposition = mockDecomposePack();
  const definitions = decomposition.apps.map((b) => mockGenerateAppDefinition(b));
  const artifacts = definitions.map((d) => compileAppArtifacts(d));

  const counts = await materializeAppPack(client, {
    packId: 'ops-department-pack',
    tenantSlug: TENANT_SLUG,
    decomposition,
    apps: artifacts,
    definitions,
  });
  const schemaResult = await applyPackSchema(client, definitions);

  check('materialize: 4 apps', counts.apps === 4, counts);
  check('materialize: pages > 0', counts.pages > 0, counts);
  check('materialize: nav items > 0', counts.nav > 0, counts);
  check('schema apply: applied=true', schemaResult.applied === true, schemaResult);
  check('schema apply: zmodel artifact non-empty', typeof schemaResult.zmodel === 'string' && schemaResult.zmodel.length > 100);

  // ── Phase 2: DB state ──
  console.log('\n── Phase 2: DB state ──');
  const EXPECTED_TABLES = ['employees', 'daily_sales', 'financial_records', 'department_kpis'];
  for (const t of EXPECTED_TABLES) {
    const r = await client.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position;`,
      [t],
    );
    const cols = r.rows.map((c) => c.column_name);
    check(`table ${t} exists with pack signature`, r.rows.length >= 7, cols);
    check(`table ${t} has id/tenant_slug/created_at/updated_at`, ['id', 'tenant_slug', 'created_at', 'updated_at'].every((c) => cols.includes(c)), cols);
  }

  // Model CRUD page + pack_table section + nav (compiler integration)
  const pageR = await client.query(
    `SELECT p.slug, p.title, s.block_type, s.config
     FROM app_pages p JOIN page_sections s ON s.page_id = p.id
     WHERE p.slug = 'ops-department-pack-hr-employees';`,
  );
  check('model page materialized (hr/employees)', pageR.rows.length === 1, pageR.rows);
  check(
    'model page section is pack_table with config.table=employees',
    pageR.rows.length === 1 &&
      pageR.rows[0].block_type === 'pack_table' &&
      pageR.rows[0].config?.table === 'employees',
    pageR.rows[0],
  );
  const navR = await client.query(
    `SELECT id, path, required_groups, is_dynamic FROM navigation_items WHERE id = 'nav_ops-department-pack_hr_model_employees';`,
  );
  check(
    'model nav item materialized with group + path',
    navR.rows.length === 1 &&
      navR.rows[0].path === '/ops-department-pack-hr-employees' &&
      navR.rows[0].required_groups === 'app_hr' &&
      navR.rows[0].is_dynamic === true,
    navR.rows[0],
  );

  // ── Phase 3: API round-trip ──
  console.log('\n── Phase 3: API round-trip ──');
  const token = await signSession({ sub: 'e2e-admin', tier: 'pin', platformAdmin: true });
  const cookie = { cookie: `redruby.session=${token}` };
  const base = 'http://localhost/api/pack-tables';

  // meta
  const meta = await call(metaGET, `${base}/employees`, { headers: cookie }, { table: 'employees' });
  check('meta: 200', meta.status === 200, meta.status);
  const metaCols = meta.body?.data?.columns ?? [];
  check('meta: has name/status/notes', ['name', 'status', 'notes'].every((c) => metaCols.some((col: any) => col.name === c)), metaCols.map((c: any) => c.name));
  check('meta: writableColumns excludes base', (meta.body?.data?.writableColumns ?? []).every((c: string) => !['id', 'tenant_slug', 'created_at', 'updated_at'].includes(c)), meta.body?.data?.writableColumns);

  // list (empty)
  const emptyList = await call(listGET, `${base}/employees?page=1&perPage=50`, { headers: cookie }, { table: 'employees' });
  check('list: 200 + totalRows 0', emptyList.status === 200 && emptyList.body?.data?.totalRows === 0, emptyList.body);

  // create
  const created = await call(
    createPOST,
    `${base}/employees`,
    { method: 'POST', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { name: 'Budi', status: 'active', notes: 'first record' } }) },
    { table: 'employees' },
  );
  const createdRow = created.body?.data;
  check('create: 200', created.status === 200, created.status);
  check('create: id + tenant_slug + created_at set', !!createdRow?.id && createdRow?.tenant_slug === TENANT_SLUG && !!createdRow?.created_at, createdRow);
  const createdId: string = createdRow?.id;

  // validation errors
  const unknownCol = await call(
    createPOST,
    `${base}/employees`,
    { method: 'POST', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { name: 'X', hacker: true } }) },
    { table: 'employees' },
  );
  check('create: unknown column → 422', unknownCol.status === 422 && /Unknown columns: hacker/.test(unknownCol.body?.error ?? ''), unknownCol);

  const missingReq = await call(
    createPOST,
    `${base}/employees`,
    { method: 'POST', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { status: 'active' } }) },
    { table: 'employees' },
  );
  check('create: missing required → 422', missingReq.status === 422 && /Missing required columns: name/.test(missingReq.body?.error ?? ''), missingReq);

  const managed = await call(
    createPOST,
    `${base}/employees`,
    { method: 'POST', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { name: 'X', tenant_slug: 'evil' } }) },
    { table: 'employees' },
  );
  check('create: server-managed column → 422', managed.status === 422 && /Server-managed/.test(managed.body?.error ?? ''), managed);

  // list after create
  const list1 = await call(listGET, `${base}/employees?page=1&perPage=50`, { headers: cookie }, { table: 'employees' });
  check('list: totalRows 1 after create', list1.status === 200 && list1.body?.data?.totalRows === 1, list1.body?.data);

  // patch
  const patched = await call(
    rowPATCH,
    `${base}/employees/${createdId}`,
    { method: 'PATCH', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { notes: 'updated notes' } }) },
    { table: 'employees', id: createdId },
  );
  check('patch: 200 + notes updated', patched.status === 200 && patched.body?.data?.notes === 'updated notes', patched.body);

  const patchId = await call(
    rowPATCH,
    `${base}/employees/${createdId}`,
    { method: 'PATCH', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { id: 'new-id' } }) },
    { table: 'employees', id: createdId },
  );
  check('patch: id in body → 422', patchId.status === 422, patchId);

  // delete + double delete
  const del = await call(rowDELETE, `${base}/employees/${createdId}`, { method: 'DELETE', headers: cookie }, { table: 'employees', id: createdId });
  check('delete: 200 {deleted:true}', del.status === 200 && del.body?.data?.deleted === true, del.body);
  const del2 = await call(rowDELETE, `${base}/employees/${createdId}`, { method: 'DELETE', headers: cookie }, { table: 'employees', id: createdId });
  check('delete: second → 404', del2.status === 404, del2);

  // ── Phase 4: edge cases ──
  console.log('\n── Phase 4: edge cases ──');

  // auth
  const unauth = await call(listGET, `${base}/employees?page=1`, {}, { table: 'employees' });
  check('auth: no session → 401', unauth.status === 401, unauth.status);

  // blocklist + nonexistent
  const blocklisted = await call(metaGET, `${base}/navigation_items`, { headers: cookie }, { table: 'navigation_items' });
  check('blocklist: navigation_items → 404', blocklisted.status === 404, blocklisted);
  const nonexistent = await call(metaGET, `${base}/no_such_table`, { headers: cookie }, { table: 'no_such_table' });
  check('nonexistent table → 404', nonexistent.status === 404, nonexistent);
  const badIdent = await call(metaGET, `${base}/Orders;DROP`, { headers: cookie }, { table: 'Orders;DROP' });
  check('invalid identifier → 400', badIdent.status === 400, badIdent);

  // tenant scoping: insert a foreign-tenant row directly, list must not see it
  await client.query(
    `INSERT INTO employees (id, tenant_slug, name, status, notes) VALUES ('foreign-1', 'other-tenant', 'Foreign', 'active', 'x');`,
  );
  const scoped = await call(listGET, `${base}/employees?page=1&perPage=50`, { headers: cookie }, { table: 'employees' });
  check('tenant scoping: foreign row invisible', scoped.status === 200 && scoped.body?.data?.totalRows === 0, scoped.body?.data);

  // NUMERIC + JSONB coercion (columns added manually — mock models have no numeric/json fields)
  await client.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary NUMERIC(14,2);`);
  await client.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS meta JSONB;`);
  const typed = await call(
    createPOST,
    `${base}/employees`,
    { method: 'POST', headers: { ...cookie, 'content-type': 'application/json' }, body: JSON.stringify({ data: { name: 'Coerce', status: 'pending', salary: 1234.56, meta: { a: 1, b: 'x' } } }) },
    { table: 'employees' },
  );
  const typedRow = typed.body?.data;
  check('typed create: 200', typed.status === 200, typed.status);
  check('NUMERIC: salary returned as number 1234.56', typeof typedRow?.salary === 'number' && typedRow?.salary === 1234.56, typedRow?.salary);
  check('JSONB: meta returned as object', typeof typedRow?.meta === 'object' && typedRow?.meta?.a === 1 && typedRow?.meta?.b === 'x', typedRow?.meta);

  // sort + search
  await client.query(
    `INSERT INTO employees (id, tenant_slug, name, status, notes) VALUES ('sort-1', $1, 'Alpha', 'active', 'zzz'), ('sort-2', $1, 'Beta', 'active', 'aaa');`,
    [TENANT_SLUG],
  );
  const sorted = await call(
    listGET,
    `${base}/employees?page=1&perPage=50&sortBy=${encodeURIComponent(JSON.stringify([['name', 'desc']]))}`,
    { headers: cookie },
    { table: 'employees' },
  );
  const names = (sorted.body?.data?.rows ?? []).map((r: any) => r.name);
  check('sort: name desc → Coerce, Beta, Alpha', sorted.status === 200 && names[0] === 'Coerce' && names[1] === 'Beta' && names[2] === 'Alpha', names);

  const searched = await call(listGET, `${base}/employees?page=1&perPage=50&q=zzz`, { headers: cookie }, { table: 'employees' });
  check('search: q=zzz → 1 row (Alpha)', searched.status === 200 && searched.body?.data?.totalRows === 1 && searched.body?.data?.rows?.[0]?.name === 'Alpha', searched.body?.data);

  await client.end();

  // ── Report ──
  console.log(`\n═══ RESULT: ${passes} passed, ${failures} failed ═══\n`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error('E2E crashed:', err);
  process.exit(1);
});
