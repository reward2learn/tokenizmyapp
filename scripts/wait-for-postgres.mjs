#!/usr/bin/env node
/**
 * Probe Postgres until Neon (or any host) accepts connections.
 *
 * Exit codes:
 *   0 — reachable
 *   1 — timed out (retryable errors exhausted)
 *   2 — non-retryable (quota, auth, deleted DB) — do not retry
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

function isPoolerHost(url) {
  try {
    return new URL(url).hostname.includes('-pooler.');
  } catch {
    return false;
  }
}

function withConnectTimeout(url) {
  if (url.includes('connect_timeout=')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}connect_timeout=${Math.ceil(connectTimeoutMs / 1000)}`;
}

/**
 * pg-connection-string currently treats prefer/require/verify-ca as verify-full
 * and warns that v3 will change that. Opt into today's secure semantics explicitly
 * so Neon URLs (`sslmode=require`) stop emitting the build warning.
 * See https://www.postgresql.org/docs/current/libpq-ssl.html
 */
function withExplicitVerifyFullSsl(url) {
  if (!url || url.includes('sslmode=disable') || url.includes('sslmode=verify-full')) {
    return url;
  }
  if (/[?&]sslmode=(prefer|require|verify-ca)\b/i.test(url)) {
    return url.replace(/([?&])sslmode=(prefer|require|verify-ca)\b/gi, '$1sslmode=verify-full');
  }
  return `${url}${url.includes('?') ? '&' : '?'}sslmode=verify-full`;
}

/** Derive a direct Neon host from a pooler URL when no unpooled env is set. */
function poolerToDirect(url) {
  if (!url || !isPoolerHost(url)) return null;
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.replace('-pooler.', '.');
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Errors where retrying wastes build minutes (quota, auth, missing DB). */
function classifyError(message) {
  const lower = message.toLowerCase();
  if (
    lower.includes('data transfer quota')
    || lower.includes('exceeded the data transfer')
    || lower.includes('quota')
    || lower.includes('billing')
    || lower.includes('plan limit')
  ) {
    return { retryable: false, kind: 'quota', hint: 'Neon data transfer quota exceeded — upgrade Neon or wait for reset.' };
  }
  if (
    lower.includes('password authentication failed')
    || lower.includes('authentication failed')
    || lower.includes('invalid authorization')
  ) {
    return { retryable: false, kind: 'auth', hint: 'Database credentials rejected — check POSTGRES_URL on Vercel.' };
  }
  if (lower.includes('does not exist') && lower.includes('database')) {
    return { retryable: false, kind: 'missing', hint: 'Database not found — Neon project may have been deleted.' };
  }
  return { retryable: true, kind: 'transient', hint: '' };
}

function candidateUrls() {
  const seen = new Set();
  const urls = [];

  const add = (raw) => {
    if (!raw || seen.has(raw)) return;
    const normalized = withExplicitVerifyFullSsl(raw);
    if (seen.has(normalized)) return;
    seen.add(raw);
    seen.add(normalized);
    urls.push(withConnectTimeout(normalized));
  };

  const pooled = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '';
  const nonPooling = process.env.POSTGRES_URL_NON_POOLING;
  const unpooled = process.env.DATABASE_URL_UNPOOLED;

  // Direct endpoints first. Skip NON_POOLING when it incorrectly points at the pooler host.
  if (nonPooling && !isPoolerHost(nonPooling)) add(nonPooling);
  if (unpooled && !isPoolerHost(unpooled)) add(unpooled);
  add(poolerToDirect(pooled));
  add(poolerToDirect(process.env.POSTGRES_PRISMA_URL ?? ''));
  if (process.env.POSTGRES_PRISMA_URL) add(process.env.POSTGRES_PRISMA_URL);
  if (pooled) add(pooled);

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
    return { ok: false, message, ...classifyError(message) };
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
let lastKind = 'transient';

for (let i = 1; i <= warmAttempts; i += 1) {
  for (const url of urls) {
    const result = await probeUrl(url);
    if (result.ok) {
      console.log(`[wait-for-postgres] Database reachable (probe ${i}, ${redactUrl(url)}).`);
      if (process.env.WAIT_FOR_POSTGRES_RESULT_FILE) {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(process.env.WAIT_FOR_POSTGRES_RESULT_FILE, url, 'utf8');
      }
      process.exit(0);
    }
    lastError = result.message ?? 'unknown error';
    lastKind = result.kind ?? 'transient';

    if (!result.retryable) {
      console.error(`[wait-for-postgres] Non-retryable error (${result.kind}): ${lastError}`);
      if (result.hint) console.error(`[wait-for-postgres] ${result.hint}`);
      process.exit(2);
    }
  }

  if (i === 1 || i === warmAttempts) {
    console.warn(`[wait-for-postgres] Probe ${i}/${warmAttempts} failed: ${lastError}`);
  }

  if (i === warmAttempts) {
    console.error(
      `[wait-for-postgres] Database unreachable after ${warmAttempts} probes (~${warmAttempts * sleepSec}s). Last: ${lastError}`,
    );
    process.exit(1);
  }

  console.log(
    `[wait-for-postgres] Not reachable yet (probe ${i}/${warmAttempts}, ${lastKind}) — retrying in ${sleepSec}s…`,
  );
  await sleep(sleepSec * 1000);
}
