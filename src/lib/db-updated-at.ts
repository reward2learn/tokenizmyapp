/**
 * Repair `updated_at` columns that `prisma db push` created without a default.
 *
 * ## The bug this exists to stop
 *
 * In the zmodel, `updatedAt DateTime @updatedAt` is a **client-side** feature:
 * Prisma writes the timestamp itself on every update. The column it generates is
 * `NOT NULL` with **no database default**. That is fine for code going through
 * the Prisma client — and broken for every raw-SQL INSERT in this codebase,
 * which is most of them.
 *
 * The idempotent DDL helpers do declare `updated_at ... DEFAULT CURRENT_TIMESTAMP`,
 * but `CREATE TABLE IF NOT EXISTS` no-ops when the table already exists — and
 * `prisma db push` runs first, during the build. So the helper's default never
 * lands, and the first raw INSERT fails:
 *
 *     Raw query failed. Code: `23502`
 *     Failing row contains (org_…, tokenizinfinance, TokenizinFinance,
 *                           null, null, null, 2026-08-17 18:58:05.237, null)
 *
 * `created_at` survives because `@default(now())` DOES emit a database default.
 * Only `@updatedAt` is affected, which is why this is easy to miss.
 *
 * ## The fix
 *
 * Set the default at the database level. This is idempotent, safe to run on
 * every request, and repairs tables that already exist in the broken shape —
 * which matters because the deployed database is already in that state.
 */

/**
 * Every table whose zmodel model uses `@updatedAt`.
 *
 * Keep in sync with the zmodel; `scripts/enforce-updated-at.mjs` fails the build
 * if a model gains `@updatedAt` without being listed here.
 */
export const UPDATED_AT_TABLES = [
  'user_accounts',
  'tasks',
  'navigation_items',
  'secrets',
  'app_settings',
  'google_oauth_config',
  'conversations',
  'job_queue',
  'monthly_actual_inputs',
  'monthly_actual_departments',
  'tenants',
  'webhook_configs',
  'organizations',
  'subscriptions',
  'custom_templates',
] as const;

interface RawExecutor {
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
}

/**
 * Give `updated_at` a database default on the named tables.
 *
 * Failures are swallowed per table: a table that does not exist yet on this
 * database is not an error (the DDL helper will create it correctly), and this
 * must never be the thing that takes a request down.
 */
export async function ensureUpdatedAtDefaults(
  db: RawExecutor,
  tables: readonly string[] = UPDATED_AT_TABLES,
): Promise<void> {
  for (const table of tables) {
    try {
      await db.$executeRawUnsafe(
        `ALTER TABLE ${table} ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;`,
      );
      // Backfill rows that predate the default, so the column can be relied on.
      await db.$executeRawUnsafe(
        `UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;`,
      );
    } catch {
      // Table absent on this database, or the column is shaped differently.
      // Both are recoverable; the per-table DDL helper is authoritative.
    }
  }
}
