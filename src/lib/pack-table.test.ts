/**
 * Pack Table CRUD — core library tests (spec §8).
 *
 * Pure-function tests only — no live DB required. DB functions are exercised
 * with a minimal mock RawDb.
 */
import { describe, expect, it } from 'vitest';
import {
  buildCountQuery,
  buildDeleteQuery,
  buildInsertQuery,
  buildListQuery,
  buildUpdateQuery,
  checkPackTableSignature,
  clampPagination,
  coerceValueForWrite,
  coerceValueFromDb,
  escapeLikePattern,
  fetchPackTableColumns,
  findMissingRequiredColumns,
  findUnknownColumns,
  hasPackSignature,
  isBlocklistedTable,
  isValidIdentifier,
  mapColumnMetaRow,
  PackTableValidationError,
  parseSortBy,
  resolvePackTable,
  validateClientId,
  validateSortPairs,
  type PackColumnMeta,
  type RawDb,
} from '@/lib/pack-table';

function textCol(name: string): PackColumnMeta {
  return { name, dataType: 'TEXT', isPrimary: false, required: false, unique: false, isBase: false, editable: true };
}

function intCol(name: string): PackColumnMeta {
  return { name, dataType: 'INTEGER', isPrimary: false, required: false, unique: false, isBase: false, editable: true };
}

// ── Identifier regex ───────────────────────────────────

describe('isValidIdentifier', () => {
  it('accepts valid identifiers', () => {
    expect(isValidIdentifier('reservations')).toBe(true);
    expect(isValidIdentifier('order_items_2')).toBe(true);
    expect(isValidIdentifier('_private')).toBe(true);
    expect(isValidIdentifier('a')).toBe(true);
    expect(isValidIdentifier('a'.repeat(64))).toBe(true);
  });

  it('rejects invalid identifiers', () => {
    expect(isValidIdentifier('Orders')).toBe(false);
    expect(isValidIdentifier('a-b')).toBe(false);
    expect(isValidIdentifier('"tbl"')).toBe(false);
    expect(isValidIdentifier('a; DROP')).toBe(false);
    expect(isValidIdentifier('')).toBe(false);
    expect(isValidIdentifier('1abc')).toBe(false);
    expect(isValidIdentifier('a b')).toBe(false);
    expect(isValidIdentifier('a'.repeat(65))).toBe(false);
  });
});

// ── System blocklist ───────────────────────────────────

describe('isBlocklistedTable', () => {
  it('rejects every system table', () => {
    for (const t of [
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
    ]) {
      expect(isBlocklistedTable(t)).toBe(true);
    }
  });

  it('accepts pack tables', () => {
    expect(isBlocklistedTable('reservations')).toBe(false);
    expect(isBlocklistedTable('menu_items')).toBe(false);
  });
});

// ── Pack signature ─────────────────────────────────────

describe('hasPackSignature', () => {
  const packCols = [
    { column_name: 'id', is_primary: true },
    { column_name: 'tenant_slug', is_primary: false },
    { column_name: 'created_at', is_primary: false },
    { column_name: 'updated_at', is_primary: false },
  ];

  it('accepts the exact pack column set', () => {
    expect(hasPackSignature(packCols)).toBe(true);
  });

  it('rejects when a base column is missing', () => {
    expect(hasPackSignature(packCols.filter((c) => c.column_name !== 'tenant_slug'))).toBe(false);
    expect(hasPackSignature(packCols.filter((c) => c.column_name !== 'updated_at'))).toBe(false);
    expect(hasPackSignature(packCols.filter((c) => c.column_name !== 'id'))).toBe(false);
  });

  it('rejects when id is not the primary key', () => {
    const cols = packCols.map((c) => (c.column_name === 'id' ? { ...c, is_primary: false } : c));
    expect(hasPackSignature(cols)).toBe(false);
  });

  it('rejects an empty result set', () => {
    expect(hasPackSignature([])).toBe(false);
  });
});

