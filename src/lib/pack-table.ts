/**
 * Pack Table CRUD — core library
 *
 * Generic, schema-driven CRUD for App Pack tables (see
 * docs/workflows/pack-table-crud-spec.md). A table is a "pack table" if and
 * only if it carries the exact signature `applyPackSchema` creates:
 * `id` (TEXT PK), `tenant_slug`, `created_at`, `updated_at`.
 *
 * Security model (defense in depth):
 *  - identifiers validated against a strict regex AND double-quote escaped
 *  - system tables blocklisted even if they match the signature
 *  - every value passed as a parameterized query argument
 *  - all reads/writes scoped by `tenant_slug` (from NEXT_PUBLIC_TENANT_SLUG)
 *
 * The DB functions take a `RawDb` (structural subset of the Prisma client
 * returned by `createRawClient()` in `@/lib/db`) so the pure helpers here are
 * unit-testable without a live database.
 */

import { z } from 'zod';

// ── Identifier validation ──────────────────────────────

const IDENTIFIER_RE = /^[a-z_][a-z0-9_]{0,63}$/;

/** Table/column names must be lowercase snake identifiers, ≤ 64 chars. */
export function isValidIdentifier(name: string): boolean {
  return IDENTIFIER_RE.test(name);
}

/** Double-quote an identifier, escaping embedded quotes (defense in depth). */
export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

// ── System blocklist ───────────────────────────────────

export const SYSTEM_TABLES = [
  'app_pages',
  'page_sections',
  'navigation_items',
  'knowledge_snippets',
  'security_groups',
  'tenants',
  'users',
  'sessions',
  'workflow_runs',
  'jobs',
] as const;

/** System tables are never exposed, even if they match the pack signature. */
export function isBlocklistedTable(table: string): boolean {
  return (SYSTEM_TABLES as readonly string[]).includes(table);
}

// ── Pack signature ─────────────────────────────────────

export const BASE_COLUMNS = new Set<string>(['id', 'tenant_slug', 'created_at', 'updated_at']);

/** Columns the server manages; never accepted from the client. */
export const SERVER_MANAGED_COLUMNS = ['tenant_slug', 'created_at', 'updated_at'] as const;

/** Columns forbidden in a PATCH body (identity + server-managed). */
export const PATCH_FORBIDDEN_COLUMNS = ['id', ...SERVER_MANAGED_COLUMNS] as const;

export interface PackSignatureColumn {
  column_name: string;
  is_primary: boolean;
}

/**
 * A table is a pack table iff it has `id` (PK), `tenant_slug`, `created_at`
 * and `updated_at`. The caller queries information_schema.columns filtered to
 * those four names; this function validates the result set.
 */
export function hasPackSignature(cols: PackSignatureColumn[]): boolean {
  const names = new Set(cols.map((c) => c.column_name));
  const idCol = cols.find((c) => c.column_name === 'id');
  return (
    names.has('id') &&
    names.has('tenant_slug') &&
    names.has('created_at') &&
    names.has('updated_at') &&
    idCol?.is_primary === true
  );
}

// ── Type map + coercion (mirrors mapSqlType in app-pack-schema-apply) ──

/**
 * Normalize information_schema data_type to the pack type vocabulary.
 * Idempotent: accepts both raw pg types ("timestamp without time zone") and
 * already-normalized values ("TIMESTAMP"), so it is safe to call on
 * `PackColumnMeta.dataType`.
 */
export function normalizeSqlType(dataType: string): string {
  switch (dataType) {
    case 'text':
    case 'character varying':
    case 'character':
    case 'TEXT':
      return 'TEXT';
    case 'integer':
    case 'bigint':
    case 'smallint':
    case 'INTEGER':
      return 'INTEGER';
    case 'numeric':
    case 'decimal':
    case 'NUMERIC':
      return 'NUMERIC';
    case 'boolean':
    case 'BOOLEAN':
      return 'BOOLEAN';
    case 'timestamp without time zone':
    case 'timestamp with time zone':
    case 'TIMESTAMP':
      return 'TIMESTAMP';
    case 'date':
    case 'DATE':
      return 'DATE';
    case 'time without time zone':
    case 'time with time zone':
    case 'TIME':
      return 'TIME';
    case 'jsonb':
    case 'json':
    case 'JSONB':
      return 'JSONB';
    default:
      return 'TEXT';
  }
}

