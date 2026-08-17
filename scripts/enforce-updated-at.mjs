#!/usr/bin/env node
/**
 * Guard: `@updatedAt` columns have no database default, so every raw-SQL INSERT
 * into such a table must supply `updated_at` itself.
 *
 * Why this exists — it broke organization creation in production:
 *
 *   Raw query failed. Code: `23502`
 *   Failing row contains (org_…, tokenizinfinance, TokenizinFinance,
 *                         null, null, null, 2026-08-17 18:58:05.237, null)
 *
 * In the zmodel, `updatedAt DateTime @updatedAt` is a CLIENT-side feature:
 * Prisma stamps the value on write and the generated column is `NOT NULL` with
 * no DEFAULT. Note that `created_at` in that row is populated — `@default(now())`
 * DOES emit a database default. Only `@updatedAt` is affected, which is exactly
 * why it slips through review.
 *
 * The idempotent DDL helpers declare `updated_at ... DEFAULT CURRENT_TIMESTAMP`,
 * but `CREATE TABLE IF NOT EXISTS` no-ops when the table already exists — and
 * `prisma db push` runs first, during the build. So on any real deployment the
 * helper's default never lands.
 *
 * Two things are checked:
 *   1. Every zmodel model using `@updatedAt` is listed in UPDATED_AT_TABLES
 *      (src/lib/db-updated-at.ts), which drives the runtime repair.
 *   2. No raw `INSERT INTO <such table> (...)` omits the `updated_at` column.
 *
 * Runs in prebuild, alongside enforce-redux and enforce-index-names.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ZMODEL = 'zenstack/schema.zmodel';
const REGISTRY = 'src/lib/db-updated-at.ts';
const SCAN_ROOT = 'src';

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === 'node_modules' || entry === 'generated') continue;
      yield* walk(path);
    } else if (path.endsWith('.ts') && !path.endsWith('.test.ts')) {
      yield path;
    }
  }
}

if (!existsSync(ZMODEL)) {
  console.error(`[enforce-updated-at] ${ZMODEL} not found`);
  process.exit(1);
}

const zmodel = readFileSync(ZMODEL, 'utf8');

// Models that use @updatedAt, mapped to their table name.
const affectedTables = new Set();
for (const [, body] of zmodel.matchAll(/model\s+\w+\s*\{([\s\S]*?)\n\}/g)) {
  if (!body.includes('@updatedAt')) continue;
  const mapped = body.match(/@@map\("(\w+)"\)/);
  if (mapped) affectedTables.add(mapped[1]);
}

const problems = [];

// ── 1. Registry completeness ──
const registry = existsSync(REGISTRY) ? readFileSync(REGISTRY, 'utf8') : '';
for (const table of affectedTables) {
  if (!registry.includes(`'${table}'`)) {
    problems.push({
      kind: 'registry',
      table,
      detail: `not listed in UPDATED_AT_TABLES in ${REGISTRY}`,
    });
  }
}

// ── 2. Raw INSERTs that omit updated_at ──
for (const file of walk(SCAN_ROOT)) {
  const src = readFileSync(file, 'utf8');
  for (const table of affectedTables) {
    const pattern = new RegExp(`INSERT\\s+INTO\\s+${table}\\s*\\(([^)]*)\\)`, 'gis');
    for (const match of src.matchAll(pattern)) {
      if (!/\bupdated_at\b/.test(match[1])) {
        problems.push({ kind: 'insert', table, detail: file });
      }
    }
  }
}

if (problems.length > 0) {
  console.error('\n[enforce-updated-at] Problems found:\n');
  for (const { kind, table, detail } of problems) {
    if (kind === 'registry') {
      console.error(`  ${table}`);
      console.error(`    ${detail}`);
      console.error(`    fix: add '${table}' to UPDATED_AT_TABLES\n`);
    } else {
      console.error(`  ${table}`);
      console.error(`    raw INSERT omitting updated_at in: ${detail}`);
      console.error(`    fix: add updated_at to the column list and pass CURRENT_TIMESTAMP\n`);
    }
  }
  console.error(
    `${problems.length} problem(s). A raw INSERT without updated_at fails with ` +
      'Postgres 23502 on any database created by `prisma db push`.\n',
  );
  process.exit(1);
}

console.log(
  `[enforce-updated-at] ok — ${affectedTables.size} table(s) with @updatedAt, all registered ` +
    'and all raw INSERTs supply updated_at',
);