// ── Coercion ───────────────────────────────────────────

describe('coerceValueFromDb', () => {
  it('parses NUMERIC strings to numbers (pg returns NUMERIC as string)', () => {
    expect(coerceValueFromDb('12.50', 'numeric')).toBe(12.5);
    expect(coerceValueFromDb('0', 'numeric')).toBe(0);
    expect(coerceValueFromDb('1234.56', 'numeric')).toBe(1234.56);
  });

  it('passes JSONB parsed objects through (pg returns parsed object on read)', () => {
    expect(coerceValueFromDb({ a: 1, b: [2, 3] }, 'jsonb')).toEqual({ a: 1, b: [2, 3] });
  });

  it('converts NUMERIC primitive strings to numbers', () => {
    expect(coerceValueFromDb('1234.56', 'numeric')).toBe(1234.56);
  });

  it('converts NUMERIC boxed String objects to numbers (pg/Prisma raw returns boxed)', () => {
    expect(coerceValueFromDb(new String('1234.56'), 'numeric')).toBe(1234.56);
  });

  it('converts NUMERIC Prisma Decimal objects to numbers (valueOf-based)', () => {
    const decimal = { valueOf: () => 1234.56, toString: () => '1234.56' };
    expect(coerceValueFromDb(decimal, 'numeric')).toBe(1234.56);
  });

  it('converts pg Date objects to ISO strings', () => {
    const d = new Date('2026-08-13T00:00:00.000Z');
    expect(coerceValueFromDb(d, 'timestamp without time zone')).toBe('2026-08-13T00:00:00.000Z');
    expect(coerceValueFromDb(d, 'date')).toBe('2026-08-13T00:00:00.000Z');
  });

  it('passes booleans and integers through natively', () => {
    expect(coerceValueFromDb(true, 'boolean')).toBe(true);
    expect(coerceValueFromDb(42, 'integer')).toBe(42);
  });
});

describe('coerceValueForWrite', () => {
  it('parses NUMERIC strings to numbers', () => {
    expect(coerceValueForWrite('12.50', 'numeric')).toBe(12.5);
    expect(coerceValueForWrite(12.5, 'numeric')).toBe(12.5);
  });

  it('JSONB round-trip: stringifies objects on write', () => {
    expect(coerceValueForWrite({ a: 1, b: [2, 3] }, 'jsonb')).toBe('{"a":1,"b":[2,3]}');
    // Pre-serialized JSON strings are parsed then re-stringified (normalized).
    expect(coerceValueForWrite('{"a":1}', 'jsonb')).toBe('{"a":1}');
    expect(() => coerceValueForWrite('{not json}', 'jsonb')).toThrow(PackTableValidationError);
  });

  it('is strict about booleans', () => {
    expect(coerceValueForWrite(true, 'boolean')).toBe(true);
    expect(coerceValueForWrite(false, 'boolean')).toBe(false);
    expect(() => coerceValueForWrite('true', 'boolean')).toThrow(PackTableValidationError);
    expect(() => coerceValueForWrite(1, 'boolean')).toThrow(PackTableValidationError);
    expect(() => coerceValueForWrite('yes', 'boolean')).toThrow(PackTableValidationError);
  });

  it('validates integers (rejects non-finite and non-integers)', () => {
    expect(coerceValueForWrite('42', 'integer')).toBe(42);
    expect(coerceValueForWrite(7, 'integer')).toBe(7);
    expect(() => coerceValueForWrite('abc', 'integer')).toThrow(PackTableValidationError);
    expect(() => coerceValueForWrite(3.5, 'integer')).toThrow(PackTableValidationError);
    expect(() => coerceValueForWrite(true, 'integer')).toThrow(PackTableValidationError);
  });

  it('validates date/datetime strings with Date.parse', () => {
    expect(coerceValueForWrite('2026-08-13T00:00:00.000Z', 'timestamp without time zone')).toBe(
      '2026-08-13T00:00:00.000Z',
    );
    expect(coerceValueForWrite('2026-08-13', 'date')).toBe('2026-08-13');
    expect(() => coerceValueForWrite('not-a-date', 'timestamp without time zone')).toThrow(PackTableValidationError);
    expect(() => coerceValueForWrite(12345, 'date')).toThrow(PackTableValidationError);
  });

  it('passes null through for nullable columns', () => {
    expect(coerceValueForWrite(null, 'text')).toBeNull();
    expect(coerceValueForWrite(null, 'jsonb')).toBeNull();
  });
});