export class PackTableValidationError extends Error {}

/** Coerce a client value for a write (INSERT/UPDATE) — throws on invalid input. */
export function coerceValueForWrite(value: unknown, dataType: string): unknown {
  if (value === null || value === undefined) return value;
  switch (normalizeSqlType(dataType)) {
    case 'INTEGER': {
      if (typeof value === 'boolean') throw new PackTableValidationError('expected an integer');
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n)) throw new PackTableValidationError('expected an integer');
      return n;
    }
    case 'NUMERIC': {
      if (typeof value === 'boolean') throw new PackTableValidationError('expected a number');
      const n = Number(value);
      if (!Number.isFinite(n)) throw new PackTableValidationError('expected a number');
      return n;
    }
    case 'BOOLEAN': {
      if (value !== true && value !== false) throw new PackTableValidationError('expected true or false');
      return value;
    }
    case 'TIMESTAMP':
    case 'DATE': {
      if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
        throw new PackTableValidationError('expected an ISO date string');
      }
      return value;
    }
    case 'TIME': {
      if (typeof value !== 'string') throw new PackTableValidationError('expected a time string');
      return value;
    }
    case 'JSONB': {
      let parsed: unknown = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          throw new PackTableValidationError('expected valid JSON');
        }
      }
      try {
        return JSON.stringify(parsed);
      } catch {
        throw new PackTableValidationError('expected a JSON-serializable value');
      }
    }
    default: {
      // TEXT / enum / relation — pass scalars through as-is.
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
      throw new PackTableValidationError('expected a scalar value');
    }
  }
}

/** Coerce a pg row value for JSON responses (NUMERIC string → number, Date → ISO). */
export function coerceValueFromDb(value: unknown, dataType: string): unknown {
  switch (normalizeSqlType(dataType)) {
    case 'NUMERIC': {
      // pg/Prisma raw queries return NUMERIC as a primitive string, a boxed
      // String, or a Prisma Decimal object — Number() normalizes all of them
      // (Decimal exposes valueOf()). Non-numeric values pass through untouched.
      if (value === null || value === undefined || typeof value === 'number') return value;
      const n = Number(value);
      return Number.isFinite(n) ? n : value;
    }
    case 'TIMESTAMP':
    case 'DATE':
      return value instanceof Date ? value.toISOString() : value;
    default:
      return value; // JSONB arrives already parsed; booleans/ints are native
  }
}

/** Coerce every column of a raw pg row using the table's metadata. */
export function coerceRowFromDb(row: Record<string, unknown>, columns: PackColumnMeta[]): Record<string, unknown> {
  const byName = new Map(columns.map((c) => [c.name, c]));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const meta = byName.get(key);
    out[key] = meta ? coerceValueFromDb(value, meta.dataType) : value;
  }
  return out;
}

// ── Column metadata ────────────────────────────────────

export interface PackColumnMeta {
  name: string;
  dataType: string;
  isPrimary: boolean;
  required: boolean;
  unique: boolean;
  isBase: boolean;
  editable: boolean;
}

export interface PackColumnMetaRow {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary: boolean;
  is_unique: boolean;
}

export function mapColumnMetaRow(row: PackColumnMetaRow): PackColumnMeta {
  const isBase = BASE_COLUMNS.has(row.column_name);
  return {
    name: row.column_name,
    dataType: normalizeSqlType(row.data_type),
    isPrimary: row.is_primary,
    required: row.is_nullable === 'NO' && row.column_default === null,
    unique: row.is_unique,
    isBase,
    editable: !isBase,
  };
}

// ── DB access (raw Prisma client — ambient POSTGRES_URL) ──

export interface RawDb {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
}

const PK_OR_UNIQUE_EXISTS = (constraintType: 'PRIMARY KEY' | 'UNIQUE') => `
  EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = c.table_name
      AND tc.constraint_type = '${constraintType}'
      AND kcu.column_name = c.column_name
  )`;

