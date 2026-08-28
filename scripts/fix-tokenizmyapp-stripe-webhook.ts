/**
 * Repair tokenizmyapp Stripe webhook: register Dashboard endpoint + push whsec_ to Vercel.
 *
 * Usage (from tokenizmyapp/):
 *   bun run scripts/fix-tokenizmyapp-stripe-webhook.ts
 *   bun run scripts/fix-tokenizmyapp-stripe-webhook.ts --whsec=whsec_...
 *
 * Requires: STRIPE_SECRET_KEY or stripe CLI default account, VERCEL_TOKEN (or OAuth in DB).
 */
import { execSync } from 'node:child_process';

const WEBHOOK_URL = 'https://tokenizmyapp.vercel.app/api/webhooks/stripe';
const FACTORY_PROJECT_ID = 'prj_ia654I3nS8CWUu6uA57oSKDR01IE';
const SUITE_PROJECTS = [
  'prj_ia654I3nS8CWUu6uA57oSKDR01IE',
  // Suite apps share billing webhook on factory URL — snapshot secret on main project only.
];

const EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'payment_intent.succeeded',
];

function parseWhsecArg(): string | null {
  const arg = process.argv.find((a) => a.startsWith('--whsec='));
  return arg ? arg.slice('--whsec='.length).trim() : null;
}

async function ensureStripeWebhookEndpoint(): Promise<{ id: string; secret: string }> {
  const { default: Stripe } = await import('stripe');
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set — export it or run stripe login.');
  }
  const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' });

  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((w) => w.url === WEBHOOK_URL && w.status === 'enabled');
  if (match?.secret) {
    console.log(`[fix-webhook] Reusing Stripe endpoint ${match.id}`);
    return { id: match.id, secret: match.secret };
  }

  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    description: 'TokenizMyApp factory billing',
    enabled_events: EVENTS,
  });
  if (!created.secret) {
    throw new Error(
      `Created webhook ${created.id} but no signing secret returned — retrieve from Stripe Dashboard.`,
    );
  }
  console.log(`[fix-webhook] Created Stripe endpoint ${created.id}`);
  return { id: created.id, secret: created.secret };
}

async function pushWhsecToVercel(whsec: string): Promise<void> {
  const { replaceStripeWebhookSecretOnProject, diagnoseWebhookSigningSecretEnv } = await import(
    '../src/domain/tenant/vercel-stripe-marketplace-service'
  );

  for (const projectId of SUITE_PROJECTS) {
    console.log(`[fix-webhook] Pushing whsec to Vercel project ${projectId}…`);
    const result = await replaceStripeWebhookSecretOnProject(projectId, whsec);
    const diag = await diagnoseWebhookSigningSecretEnv(projectId);
    console.log(
      `[fix-webhook] project ${projectId}: verify=${result.verifyPrefix}, snapshot diagnostic=${diag.selectedPrefix}, deleted=${result.deleted}`,
    );
    if (result.verifyPrefix !== 'whsec') {
      throw new Error(`Vercel project ${projectId} still reports ${result.verifyPrefix} after push`);
    }
  }
}

async function updateTenantMetadata(whsec: string): Promise<void> {
  const { createRawClient } = await import('../src/lib/db');
  const { ensureTenantsTable } = await import('../src/domain/tenant/tenant-service');
  const db = createRawClient();
  await ensureTenantsTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    'tokenizmyapp',
  )) as Record<string, unknown>[];
  if (rows.length === 0) return;
  const meta = (rows[0].metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
  const nextMeta = {
    ...meta,
    config: {
      ...cfg,
      stripe: { ...stripe, webhookSecret: whsec },
    },
  };
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(nextMeta),
    'tokenizmyapp',
  );
  console.log('[fix-webhook] Updated tenant metadata.config.stripe.webhookSecret');
}

async function triggerDeployHook(): Promise<void> {
  try {
    execSync('vercel deploy --prod --yes --scope ilishaps-projects tokenizmyapp 2>&1', {
      stdio: 'inherit',
      env: process.env,
    });
  } catch {
    console.warn('[fix-webhook] vercel deploy skipped or failed — redeploy manually so runtime picks up STRIPE_SNAPSHOT_WEBHOOK_SECRET');
  }
}

async function main(): Promise<void> {
  const whsecArg = parseWhsecArg();
  let whsec = whsecArg;

  if (!whsec) {
    const endpoint = await ensureStripeWebhookEndpoint();
    whsec = endpoint.secret;
  }

  if (!whsec?.startsWith('whsec_')) {
    throw new Error('Invalid webhook signing secret — expected whsec_ prefix.');
  }

  console.log(`[fix-webhook] Using whsec ${whsec.slice(0, 12)}…`);

  await updateTenantMetadata(whsec);
  await pushWhsecToVercel(whsec);

  console.log('[fix-webhook] Done. Redeploy tokenizmyapp, then re-run Flight Check webhook test.');
  console.log(`[fix-webhook] Stripe endpoint URL: ${WEBHOOK_URL}`);

  if (process.env.FIX_WEBHOOK_REDEPLOY === '1') {
    await triggerDeployHook();
  }
}

main().catch((err) => {
  console.error('[fix-webhook] Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
