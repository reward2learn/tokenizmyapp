/**
 * Lightweight PostgreSQL helper for app-pack workflow steps (pg driver, no
 * Prisma). Mirrors workflows/workbook-ingest/db.ts — each step opens its own
 * short-lived connection; the connection string is resolved by the route and
 * passed through the workflow input.
 */
import { Client } from 'pg';

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

export async function queryRows<T>(client: Client, sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await client.query(sql, params);
  return result.rows as T[];
}
