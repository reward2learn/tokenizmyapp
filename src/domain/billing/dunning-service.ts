/**
 * Billing dunning & account lock — payment failure → notices → lock → unlock.
 *
 * Workflow (aligned with Stripe Smart Retries + SaaS norms):
 * 1. Stripe auto-debits the default payment method on each invoice cycle.
 * 2. Each `invoice.payment_failed` increments attempt_count (max 3 counted).
 * 3. After 3 failed attempts the default payment method is detached/disabled.
 * 4. Midnight cron sends up to 3 notices every 2 days (email + in-app) with a
 *    days:minutes countdown until lock.
 * 5. Once 3 notices have been delivered and invoices remain unpaid, the org
 *    (and its tenant apps) are locked — only the billing owner can unlock by
 *    paying pending invoices on Settings → Billing → Invoices.
 *
 * Stripe still owns card retries (Dashboard → Revenue recovery). This module
 * owns product-side lock, notices, and unlock eligibility.
 */
import type { createRawClient } from '@/lib/db';

type RawDb = ReturnType<typeof createRawClient>;

export const DUNNING_MAX_ATTEMPTS = 3;
export const DUNNING_MAX_NOTICES = 3;
/** Milliseconds between dunning notices (2 days). */
export const DUNNING_NOTICE_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000;
/**
 * Grace window from first failure until lock eligibility when notices are done.
 * 3 notices × 2 days = 6 days after first notice (first notice sent immediately).
 */
export const DUNNING_LOCK_AFTER_MS = DUNNING_NOTICE_INTERVAL_MS * (DUNNING_MAX_NOTICES - 1);

/** One statement per call — Prisma prepared statements reject multi-command SQL (42601). */
const DUNNING_STATE_DDL = `
CREATE TABLE IF NOT EXISTS billing_dunning_state (
  org_id TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  notice_count INTEGER NOT NULL DEFAULT 0,
  last_notice_at TIMESTAMP,
  first_failed_at TIMESTAMP,
  locked_at TIMESTAMP,
  default_pm_disabled_at TIMESTAMP,
  stripe_invoice_id TEXT,
  unlock_user_id TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const DUNNING_NOTIFICATIONS_DDL = `
CREATE TABLE IF NOT EXISTS billing_notifications (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  recipient TEXT,
  body TEXT NOT NULL,
  countdown_label TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const DUNNING_NOTIFICATIONS_IDX = `
CREATE INDEX IF NOT EXISTS idx_billing_notifications_org
  ON billing_notifications (org_id, created_at DESC)`;

export interface DunningState {
  orgId: string;
  attemptCount: number;
  noticeCount: number;
  lastNoticeAt: string | null;
  firstFailedAt: string | null;
  lockedAt: string | null;
  defaultPmDisabledAt: string | null;
  stripeInvoiceId: string | null;
  unlockUserId: string | null;
}

async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  const { createBillingRawClient } = await import('@/lib/db');
  return createBillingRawClient();
}

export async function ensureDunningTables(db?: RawDb): Promise<RawDb> {
  db = await getDb(db);
  await db.$executeRawUnsafe(DUNNING_STATE_DDL);
  await db.$executeRawUnsafe(DUNNING_NOTIFICATIONS_DDL);
  await db.$executeRawUnsafe(DUNNING_NOTIFICATIONS_IDX);
  return db;
}

function mapState(row: Record<string, unknown>): DunningState {
  return {
    orgId: String(row.org_id),
    attemptCount: Number(row.attempt_count ?? 0),
    noticeCount: Number(row.notice_count ?? 0),
    lastNoticeAt: row.last_notice_at ? new Date(row.last_notice_at as string).toISOString() : null,
    firstFailedAt: row.first_failed_at ? new Date(row.first_failed_at as string).toISOString() : null,
    lockedAt: row.locked_at ? new Date(row.locked_at as string).toISOString() : null,
    defaultPmDisabledAt: row.default_pm_disabled_at
      ? new Date(row.default_pm_disabled_at as string).toISOString()
      : null,
    stripeInvoiceId: row.stripe_invoice_id == null ? null : String(row.stripe_invoice_id),
    unlockUserId: row.unlock_user_id == null ? null : String(row.unlock_user_id),
  };
}

