/**
 * Bootstrap legacy tables not auto-created by legacy lib/db.js migrate.
 * Safe to run multiple times (IF NOT EXISTS).
 *
 * Apply schema changes via ZenStack:
 *   cd website && npx zenstack generate --schema zenstack/schema.zmodel
 *   npx prisma db push --schema src/generated/prisma/schema.prisma
 *
 * Requires POSTGRES_URL. Do NOT run destructive migrations against production
 * without explicit approval and a verified backup.
 */
import type { DbClient } from '@/lib/db';
import { createBaseClient } from '@/lib/db';
import { backfillKnownAccounts } from '@/domain/security/security-service';
import { FUNCTIONAL_ROLES } from '@/domain/security/functional-roles';
import { PERSONS, DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/persons';
import { getSecretPlaintext, setSecret } from '@/lib/secrets';

const JOB_QUEUE_DDL = [
  `DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `CREATE TABLE IF NOT EXISTS job_queue (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by_session TEXT,
    payload JSONB NOT NULL,
    status "JobStatus" NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_data JSONB
  );`,
  `CREATE INDEX IF NOT EXISTS idx_job_queue_by_status ON job_queue (status);`,
];

function isNeonRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('neon:retryable') || msg.includes('Control plane request failed');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

async function runStatements(db: DbClient, statements: string[]): Promise<void> {
  for (const sql of statements) {
    await db.$executeRawUnsafe(sql);
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 500): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isNeonRetryable(err) || i === attempts - 1) throw err;
      const delay = baseMs * (i + 1);
      console.warn(`[db-migrate] Transient Neon error, retry ${i + 1}/${attempts - 1} in ${delay}ms…`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

export async function ensureJobQueueTable(db: DbClient): Promise<boolean> {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set — refusing to run ensureJobQueueTable');
  }

  await withRetry(async () => {
    await runStatements(db, JOB_QUEUE_DDL);
  });

  return true;
}

const CONVERSATIONS_COLUMNS_DDL = [
  `CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL DEFAULT 'Anonymous',
    owner_sub TEXT,
    title TEXT NOT NULL DEFAULT 'Chat Conversation',
    messages JSONB NOT NULL DEFAULT '[]',
    message_count INTEGER NOT NULL DEFAULT 0,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;`,
  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS owner_sub TEXT;`,
  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,
];

export async function ensureConversationsColumns(db: DbClient): Promise<boolean> {
  // createClient() already validated POSTGRES_URL — no need to re-check here

  await withRetry(async () => {
    await runStatements(db, CONVERSATIONS_COLUMNS_DDL);
  });

  return true;
}

const SECURITY_TABLES_DDL = [
  `CREATE TABLE IF NOT EXISTS user_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    sub TEXT NOT NULL UNIQUE,
    email TEXT,
    name TEXT,
    tier TEXT NOT NULL DEFAULT 'google',
    role_code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS security_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS user_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES user_accounts (id) ON DELETE CASCADE,
    group_id TEXT NOT NULL REFERENCES security_groups (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, group_id)
  );`,
  `CREATE INDEX IF NOT EXISTS idx_user_groups_user ON user_groups (user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_user_groups_group ON user_groups (group_id);`,
];

/** Default groups seeded on first run. Codes are referenced by requireGroup(). */
export const DEFAULT_SECURITY_GROUPS: {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}[] = [
  {
    code: 'platform-admin',
    name: 'Platform Admin',
    description: 'Full administrative access.',
    isSystem: true,
    permissions: ['*'],
  },
  {
    code: 'ops-admin',
    name: 'Ops Admin',
    description: 'Operations & cost/payroll management.',
    isSystem: false,
    permissions: [
      'metrics:read', 'metrics:write',
      'tasks:read', 'tasks:write',
      'pos:use',
      'conversations:read', 'conversations:write',
      'pages:read', 'pages:write',
      'settings:write',
    ],
  },
  {
    code: 'finance',
    name: 'Finance',
    description: 'Financial reporting and actuals.',
    isSystem: false,
    permissions: ['financials:read', 'financials:write'],
  },
  {
    code: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboards.',
    isSystem: false,
    permissions: ['metrics:read', 'financials:read', 'tasks:read', 'conversations:read', 'pages:read'],
  },
];

/** Add the permissions column to an already-created security_groups table. */
const SECURITY_GROUPS_COLUMNS_DDL = [
  `ALTER TABLE security_groups ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';`,
];

export async function ensureSecurityTables(
  db: DbClient,
  knownAccounts: { sub: string; name: string; tier: string; roleCode?: string | null }[] = [],
): Promise<boolean> {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set — refusing to run ensureSecurityTables');
  }

  // Use the raw (un-enhanced) client so DDL/seed/backfill never hit ZenStack
  // policy enforcement — these are internal bootstrap operations.
  const raw = createBaseClient();

  await withRetry(async () => {
    await runStatements(raw, SECURITY_TABLES_DDL);
    await runStatements(raw, SECURITY_GROUPS_COLUMNS_DDL);
  });

  // Idempotent seed of default groups (with default permissions).
  await withRetry(async () => {
    for (const g of DEFAULT_SECURITY_GROUPS) {
      await raw.$executeRawUnsafe(
        `INSERT INTO security_groups (id, code, name, description, is_system, permissions)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE
           SET name = $2, description = $3, is_system = $4, permissions = $5;`,
        g.code, g.name, g.description, g.isSystem, g.permissions,
      );
    }
  });

  // Ensure the roles table exists, then seed the functional role catalog.
  await withRetry(async () => {
    await raw.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        is_platform_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    for (const fr of FUNCTIONAL_ROLES) {
      // Prefer PERSONS email for this role code (e.g. platform-admin → reward2learn@gmail.com).
      const personEmail =
        PERSONS.find((p) => p.roleCode === fr.code && p.email)?.email ??
        (fr.isPlatformAdmin ? DEFAULT_PLATFORM_ADMIN_EMAIL : null);
      // The roles table was originally created by Prisma with id TEXT (no
      // DB-level DEFAULT), so we must supply an id in raw INSERTs.
      await raw.$executeRawUnsafe(
        `INSERT INTO roles (id, code, name, email, is_platform_admin)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
           SET name = $2,
               email = COALESCE($3, roles.email),
               is_platform_admin = $4;`,
        fr.code, fr.name, personEmail, fr.isPlatformAdmin ?? false,
      );
    }
  });

  // One-time migration: re-key legacy ROLE_PIN_* secrets to USER_PIN_* format.
  // Older deployments used person-specific ROLE_PIN keys; map them to role-code keys.
  await withRetry(async () => {
    const OLD_TO_NEW: Record<string, string> = {
      ROLE_PIN_AMA: 'USER_PIN_finance',
      ROLE_PIN_MADE: 'USER_PIN_compliance',
      ROLE_PIN_LUKAS: 'USER_PIN_operations',
      ROLE_PIN_JAMES: 'USER_PIN_entertainment',
      // Legacy sub-based keys from an intermediate migration
      USER_PIN_ama: 'USER_PIN_finance',
      USER_PIN_made: 'USER_PIN_compliance',
      USER_PIN_lucas: 'USER_PIN_operations',
      USER_PIN_james: 'USER_PIN_entertainment',
    };
    for (const [oldKey, newKey] of Object.entries(OLD_TO_NEW)) {
      const existingNew = await getSecretPlaintext(newKey);
      if (existingNew) continue; // already migrated
      const oldPin = await getSecretPlaintext(oldKey);
      if (oldPin) {
        await setSecret(newKey, oldPin);
      }
    }
  });

  // Backfill user_account rows for known operational identities (PIN roles +
  // platform admins) so the User Accounts list shows prior users immediately.
  if (knownAccounts.length) {
    await withRetry(async () => {
      await backfillKnownAccounts(raw, knownAccounts);
    });
  }

  // One-time backfill: existing accounts keep ops + finance access so group-based
  // route gating doesn't lock out current users. New accounts start with no
  // groups and are assigned by a platform admin via the User Accounts page.
  await withRetry(async () => {
    await raw.$executeRawUnsafe(
      `INSERT INTO user_groups (id, user_id, group_id)
       SELECT gen_random_uuid()::TEXT, ua.id, sg.id FROM user_accounts ua
       CROSS JOIN security_groups sg
       WHERE sg.code IN ('ops-admin', 'finance')
         AND NOT EXISTS (
           SELECT 1 FROM user_groups ug
           WHERE ug.user_id = ua.id AND ug.group_id = sg.id
         );`,
    );
  });

  return true;
}

export async function ensureLegacyTables(db: DbClient): Promise<{ job_queue: boolean }> {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set — refusing to run ensureLegacyTables');
  }

  await withRetry(async () => {
    await runStatements(db, JOB_QUEUE_DDL);
    await runStatements(db, CONVERSATIONS_COLUMNS_DDL);
    await runStatements(db, SECURITY_TABLES_DDL);
  });

  return { job_queue: true };
}

export const MIGRATION_NOTES = `
ZenStack migration workflow (website/):
1. Edit zenstack/schema.zmodel (SSoT)
2. npm run zen:generate
3. npx prisma db push --schema src/generated/prisma/schema.prisma  (dev only)
4. Call ensureLegacyTables(createClient()) for job_queue + conversations if missing

Never drop production tables. Use introspection-aligned @@map names only.
`.trim();
