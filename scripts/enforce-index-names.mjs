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
import { readFileSync, existsSync } from 'node:fs';

const ZMODEL = 'zenstack/schema.zmodel';

/** Files containing runtime `CREATE INDEX IF NOT EXISTS` statements. */
const DDL_SOURCES = [
  'src/domain/tenant/tenant-seed-service.ts',
  'src/lib/db-migrate.ts',
  'src/domain/security/security-service.ts',
];

const CREATE_INDEX = /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)\s+ON\s+(\w+)\s*\(/gi;

function collectRuntimeIndexes() {
  const found = new Map(); // name -> { table, file }
  for (const file of DDL_SOURCES) {
    if (!existsSync(file)) continue;
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

const runtimeIndexes = collectRuntimeIndexes();
const unpinned = [];

for (const [name, { table, file }] of runtimeIndexes) {
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
  `[enforce-index-names] ok — ${runtimeIndexes.size} runtime index name(s) pinned in ${ZMODEL}`,
);