export async function getDunningState(orgId: string, db?: RawDb): Promise<DunningState | null> {
  db = await ensureDunningTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM billing_dunning_state WHERE org_id = $1 LIMIT 1`,
    orgId,
  )) as Record<string, unknown>[];
  return rows[0] ? mapState(rows[0]) : null;
}

/** Format remaining time as `Dd:HHh:MMm` (days:hours:minutes). */
export function formatCountdown(msRemaining: number): string {
  const clamped = Math.max(0, msRemaining);
  const totalMinutes = Math.floor(clamped / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d:${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m`;
}

export function lockDeadlineIso(state: DunningState): string | null {
  if (!state.firstFailedAt) return null;
  return new Date(new Date(state.firstFailedAt).getTime() + DUNNING_LOCK_AFTER_MS).toISOString();
}

async function resolveBillingOwnerUserId(orgId: string, db: RawDb): Promise<string | null> {
  const rows = (await db.$queryRawUnsafe(
    `SELECT owner_user_id FROM organizations WHERE id = $1 LIMIT 1`,
    orgId,
  )) as Record<string, unknown>[];
  const owner = rows[0]?.owner_user_id;
  return owner == null ? null : String(owner);
}

async function resolveBillingEmail(orgId: string, db: RawDb): Promise<string | null> {
  const rows = (await db.$queryRawUnsafe(
    `SELECT billing_email FROM organizations WHERE id = $1 LIMIT 1`,
    orgId,
  )) as Record<string, unknown>[];
  const email = rows[0]?.billing_email;
  return typeof email === 'string' && email.trim() ? email.trim() : null;
}

/**
 * Record a Stripe payment failure for the org.
 * Returns whether the default payment method should be disabled (attempt ≥ 3).
 */
export async function recordPaymentFailure(
  orgId: string,
  opts: { stripeInvoiceId?: string | null },
  db?: RawDb,
): Promise<{ state: DunningState; shouldDisableDefaultPm: boolean }> {
  db = await ensureDunningTables(db);
  const existing = await getDunningState(orgId, db);
  const unlockUserId = existing?.unlockUserId ?? (await resolveBillingOwnerUserId(orgId, db));
  const nextAttempts = Math.min(
    DUNNING_MAX_ATTEMPTS,
    (existing?.attemptCount ?? 0) + 1,
  );
  const firstFailedAt = existing?.firstFailedAt ?? new Date().toISOString();

  await db.$executeRawUnsafe(
    `INSERT INTO billing_dunning_state (
       org_id, attempt_count, notice_count, last_notice_at, first_failed_at,
       locked_at, default_pm_disabled_at, stripe_invoice_id, unlock_user_id, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
     ON CONFLICT (org_id) DO UPDATE SET
       attempt_count = GREATEST(billing_dunning_state.attempt_count + 1, EXCLUDED.attempt_count),
       first_failed_at = COALESCE(billing_dunning_state.first_failed_at, EXCLUDED.first_failed_at),
       stripe_invoice_id = COALESCE(EXCLUDED.stripe_invoice_id, billing_dunning_state.stripe_invoice_id),
       unlock_user_id = COALESCE(billing_dunning_state.unlock_user_id, EXCLUDED.unlock_user_id),
       updated_at = CURRENT_TIMESTAMP`,
    orgId,
    nextAttempts,
    existing?.noticeCount ?? 0,
    existing?.lastNoticeAt ? new Date(existing.lastNoticeAt) : null,
    new Date(firstFailedAt),
    existing?.lockedAt ? new Date(existing.lockedAt) : null,
    existing?.defaultPmDisabledAt ? new Date(existing.defaultPmDisabledAt) : null,
    opts.stripeInvoiceId ?? null,
    unlockUserId,
  );

  // Cap attempt_count at MAX after upsert bump
  await db.$executeRawUnsafe(
    `UPDATE billing_dunning_state
     SET attempt_count = LEAST(attempt_count, $2), updated_at = CURRENT_TIMESTAMP
     WHERE org_id = $1`,
    orgId,
    DUNNING_MAX_ATTEMPTS,
  );

  const state = (await getDunningState(orgId, db))!;
  const shouldDisableDefaultPm =
    state.attemptCount >= DUNNING_MAX_ATTEMPTS && !state.defaultPmDisabledAt;

  if (shouldDisableDefaultPm) {
    await db.$executeRawUnsafe(
      `UPDATE billing_dunning_state
       SET default_pm_disabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE org_id = $1 AND default_pm_disabled_at IS NULL`,
      orgId,
    );
  }

  // Immediate first notice on first failure
  if ((existing?.noticeCount ?? 0) === 0) {
    await sendDunningNotice(orgId, db);
  }

  return {
    state: (await getDunningState(orgId, db))!,
    shouldDisableDefaultPm,
  };
}