// ── Sort pair validation ───────────────────────────────

describe('validateSortPairs', () => {
  const columns: PackColumnMeta[] = [
    { name: 'id', dataType: 'TEXT', isPrimary: true, required: true, unique: false, isBase: true, editable: false },
    { name: 'guest', dataType: 'TEXT', isPrimary: false, required: false, unique: false, isBase: false, editable: true },
    { name: 'party_size', dataType: 'INTEGER', isPrimary: false, required: false, unique: false, isBase: false, editable: true },
  ];

  it('keeps valid pairs', () => {
    expect(validateSortPairs([['guest', 'asc']], columns)).toEqual([['guest', 'asc']]);
  });

  it('drops pairs referencing unknown columns', () => {
    expect(validateSortPairs([['guest', 'asc'], ['nope', 'desc']], columns)).toEqual([['guest', 'asc']]);
    expect(validateSortPairs([['nope', 'desc']], columns)).toEqual([]);
  });

  it('caps at 3 pairs', () => {
    const pairs: Array<[string, 'asc' | 'desc']> = [
      ['guest', 'asc'],
      ['party_size', 'desc'],
      ['guest', 'desc'],
      ['party_size', 'asc'],
    ];
    expect(validateSortPairs(pairs, columns)).toHaveLength(3);
  });

  it('parseSortBy tolerates malformed input', () => {
    expect(parseSortBy(null)).toEqual([]);
    expect(parseSortBy(undefined)).toEqual([]);
    expect(parseSortBy('not json')).toEqual([]);
    expect(parseSortBy('{"a":1}')).toEqual([]);
    expect(parseSortBy('[["guest","asc"]]')).toEqual([['guest', 'asc']]);
    expect(parseSortBy('[["guest","sideways"]]')).toEqual([]);
  });
});

// ── ILIKE escaping ─────────────────────────────────────

describe('escapeLikePattern', () => {
  it('escapes %, _ and backslash', () => {
    expect(escapeLikePattern('50%_off\\x')).toBe('50\\%\\_off\\\\x');
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('a_b')).toBe('a\\_b');
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
  });

  it('leaves plain text untouched', () => {
    expect(escapeLikePattern('john')).toBe('john');
  });
});

// ── Pagination caps ────────────────────────────────────

describe('clampPagination', () => {
  it('caps perPage at 500', () => {
    expect(clampPagination(1, 600).perPage).toBe(500);
    expect(clampPagination(1, 500).perPage).toBe(500);
    expect(clampPagination(1, 9999).perPage).toBe(500);
  });

  it('caps page at 10000 and floors at 1', () => {
    expect(clampPagination(99999, 50).page).toBe(10000);
    expect(clampPagination(0, 50).page).toBe(1);
    expect(clampPagination(-5, 50).page).toBe(1);
  });

  it('defaults missing values to page 1 / perPage 50', () => {
    expect(clampPagination(undefined, undefined)).toEqual({ page: 1, perPage: 50 });
  });
});

// ── Query builders ─────────────────────────────────────

