/**
 * Durable SIWE nonce store — Neon/Postgres across Vercel serverless instances.
 *
 * An in-memory Map fails in production: GET /nonce and POST /verify often hit
 * different lambdas, so consume returns null → "Invalid or expired nonce".
 *
 * Falls back to process-local memory when POSTGRES_URL is unset (unit tests).
 */
import { createRawClient } from '@/lib/db';

export interface PendingSiweNonce {
  nonce: string;
  address: string;
  chainId: number;
  domain: string;
  expiresAt: number;
  used: boolean;
}

const memoryPending = new Map<string, PendingSiweNonce>();
const memoryUsed = new Set<string>();

let tableReady: Promise<void> | null = null;

function useMemoryStore(): boolean {
  return !process.env.POSTGRES_URL?.trim() && !process.env.DATABASE_URL?.trim();
}

async function ensureSiweNonceTable(): Promise<void> {
  if (useMemoryStore()) return;
  if (!tableReady) {
    tableReady = (async () => {
      const db = createRawClient();
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS siwe_nonces (
          nonce TEXT PRIMARY KEY,
          address TEXT NOT NULL,
          chain_id INTEGER NOT NULL,
          domain TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS siwe_nonces_expires_at_idx
          ON siwe_nonces (expires_at)
          WHERE used_at IS NULL;
      `);
    })().catch((err) => {
      tableReady = null;
      throw err;
    });
  }
  await tableReady;
}

function pruneMemory(): void {
  const now = Date.now();
  for (const [key, entry] of memoryPending) {
    if (entry.expiresAt < now) memoryPending.delete(key);
  }
}

export async function registerSiweNonce(
  entry: Omit<PendingSiweNonce, 'used'>,
): Promise<void> {
  if (useMemoryStore()) {
    pruneMemory();
    memoryPending.set(entry.nonce, { ...entry, used: false });
    return;
  }

  await ensureSiweNonceTable();
  const db = createRawClient();
  await db.$executeRawUnsafe(
    `INSERT INTO siwe_nonces (nonce, address, chain_id, domain, expires_at)
     VALUES ($1, $2, $3, $4, to_timestamp($5::double precision / 1000.0))
     ON CONFLICT (nonce) DO NOTHING;`,
    entry.nonce,
    entry.address.toLowerCase(),
    entry.chainId,
    entry.domain,
    entry.expiresAt,
  );
}

/**
 * One-time consume. Returns null when missing, expired, or already used.
 * Atomic UPDATE … RETURNING so concurrent verifies cannot double-spend.
 */
export async function consumeSiweNonce(nonce: string): Promise<PendingSiweNonce | null> {
  if (useMemoryStore()) {
    pruneMemory();
    if (memoryUsed.has(nonce)) return null;
    const entry = memoryPending.get(nonce);
    if (!entry || entry.used || entry.expiresAt < Date.now()) return null;
    entry.used = true;
    memoryUsed.add(nonce);
    memoryPending.delete(nonce);
    return entry;
  }

  await ensureSiweNonceTable();
  const db = createRawClient();
  const rows = await db.$queryRawUnsafe<
    {
      nonce: string;
      address: string;
      chain_id: number;
      domain: string;
      expires_at: Date;
    }[]
  >(
    `UPDATE siwe_nonces
     SET used_at = NOW()
     WHERE nonce = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     RETURNING nonce, address, chain_id, domain, expires_at;`,
    nonce,
  );

  const row = rows[0];
  if (!row) return null;

  return {
    nonce: row.nonce,
    address: row.address,
    chainId: Number(row.chain_id),
    domain: row.domain,
    expiresAt: new Date(row.expires_at).getTime(),
    used: true,
  };
}

/** Reset registries — tests only (memory store). */
export function resetSiweNonceRegistryForTests(): void {
  memoryPending.clear();
  memoryUsed.clear();
  tableReady = null;
}