/** True when the table exists in information_schema AND carries the pack signature. */
export async function checkPackTableSignature(db: RawDb, table: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<PackSignatureColumn[]>(
    `SELECT c.column_name, ${PK_OR_UNIQUE_EXISTS('PRIMARY KEY')} AS is_primary
     FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.table_name = $1
       AND c.column_name IN ('id', 'tenant_slug', 'created_at', 'updated_at');`,
    table,
  );
  return hasPackSignature(rows);
}

/** Fetch column metadata for a pack table from information_schema.columns. */
export async function fetchPackTableColumns(db: RawDb, table: string): Promise<PackColumnMeta[]> {
  const rows = await db.$queryRawUnsafe<PackColumnMetaRow[]>(
    `SELECT
       c.column_name,
       c.data_type,
       c.is_nullable,
       c.column_default,
       ${PK_OR_UNIQUE_EXISTS('PRIMARY KEY')} AS is_primary,
       ${PK_OR_UNIQUE_EXISTS('UNIQUE')} AS is_unique
     FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.table_name = $1
     ORDER BY c.ordinal_position;`,
    table,
  );
  return rows.map(mapColumnMetaRow);
}

// ── Query builders (identifiers quoted, values parameterized) ──

export interface PackListQuery {
  sql: string;
  values: unknown[];
}

export interface ListQueryOptions {
  table: string;
  tenantSlug: string;
  page: number;
  perPage: number;
  q?: string;
  sortBy: Array<[string, 'asc' | 'desc']>;
  columns: PackColumnMeta[];
}

