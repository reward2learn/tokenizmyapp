#!/usr/bin/env node
/**
 * Probe Postgres until Neon (or any host) accepts connections.
 *
 * Neon scale-to-zero: the pooler often returns P1001 instantly while compute
 * is suspended. The direct (non-pooling) endpoint wakes compute reliably — try
 * it first, then fall back to pooled URLs.
 *
 * Exit 0 when reachable; exit 1 after all probes fail.
 */
import pg from 'pg';

const schemaPath = process.argv[2] ?? 'zenstack/prisma/schema.prisma';
const warmAttempts = Number(process.env.POSTGRES_WARM_ATTEMPTS ?? 20);
const sleepSec = Number(process.env.POSTGRES_WARM_SLEEP_SEC ?? 10);
const connectTimeoutMs = Number(process.env.POSTGRES_CONNECT_TIMEOUT_MS ?? 30_000);

/** Redact password from connection strings before logging. */
function redactUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return url.replace(/:([^:@/]+)@/, ':***@');
  }
}

function withConnectTimeout(url) {
  if (url.includes('connect_timeout=')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}connect_timeout=${Math.ceil(connectTimeoutMs / 1000)}`;
}

/** Derive a direct Neon host from a pooler URL when no unpooled env is set. */
function poolerToDirect(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('-pooler.')) return null;
    parsed.hostname = parsed.hostname.replace('-pooler.', '.');
    return parsed.toString();
  } catch {
    return null;
  }
}

function candidateUrls() {
  const seen = new Set();
  const urls = [];

  const add = (raw) => {
    if (!raw || seen.has(raw)) return;
    seen.add(raw);
    urls.push(withConnectTimeout(raw));
  };

  // Direct first — best for waking suspended Neon compute + schema sync.
  add(process.env.POSTGRES_URL_NON_POOLING);
  add(process.env.DATABASE_URL_UNPOOLED);
  add(poolerToDirect(process.env.POSTGRES_URL ?? ''));
  add(process.env.POSTGRES_PRISMA_URL);
  add(process.env.POSTGRES_URL);
  add(process.env.DATABASE_URL);

  return urls;
}

async function probeUrl(url) {
  const client = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: connectTimeoutMs,
    ssl: url.includes('sslmode=disable') ? false : { rejectUnauthorized: true },
  });
  try {
    await client.connect();
    await client.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message };
  } finally {
    await client.end().catch(() => {});
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const urls = candidateUrls();
if (urls.length === 0) {
  console.log('[wait-for-postgres] No POSTGRES_URL — skipping warmup.');
  process.exit(0);
}

console.log(
  `[wait-for-postgres] Waiting for database (${urls.length} URL variant(s), schema ${schemaPath})…`,
);
console.log(`[wait-for-postgres] Primary: ${redactUrl(urls[0])}`);

let lastError = '';

for (let i = 1; i <= warmAttempts; i += 1) {
  for (const url of urls) {
    const result = await probeUrl(url);
    if (result.ok) {
      console.log(`[wait-for-postgres] Database reachable (probe ${i}, ${redactUrl(url)}).`);
      // Tell vercel-build.sh which URL worked so db push uses the same one.
      if (process.env.WAIT_FOR_POSTGRES_RESULT_FILE) {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(process.env.WAIT_FOR_POSTGRES_RESULT_FILE, url, 'utf8');
      }
      process.exit(0);
    }
    lastError = result.message ?? 'unknown error';
  }

  if (i === 1 || i === warmAttempts) {
    console.warn(`[wait-for-postgres] Probe ${i}/${warmAttempts} failed: ${lastError}`);
  }

  if (i === warmAttempts) {
    console.error(
      `[wait-for-postgres] Database unreachable after ${warmAttempts} probes (~${warmAttempts * sleepSec}s).`,
    );
    console.error('[wait-for-postgres] Check Neon dashboard: compute may be suspended or POSTGRES_URL env vars missing on Vercel.');
    process.exit(1);
  }

  console.log(
    `[wait-for-postgres] Not reachable yet (probe ${i}/${warmAttempts}) — retrying in ${sleepSec}s…`,
  );
  await sleep(sleepSec * 1000);
}
