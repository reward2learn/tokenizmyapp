#!/usr/bin/env node
/**
 * Guard: every index created by runtime DDL must be declared in the zmodel
 * under the SAME name, via `@@index([...], map: "exact_name")`.
 *
 * Why this exists — it has broken production builds twice:
 *
 *   Error: ERROR: index "idx_monthly_actual_inputs_app_id" does not exist
 *      0: sql_schema_connector::apply_migration::migration_step
 *              with step=DropIndex { index_id: IndexId(51) }
 *
 * This codebase ships schema with `prisma db push`, not migration files, and
 * several tables get their multi-tenant columns and indexes added by idempotent
 * runtime helpers (tenant-seed-service, db-migrate, security-service). Those
 * helpers pick explicit names like `idx_tasks_app_id`.
 *
 * If the zmodel does not declare an index under that exact name, `db push`
 * sees an index the schema does not know about and emits a DropIndex. Two ways
 * that hurts:
 *
 *   1. On a database where the helper HAS run, the index is silently dropped
 *      and recreated on every single deploy — churn nobody notices.
 *   2. On a database where it has NOT run, DropIndex fails outright and takes
 *      the whole build down. That is the error above.
 *
 * Declaring `@@index([appId])` without `map:` does NOT fix it: Prisma then
 * generates its own name (`tasks_app_id_idx`) and still wants to drop the
 * runtime one. The name must be pinned explicitly.
 *
 * Runs in prebuild, alongside enforce-redux.mjs.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ZMODEL = 'zenstack/schema.zmodel';
const SCAN_ROOT = 'src';

const CREATE_INDEX = /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)\s+ON\s+(\w+)\s*\(/gi;
/** Tables the zmodel actually owns — only these can be touched by `db push`. */
const ZMODEL_TABLE = /@@map\(\s*"(\w+)"\s*\)/g;

/**
 * Walk src/ rather than keeping a hand-maintained file list.
 *
 * The list used to be three hardcoded paths, which is precisely how the billing
 * tables slipped through: a new service added runtime DDL and the guard had no
 * idea it existed. Discovery is the only version of this check that stays
 * correct as the codebase grows.
 */
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

function collectRuntimeIndexes() {
  const found = new Map(); // name -> { table, file }
  if (!existsSync(SCAN_ROOT)) return found;
  for (const file of walk(SCAN_ROOT)) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(CREATE_INDEX)) {
      found.set(m[1], { table: m[2], file });
    }
  }
  return found;
}

const zmodel = existsSync(ZMODEL) ? readFileSync(ZMODEL, 'utf8') : '';
if (!zmodel) {
  console.error(`[enforce-index-names] ${ZMODEL} not found`);
  process.exit(1);
}

const zmodelTables = new Set(Array.from(zmodel.matchAll(ZMODEL_TABLE), (m) => m[1]));

const runtimeIndexes = collectRuntimeIndexes();
const unpinned = [];
let skipped = 0;

for (const [name, { table, file }] of runtimeIndexes) {
  // Only tables the zmodel declares are at risk. `db push` reconciles the
  // schema it knows about; an index on a table it has never heard of (tenant
  // data-plane tables, app-pack generated tables) is invisible to it and
  // flagging it would be noise that trains people to ignore this guard.
  if (!zmodelTables.has(table)) {
    skipped++;
    continue;
  }
  // The generated Prisma schema must carry this exact name, which only happens
  // when the zmodel pins it with `map:`.
  if (!zmodel.includes(`map: "${name}"`)) {
    unpinned.push({ name, table, file });
  }
}

if (unpinned.length > 0) {
  console.error('\n[enforce-index-names] Runtime indexes missing from the zmodel:\n');
  for (const { name, table, file } of unpinned) {
    console.error(`  ${name}`);
    console.error(`    created at runtime in : ${file}`);
    console.error(`    on table              : ${table}`);
    console.error(`    fix: add to the model @@map("${table}") in ${ZMODEL}:`);
    console.error(`         @@index([<fields>], map: "${name}")\n`);
  }
  console.error(
    `${unpinned.length} unpinned index(es). ` +
      'prisma db push would emit DropIndex for each, breaking the build on any ' +
      'database where the runtime helper has not run.\n',
  );
  process.exit(1);
}

console.log(
  `[enforce-index-names] ok — ${runtimeIndexes.size - skipped} runtime index name(s) pinned in ` +
    `${ZMODEL}; ${skipped} on tables the zmodel does not own (not at risk)`,
);
