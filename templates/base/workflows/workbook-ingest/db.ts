/**
 * Lightweight PostgreSQL helper for workflow steps (pg driver, no Prisma).
 *
 * Each step opens its own short-lived connection — fine for workflow steps
 * which are already individually invoiced Vercel Function invocations.
 * The pool/connection-string comes from `process.env.POSTGRES_URL` (set by
 * the Vercel/Neon integration and available in step runtime).
 */
import { Client } from 'pg';

/**
 * Run a callback with a short-lived pg connection.
 * The connection string is resolved by the route (root env → tenant db_url lookup)
 * and passed through the workflow input — never read from process.env directly.
 */
export async function withPgClient<T>(
  connectionString: string,
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  if (!connectionString) {
    throw new Error('No database connection string provided.');
  }
  const client = new Client({ connectionString });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Run a single SQL statement and return the row count or result. */
export async function executeOne(
  client: Client,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const result = await client.query(sql, params);
  return result.rowCount ?? 0;
}

/** Run SQL and return all rows. */
export async function queryRows<T = Record<string, unknown>>(
  client: Client,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await client.query(sql, params);
  return result.rows as T[];
}