describe('buildListQuery', () => {
  const columns = [textCol('guest'), intCol('party_size')];

  it('parameterizes tenant filter and pagination', () => {
    const q = buildListQuery({ table: 'reservations', tenantSlug: 'redruby', page: 2, perPage: 25, sortBy: [], columns });
    expect(q.sql).toBe('SELECT * FROM "reservations" WHERE "tenant_slug" = $1 LIMIT $2 OFFSET $3;');
    expect(q.values).toEqual(['redruby', 25, 25]);
  });

  it('quotes identifiers and emits validated ORDER BY', () => {
    const q = buildListQuery({
      table: 'reservations',
      tenantSlug: 'redruby',
      page: 1,
      perPage: 50,
      sortBy: [['guest', 'desc'], ['party_size', 'asc']],
      columns,
    });
    expect(q.sql).toContain('ORDER BY "guest" DESC, "party_size" ASC');
  });

  it('builds an ILIKE search with escaped pattern across TEXT columns', () => {
    const q = buildListQuery({
      table: 'reservations',
      tenantSlug: 'redruby',
      page: 1,
      perPage: 50,
      q: '50%_off',
      sortBy: [],
      columns: [textCol('guest'), textCol('notes')],
    });
    expect(q.sql).toContain('AND ("guest" ILIKE $2 OR "notes" ILIKE $2)');
    expect(q.values).toContain('%50\\%\\_off%');
  });

  it('skips ILIKE when there are no TEXT columns', () => {
    const q = buildListQuery({
      table: 'reservations',
      tenantSlug: 'redruby',
      page: 1,
      perPage: 50,
      q: 'x',
      sortBy: [],
      columns: [intCol('party_size')],
    });
    expect(q.sql).not.toContain('ILIKE');
    expect(q.values).toEqual(['redruby', 50, 0]);
  });
});

describe('buildCountQuery', () => {
  it('builds a tenant-scoped count without pagination', () => {
    const q = buildCountQuery({ table: 'reservations', tenantSlug: 'redruby', columns: [textCol('guest')] });
    expect(q.sql).toBe('SELECT COUNT(*)::int AS "count" FROM "reservations" WHERE "tenant_slug" = $1;');
    expect(q.values).toEqual(['redruby']);
  });
});

describe('buildInsertQuery', () => {
  it('parameterizes columns and values with RETURNING *', () => {
    const q = buildInsertQuery({
      table: 'reservations',
      columns: ['id', 'tenant_slug', 'guest'],
      values: ['abc', 'redruby', 'John'],
    });
    expect(q.sql).toBe('INSERT INTO "reservations" ("id", "tenant_slug", "guest") VALUES ($1, $2, $3) RETURNING *;');
    expect(q.values).toEqual(['abc', 'redruby', 'John']);
  });

  it('casts jsonb columns with ::jsonb while leaving other columns plain', () => {
    const q = buildInsertQuery({
      table: 'reservations',
      columns: ['id', 'tenant_slug', 'guest', 'meta'],
      values: ['abc', 'redruby', 'John', '{"a":1}'],
      jsonbColumns: new Set(['meta']),
    });
    expect(q.sql).toBe(
      'INSERT INTO "reservations" ("id", "tenant_slug", "guest", "meta") VALUES ($1, $2, $3, $4::jsonb) RETURNING *;',
    );
    expect(q.values).toEqual(['abc', 'redruby', 'John', '{"a":1}']);
  });

  it('emits plain placeholders when jsonbColumns is omitted', () => {
    const q = buildInsertQuery({
      table: 'reservations',
      columns: ['id', 'tenant_slug', 'meta'],
      values: ['abc', 'redruby', '{"a":1}'],
    });
    expect(q.sql).toBe('INSERT INTO "reservations" ("id", "tenant_slug", "meta") VALUES ($1, $2, $3) RETURNING *;');
    expect(q.sql).not.toContain('::jsonb');
  });
});