/** Escape LIKE wildcards so user input matches literally. */
export function escapeLikePattern(q: string): string {
  return q.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function buildWhereClause(opts: {
  tenantSlug: string;
  q?: string;
  columns: PackColumnMeta[];
}): { where: string; values: unknown[] } {
  const values: unknown[] = [opts.tenantSlug];
  let where = '"tenant_slug" = $1';
  if (opts.q && opts.q.length > 0) {
    const textCols = opts.columns.filter((c) => normalizeSqlType(c.dataType) === 'TEXT');
    if (textCols.length > 0) {
      values.push(`%${escapeLikePattern(opts.q)}%`);
      where += ` AND (${textCols.map((c) => `${quoteIdent(c.name)} ILIKE $2`).join(' OR ')})`;
    }
  }
  return { where, values };
}

export function buildListQuery(opts: ListQueryOptions): PackListQuery {
  const { where, values } = buildWhereClause(opts);
  const orderBy =
    opts.sortBy.length > 0
      ? ` ORDER BY ${opts.sortBy.map(([col, dir]) => `${quoteIdent(col)} ${dir.toUpperCase()}`).join(', ')}`
      : '';
  values.push(opts.perPage, (opts.page - 1) * opts.perPage);
  return {
    sql: `SELECT * FROM ${quoteIdent(opts.table)} WHERE ${where}${orderBy} LIMIT $${values.length - 1} OFFSET $${values.length};`,
    values,
  };
}

export function buildCountQuery(opts: Omit<ListQueryOptions, 'page' | 'perPage' | 'sortBy'>): PackListQuery {
  const { where, values } = buildWhereClause(opts);
  return {
    sql: `SELECT COUNT(*)::int AS "count" FROM ${quoteIdent(opts.table)} WHERE ${where};`,
    values,
  };
}

export function buildInsertQuery(opts: {
  table: string;
  columns: string[];
  values: unknown[];
  jsonbColumns?: ReadonlySet<string>;
}): PackListQuery {
  const cols = opts.columns.map(quoteIdent).join(', ');
  const placeholders = opts.columns
    .map((c, i) => (opts.jsonbColumns?.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(', ');
  return {
    sql: `INSERT INTO ${quoteIdent(opts.table)} (${cols}) VALUES (${placeholders}) RETURNING *;`,
    values: opts.values,
  };
}

export function buildUpdateQuery(opts: {
  table: string;
  id: string;
  tenantSlug: string;
  columns: string[];
  values: unknown[];
  jsonbColumns?: ReadonlySet<string>;
}): PackListQuery {
  const sets = opts.columns.map((c, i) => {
    const placeholder = opts.jsonbColumns?.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`;
    return `${quoteIdent(c)} = ${placeholder}`;
  });
  const base = opts.values.length;
  return {
    sql: `UPDATE ${quoteIdent(opts.table)} SET ${sets.join(', ')}, "updated_at" = NOW() WHERE "id" = $${base + 1} AND "tenant_slug" = $${base + 2} RETURNING *;`,
    values: [...opts.values, opts.id, opts.tenantSlug],
  };
}

export function buildDeleteQuery(opts: { table: string; id: string; tenantSlug: string }): PackListQuery {
  return {
    sql: `DELETE FROM ${quoteIdent(opts.table)} WHERE "id" = $1 AND "tenant_slug" = $2 RETURNING "id";`,
    values: [opts.id, opts.tenantSlug],
  };
}

// ── Validation helpers ─────────────────────────────────

export function findUnknownColumns(data: Record<string, unknown>, columns: PackColumnMeta[]): string[] {
  const known = new Set(columns.map((c) => c.name));
  return Object.keys(data).filter((k) => !known.has(k));
}

export function findMissingRequiredColumns(data: Record<string, unknown>, columns: PackColumnMeta[]): string[] {
  return columns
    .filter((c) => c.required && !c.isBase)
    .filter((c) => data[c.name] === undefined || data[c.name] === null)
    .map((c) => c.name);
}

/** Client-supplied id: non-empty string ≤ 64 chars, else null. */
export function validateClientId(id: unknown): string | null {
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return null;
  return id;
}

/** Parse the sortBy query param (JSON array of [column, dir] pairs). */
export function parseSortBy(raw: string | null | undefined): Array<[string, 'asc' | 'desc']> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is [string, 'asc' | 'desc'] =>
          Array.isArray(e) && e.length === 2 && typeof e[0] === 'string' && (e[1] === 'asc' || e[1] === 'desc'),
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}

/** Drop sort pairs referencing unknown columns; cap at 3 pairs. */
export function validateSortPairs(
  pairs: Array<[string, 'asc' | 'desc']>,
  columns: PackColumnMeta[],
): Array<[string, 'asc' | 'desc']> {
  const known = new Set(columns.map((c) => c.name));
  return pairs.filter(([col]) => known.has(col)).slice(0, 3);
}

/** DoS guardrails: perPage ≤ 500, page ≤ 10000; defaults 50 / 1. */
export function clampPagination(
  page: number | undefined,
  perPage: number | undefined,
): { page: number; perPage: number } {
  const p = typeof page === 'number' && Number.isFinite(page) ? Math.floor(page) : 1;
  const pp = typeof perPage === 'number' && Number.isFinite(perPage) ? Math.floor(perPage) : 50;
  return {
    page: Math.min(10000, Math.max(1, p)),
    perPage: Math.min(500, Math.max(1, pp)),
  };
}

// ── Tenant slug ────────────────────────────────────────

/** Resolve the tenant slug from the environment (empty-safe). */
export function getTenantSlug(): string {
  return (process.env.NEXT_PUBLIC_TENANT_SLUG ?? '').trim();
}

// ── Zod schemas ────────────────────────────────────────

export const packTableListQuerySchema = z.object({
  page: z.coerce.number().int().optional(),
  perPage: z.coerce.number().int().optional(),
  q: z.string().max(200).optional(),
  sortBy: z.string().max(2000).optional(),
});

export const packTableWriteBodySchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

// ── Table resolution (shared by all routes) ────────────

export type TableResolution = { ok: true } | { ok: false; reason: 'invalid-identifier' | 'not-pack-table' };

/** Validate identifier → blocklist → pack signature. */
export async function resolvePackTable(db: RawDb, table: string): Promise<TableResolution> {
  if (!isValidIdentifier(table)) return { ok: false, reason: 'invalid-identifier' };
  if (isBlocklistedTable(table)) return { ok: false, reason: 'not-pack-table' };
  const isPack = await checkPackTableSignature(db, table);
  if (!isPack) return { ok: false, reason: 'not-pack-table' };
  return { ok: true };
}