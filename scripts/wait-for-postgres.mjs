#!/usr/bin/env node
/**
 * Probe POSTGRES_URL until Neon (or any Postgres) accepts connections.
 * Used by vercel-build.sh and tenant builds to survive scale-to-zero cold starts.
 *
 * Exit 0 when reachable; exit 1 after all probes fail.
 */
import { spawnSync } from 'node:child_process';

const schemaPath = process.argv[2] ?? 'zenstack/prisma/schema.prisma';
const warmAttempts = Number(process.env.POSTGRES_WARM_ATTEMPTS ?? 12);
const sleepSec = Number(process.env.POSTGRES_WARM_SLEEP_SEC ?? 15);

const rawUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!rawUrl) {
  console.log('[wait-for-postgres] No POSTGRES_URL — skipping warmup.');
  process.exit(0);
}

const postgresUrl = rawUrl.includes('connect_timeout=')
  ? rawUrl
  : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}connect_timeout=30`;

function dbReady() {
  const result = spawnSync(
    'npx',
    ['prisma', 'db', 'execute', '--stdin', `--schema=${schemaPath}`],
    {
      input: 'SELECT 1;',
      env: { ...process.env, POSTGRES_URL: postgresUrl },
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
    },
  );
  return result.status === 0;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

console.log('[wait-for-postgres] Waiting for database to be reachable...');
for (let i = 1; i <= warmAttempts; i += 1) {
  if (dbReady()) {
    console.log(`[wait-for-postgres] Database reachable (probe ${i}).`);
    process.exit(0);
  }
  if (i === warmAttempts) {
    console.error(
      `[wait-for-postgres] Database unreachable after ${warmAttempts} probes (~${warmAttempts * sleepSec}s).`,
    );
    process.exit(1);
  }
  console.log(
    `[wait-for-postgres] Not reachable yet (probe ${i}/${warmAttempts}) — retrying in ${sleepSec}s...`,
  );
  await sleep(sleepSec * 1000);
}