describe('buildUpdateQuery', () => {
  it('sets updated_at = NOW() and scopes by id + tenant', () => {
    const q = buildUpdateQuery({
      table: 'reservations',
      id: 'abc',
      tenantSlug: 'redruby',
      columns: ['guest'],
      values: ['Jane'],
    });
    expect(q.sql).toBe(
      'UPDATE "reservations" SET "guest" = $1, "updated_at" = NOW() WHERE "id" = $2 AND "tenant_slug" = $3 RETURNING *;',
    );
    expect(q.values).toEqual(['Jane', 'abc', 'redruby']);
  });

  it('casts jsonb columns with ::jsonb in SET assignments', () => {
    const q = buildUpdateQuery({
      table: 'reservations',
      id: 'abc',
      tenantSlug: 'redruby',
      columns: ['meta', 'guest'],
      values: ['{"a":1}', 'Jane'],
      jsonbColumns: new Set(['meta']),
    });
    expect(q.sql).toBe(
      'UPDATE "reservations" SET "meta" = $1::jsonb, "guest" = $2, "updated_at" = NOW() WHERE "id" = $3 AND "tenant_slug" = $4 RETURNING *;',
    );
    expect(q.values).toEqual(['{"a":1}', 'Jane', 'abc', 'redruby']);
  });

  it('emits plain SET assignments when jsonbColumns is omitted', () => {
    const q = buildUpdateQuery({
      table: 'reservations',
      id: 'abc',
      tenantSlug: 'redruby',
      columns: ['meta'],
      values: ['{"a":1}'],
    });
    expect(q.sql).toBe(
      'UPDATE "reservations" SET "meta" = $1, "updated_at" = NOW() WHERE "id" = $2 AND "tenant_slug" = $3 RETURNING *;',
    );
    expect(q.sql).not.toContain('::jsonb');
  });
});

describe('buildDeleteQuery', () => {
  it('scopes delete by id + tenant and returns the id', () => {
    const q = buildDeleteQuery({ table: 'reservations', id: 'abc', tenantSlug: 'redruby' });
    expect(q.sql).toBe('DELETE FROM "reservations" WHERE "id" = $1 AND "tenant_slug" = $2 RETURNING "id";');
    expect(q.values).toEqual(['abc', 'redruby']);
  });
});

// ── Column helpers ─────────────────────────────────────

describe('findUnknownColumns / findMissingRequiredColumns / validateClientId', () => {
  const columns: PackColumnMeta[] = [
    { name: 'id', dataType: 'TEXT', isPrimary: true, required: true, unique: false, isBase: true, editable: false },
    { name: 'guest', dataType: 'TEXT', isPrimary: false, required: true, unique: false, isBase: false, editable: true },
    { name: 'notes', dataType: 'TEXT', isPrimary: false, required: false, unique: false, isBase: false, editable: true },
  ];

  it('finds unknown columns', () => {
    expect(findUnknownColumns({ guest: 'x', nope: 1 }, columns)).toEqual(['nope']);
    expect(findUnknownColumns({ guest: 'x' }, columns)).toEqual([]);
  });

  it('finds missing required non-base columns (ignores base columns)', () => {
    expect(findMissingRequiredColumns({}, columns)).toEqual(['guest']);
    expect(findMissingRequiredColumns({ guest: 'x' }, columns)).toEqual([]);
    expect(findMissingRequiredColumns({ guest: null }, columns)).toEqual(['guest']);
  });

  it('validates client-supplied ids', () => {
    expect(validateClientId('abc-123')).toBe('abc-123');
    expect(validateClientId('')).toBeNull();
    expect(validateClientId(42)).toBeNull();
    expect(validateClientId('a'.repeat(65))).toBeNull();
    expect(validateClientId('a'.repeat(64))).toBe('a'.repeat(64));
  });
});

