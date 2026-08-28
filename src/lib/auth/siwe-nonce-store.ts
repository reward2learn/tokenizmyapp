/**
 * Durable SIWE nonce store — Neon/Postgres across Vercel serverless instances.
 *
 * Register-then-consume alone is fragile on serverless (DDL / insert races,
 * cold starts). After a cryptographically valid SIWE signature, we **claim**
 * the nonce on first use (insert-as-used). Pre-registration remains best-effort
 * bookkeeping; replay is blocked by PRIMARY KEY conflict.
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

export interface ClaimSiweNonceInput {
  nonce: string;
  address: string;
  chainId: number;
  domain: string;
  /** Epoch ms from SIWE `Issued At` (freshness gate). */
  issuedAtMs: number;
}

const NONCE_MAX_AGE_MS = 15 * 60_000;
const NONCE_CLOCK_SKEW_MS = 2 * 60_000;

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

function isFreshIssuedAt(issuedAtMs: number): boolean {
  if (!Number.isFinite(issuedAtMs)) return false;
  const age = Date.now() - issuedAtMs;
  return age <= NONCE_MAX_AGE_MS && age >= -NONCE_CLOCK_SKEW_MS;
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
  const expiresAt = new Date(entry.expiresAt);
  // Prefer ISO timestamptz binding — to_timestamp($n/1000) has been unreliable
  // across Prisma/pgbouncer parameter coercion on Neon.
  await db.$executeRawUnsafe(
    `INSERT INTO siwe_nonces (nonce, address, chain_id, domain, expires_at)
     VALUES ($1, $2, $3, $4, $5::timestamptz)
     ON CONFLICT (nonce) DO NOTHING;`,
    entry.nonce,
    entry.address.toLowerCase(),
    entry.chainId,
    entry.domain,
    expiresAt.toISOString(),
  );
}

/**
 * One-time consume of a pre-registered nonce.
 * Returns null when missing, expired, or already used.
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

/**
 * After signature verification succeeds: consume a pre-registered nonce, or
 * claim a never-seen nonce as used (insert). Replay of the same nonce fails.
 */
export async function claimSiweNonceAfterVerify(
  input: ClaimSiweNonceInput,
): Promise<PendingSiweNonce | null> {
  if (!isFreshIssuedAt(input.issuedAtMs)) {
    return null;
  }

  const preRegistered = await consumeSiweNonce(input.nonce);
  if (preRegistered) {
    return preRegistered;
  }

  // Pre-registered row may exist with a bad/expired expires_at — force-consume
  // unused rows once Issued At has already passed the freshness gate.
  const forced = await forceConsumeUnusedSiweNonce(input.nonce);
  if (forced) {
    return forced;
  }

  const expiresAt = input.issuedAtMs + NONCE_MAX_AGE_MS;
  const address = input.address.toLowerCase();

  if (useMemoryStore()) {
    if (memoryUsed.has(input.nonce)) {
      return null;
    }
    memoryUsed.add(input.nonce);
    memoryPending.delete(input.nonce);
    return {
      nonce: input.nonce,
      address,
      chainId: input.chainId,
      domain: input.domain,
      expiresAt,
      used: true,
    };
  }

  try {
    await ensureSiweNonceTable();
  } catch (err) {
    console.error('[siwe-nonce] ensure table failed during claim:', err);
    return null;
  }

  const db = createRawClient();
  try {
    const rows = await db.$queryRawUnsafe<
      {
        nonce: string;
        address: string;
        chain_id: number;
        domain: string;
        expires_at: Date;
      }[]
    >(
      `INSERT INTO siwe_nonces (nonce, address, chain_id, domain, expires_at, used_at)
       VALUES ($1, $2, $3, $4, $5::timestamptz, NOW())
       ON CONFLICT (nonce) DO NOTHING
       RETURNING nonce, address, chain_id, domain, expires_at;`,
      input.nonce,
      address,
      input.chainId,
      input.domain,
      new Date(expiresAt).toISOString(),
    );

    const row = rows[0];
    if (!row) {
      // Lost the race to another claim, or row already used.
      return forceConsumeUnusedSiweNonce(input.nonce);
    }

    return {
      nonce: row.nonce,
      address: row.address,
      chainId: Number(row.chain_id),
      domain: row.domain,
      expiresAt: new Date(row.expires_at).getTime(),
      used: true,
    };
  } catch (err) {
    console.error('[siwe-nonce] claim insert failed:', err);
    return null;
  }
}

/** Mark an unused row used even if expires_at already passed (Issued At gated). */
async function forceConsumeUnusedSiweNonce(
  nonce: string,
): Promise<PendingSiweNonce | null> {
  if (useMemoryStore()) {
    const entry = memoryPending.get(nonce);
    if (!entry || entry.used || memoryUsed.has(nonce)) return null;
    entry.used = true;
    memoryUsed.add(nonce);
    memoryPending.delete(nonce);
    return entry;
  }

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