export async function clearDunningOnPaid(orgId: string, db?: RawDb): Promise<void> {
  db = await ensureDunningTables(db);
  await db.$executeRawUnsafe(`DELETE FROM billing_dunning_state WHERE org_id = $1`, orgId);
}

async function persistNotification(
  db: RawDb,
  orgId: string,
  channel: 'email' | 'in_app',
  kind: string,
  recipient: string | null,
  body: string,
  countdownLabel: string,
): Promise<void> {
  await db.$executeRawUnsafe(
    `INSERT INTO billing_notifications (id, org_id, channel, kind, recipient, body, countdown_label)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)`,
    orgId,
    channel,
    kind,
    recipient,
    body,
    countdownLabel,
  );
}

async function sendEmailNotice(to: string, subject: string, body: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.BILLING_FROM_EMAIL?.trim() || 'billing@tokenizmyapp.com';
  if (!resendKey) {
    console.warn(`[dunning] RESEND_API_KEY unset — skipping email to ${to}`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text: body }),
    });
    if (!res.ok) {
      console.error(`[dunning] Resend failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[dunning] email send error', err);
    return false;
  }
}

export async function sendDunningNotice(orgId: string, db?: RawDb): Promise<DunningState | null> {
  db = await ensureDunningTables(db);
  const state = await getDunningState(orgId, db);
  if (!state || state.lockedAt) return state;
  if (state.noticeCount >= DUNNING_MAX_NOTICES) return state;

  const deadline = lockDeadlineIso(state);
  const msLeft = deadline ? new Date(deadline).getTime() - Date.now() : DUNNING_LOCK_AFTER_MS;
  const countdown = formatCountdown(msLeft);
  const noticeNumber = state.noticeCount + 1;
  const billingEmail = await resolveBillingEmail(orgId, db);
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() || 'https://tokenizmyapp.com/support';
  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''}/settings?section=billing&tab=invoices`;

  const body =
    `Dear Customer,\n\n` +
    `This is formal notice ${noticeNumber} of ${DUNNING_MAX_NOTICES} regarding an unpaid invoice ` +
    `on your TokenizMyApp organization.\n\n` +
    `We have been unable to collect payment. Failed collection attempts: ` +
    `${state.attemptCount} of ${DUNNING_MAX_ATTEMPTS}.\n\n` +
    `Time remaining until restriction: ${countdown}.\n\n` +
    `To avoid restriction of service, the billing owner must settle all pending invoices at:\n` +
    `${settingsUrl || '/settings?section=billing&tab=invoices'}\n\n` +
    `If you require assistance, please contact support:\n${supportUrl}\n\n` +
    `Respectfully,\nTokenizMyApp Billing\n`;

  await persistNotification(db, orgId, 'in_app', `dunning_notice_${noticeNumber}`, null, body, countdown);
  if (billingEmail) {
    await sendEmailNotice(
      billingEmail,
      `Formal notice: unpaid invoice — ${countdown} until restriction`,
      body,
    );
    await persistNotification(db, orgId, 'email', `dunning_notice_${noticeNumber}`, billingEmail, body, countdown);
  }

  await db.$executeRawUnsafe(
    `UPDATE billing_dunning_state
     SET notice_count = notice_count + 1,
         last_notice_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE org_id = $1`,
    orgId,
  );

  return getDunningState(orgId, db);
}

export async function lockOrgForUnpaidInvoices(orgId: string, db?: RawDb): Promise<DunningState | null> {
  db = await ensureDunningTables(db);
  await db.$executeRawUnsafe(
    `UPDATE billing_dunning_state
     SET locked_at = COALESCE(locked_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
     WHERE org_id = $1`,
    orgId,
  );
  const billingEmail = await resolveBillingEmail(orgId, db);
  const body =
    `Dear Customer,\n\n` +
    `This is formal notice that your TokenizMyApp organization has been restricted ` +
    `due to unpaid invoices, following ${DUNNING_MAX_NOTICES} prior notices and ` +
    `${DUNNING_MAX_ATTEMPTS} failed payment attempts.\n\n` +
    `Access will remain limited until the billing owner settles all pending invoices at:\n` +
    `/settings?section=billing&tab=invoices\n\n` +
    `If you require assistance, please contact support.\n\n` +
    `Respectfully,\nTokenizMyApp Billing\n`;
  await persistNotification(db, orgId, 'in_app', 'account_locked', null, body, '0d:00h:00m');
  if (billingEmail) {
    await sendEmailNotice(
      billingEmail,
      'Formal notice: account restricted — unpaid invoices',
      body,
    );
    await persistNotification(db, orgId, 'email', 'account_locked', billingEmail, body, '0d:00h:00m');
  }
  return getDunningState(orgId, db);
}

/**
 * Midnight cron: send due notices and lock orgs that exhausted the notice window.
 */
export async function runNightlyDunningPass(db?: RawDb): Promise<{
  noticesSent: string[];
  locked: string[];
}> {
  db = await ensureDunningTables(db);

  // Also enforce legacy grace downgrades
  const { enforceDunningDowngrades } = await import('@/domain/billing/stripe-webhook-service');
  await enforceDunningDowngrades(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM billing_dunning_state WHERE locked_at IS NULL`,
  )) as Record<string, unknown>[];

  const noticesSent: string[] = [];
  const locked: string[] = [];

  for (const row of rows) {
    const state = mapState(row);
    const lastNoticeMs = state.lastNoticeAt ? new Date(state.lastNoticeAt).getTime() : 0;
    const dueForNotice =
      state.noticeCount < DUNNING_MAX_NOTICES &&
      (state.noticeCount === 0 || Date.now() - lastNoticeMs >= DUNNING_NOTICE_INTERVAL_MS);

    if (dueForNotice) {
      await sendDunningNotice(state.orgId, db);
      noticesSent.push(state.orgId);
    }

    const refreshed = await getDunningState(state.orgId, db);
    if (!refreshed) continue;

    const deadline = lockDeadlineIso(refreshed);
    const noticesDone = refreshed.noticeCount >= DUNNING_MAX_NOTICES;
    const timeExpired = deadline ? Date.now() >= new Date(deadline).getTime() : false;
    const attemptsExhausted = refreshed.attemptCount >= DUNNING_MAX_ATTEMPTS;

    if (noticesDone && (timeExpired || attemptsExhausted) && !refreshed.lockedAt) {
      await lockOrgForUnpaidInvoices(state.orgId, db);
      locked.push(state.orgId);
    }
  }

  return { noticesSent, locked };
}

export function isBillingOwner(sessionUserId: string | null | undefined, state: DunningState | null): boolean {
  if (!sessionUserId || !state?.unlockUserId) return false;
  return sessionUserId === state.unlockUserId;
}

export async function getOrgLockStatus(
  orgId: string,
  db?: RawDb,
): Promise<{ locked: boolean; state: DunningState | null; countdown: string | null }> {
  const state = await getDunningState(orgId, db);
  if (!state) return { locked: false, state: null, countdown: null };
  const deadline = lockDeadlineIso(state);
  const countdown = state.lockedAt
    ? '0d:00h:00m'
    : deadline
      ? formatCountdown(new Date(deadline).getTime() - Date.now())
      : null;
  return { locked: Boolean(state.lockedAt), state, countdown };
}