describe('mapColumnMetaRow', () => {
  it('maps information_schema rows to metadata', () => {
    expect(
      mapColumnMetaRow({
        column_name: 'guest',
        data_type: 'text',
        is_nullable: 'YES',
        column_default: null,
        is_primary: false,
        is_unique: false,
      }),
    ).toEqual({
      name: 'guest',
      dataType: 'TEXT',
      isPrimary: false,
      required: false,
      unique: false,
      isBase: false,
      editable: true,
    });
  });

  it('marks base columns non-editable and required when NOT NULL without default', () => {
    expect(
      mapColumnMetaRow({
        column_name: 'id',
        data_type: 'text',
        is_nullable: 'NO',
        column_default: null,
        is_primary: true,
        is_unique: false,
      }),
    ).toMatchObject({ isBase: true, editable: false, required: true, isPrimary: true });
    expect(
      mapColumnMetaRow({
        column_name: 'created_at',
        data_type: 'timestamp without time zone',
        is_nullable: 'NO',
        column_default: 'CURRENT_TIMESTAMP',
        is_primary: false,
        is_unique: false,
      }),
    ).toMatchObject({ isBase: true, editable: false, required: false, dataType: 'TIMESTAMP' });
  });
});

// ── DB functions with a mock RawDb ─────────────────────

function mockDb(handler: (sql: string, values: unknown[]) => unknown): RawDb {
  return {
    $queryRawUnsafe: async (sql: string, ...values: unknown[]) => handler(sql, values) as never,
    $executeRawUnsafe: async () => 0,
  };
}

describe('checkPackTableSignature', () => {
  it('queries information_schema and returns true for the pack column set', async () => {
    const calls: Array<{ sql: string; values: unknown[] }> = [];
    const db = mockDb((sql, values) => {
      calls.push({ sql, values });
      return [
        { column_name: 'id', is_primary: true },
        { column_name: 'tenant_slug', is_primary: false },
        { column_name: 'created_at', is_primary: false },
        { column_name: 'updated_at', is_primary: false },
      ];
    });
    await expect(checkPackTableSignature(db, 'reservations')).resolves.toBe(true);
    expect(calls[0].sql).toContain('information_schema.columns');
    expect(calls[0].values).toEqual(['reservations']);
  });

  it('returns false when the table is absent or lacks base columns', async () => {
    const db = mockDb(() => []);
    await expect(checkPackTableSignature(db, 'ghost')).resolves.toBe(false);
  });
});

describe('fetchPackTableColumns', () => {
  it('maps information_schema rows to metadata', async () => {
    const db = mockDb(() => [
      {
        column_name: 'id',
        data_type: 'text',
        is_nullable: 'NO',
        column_default: null,
        is_primary: true,
        is_unique: false,
      },
      {
        column_name: 'guest',
        data_type: 'text',
        is_nullable: 'YES',
        column_default: null,
        is_primary: false,
        is_unique: false,
      },
    ]);
    const cols = await fetchPackTableColumns(db, 'reservations');
    expect(cols.map((c) => c.name)).toEqual(['id', 'guest']);
    expect(cols[0]).toMatchObject({ isBase: true, editable: false, required: true });
    expect(cols[1]).toMatchObject({ isBase: false, editable: true, required: false });
  });
});

describe('resolvePackTable', () => {
  it('rejects invalid identifiers', async () => {
    const db = mockDb(() => []);
    await expect(resolvePackTable(db, 'a; DROP')).resolves.toEqual({ ok: false, reason: 'invalid-identifier' });
  });

  it('rejects blocklisted tables without querying the DB', async () => {
    let queried = false;
    const db = mockDb(() => {
      queried = true;
      return [];
    });
    await expect(resolvePackTable(db, 'navigation_items')).resolves.toEqual({ ok: false, reason: 'not-pack-table' });
    expect(queried).toBe(false);
  });

  it('rejects tables without the pack signature', async () => {
    const db = mockDb(() => []);
    await expect(resolvePackTable(db, 'reservations')).resolves.toEqual({ ok: false, reason: 'not-pack-table' });
  });

  it('accepts a valid pack table', async () => {
    const db = mockDb(() => [
      { column_name: 'id', is_primary: true },
      { column_name: 'tenant_slug', is_primary: false },
      { column_name: 'created_at', is_primary: false },
      { column_name: 'updated_at', is_primary: false },
    ]);
    await expect(resolvePackTable(db, 'reservations')).resolves.toEqual({ ok: true });
  });
});