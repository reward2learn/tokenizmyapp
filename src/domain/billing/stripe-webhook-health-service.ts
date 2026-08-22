/**
 * Stripe webhook health checklist — server-side equivalent of:
 *
 *   1. Dashboard snapshot destination at tokenizmyapp…/api/webhooks/stripe (7 events)
 *   2. Vercel STRIPE_WEBHOOK_SECRET is whsec_… (not Marketplace eyJ…)
 *   3. stripe trigger customer.subscription.updated (via Stripe API — no CLI on Vercel)
 *   4. POST signed customer.subscription.updated → HTTP 200 on the live endpoint
 *
 * Stripe CLI cannot run on Vercel serverless; step 3 updates a test subscription
 * through the Stripe API, which fires the same webhook Stripe CLI would.
 */
import type Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe-client';
import {
  FACTORY_VERCEL_PROJECT_ID,
  FACTORY_WEBHOOK_URL,
  testStripeWebhookForProject,
  type StripeWebhookTestStatus,
} from '@/domain/billing/stripe-webhook-test-service';
import {
  getProjectEnvValues,
} from '@/domain/tenant/vercel-stripe-marketplace-service';

export const REQUIRED_SNAPSHOT_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'payment_intent.succeeded',
] as const;

export type StripeWebhookHealthStep = {
  id: string;
  label: string;
  status: StripeWebhookTestStatus;
  ok: boolean;
  message: string;
};

export type StripeWebhookHealthResult = {
  ok: boolean;
  status: StripeWebhookTestStatus;
  steps: StripeWebhookHealthStep[];
  webhookUrl: string;
  /** Mirrors the signed POST probe for backward compatibility. */
  delivery: Awaited<ReturnType<typeof testStripeWebhookForProject>> | null;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function eventsCoverRequired(
  enabled: string[],
  required: readonly string[],
): { ok: boolean; missing: string[] } {
  if (enabled.includes('*')) return { ok: true, missing: [] };
  const set = new Set(enabled);
  const missing = required.filter((event) => !set.has(event));
  return { ok: missing.length === 0, missing };
}

function overallFromSteps(steps: StripeWebhookHealthStep[]): StripeWebhookTestStatus {
  if (steps.some((s) => s.status === 'fail')) return 'fail';
  if (steps.some((s) => s.status === 'warn')) return 'warn';
  return 'pass';
}

async function checkDashboardDestination(
  stripe: Stripe,
  webhookUrl: string,
): Promise<StripeWebhookHealthStep> {
  const label = 'Stripe Dashboard destination';
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const match = endpoints.data.find(
      (endpoint) => endpoint.url === webhookUrl && endpoint.status === 'enabled',
    );

    if (!match) {
      return {
        id: 'dashboard-destination',
        label,
        status: 'fail',
        ok: false,
        message:
          `No enabled webhook endpoint registered for ${webhookUrl}. ` +
          'Stripe Dashboard → Developers → Webhooks → Add destination (snapshot payload, 7 billing events).',
      };
    }

    const coverage = eventsCoverRequired(match.enabled_events, REQUIRED_SNAPSHOT_WEBHOOK_EVENTS);
    if (!coverage.ok) {
      return {
        id: 'dashboard-destination',
        label,
        status: 'warn',
        ok: false,
        message:
          `Endpoint ${match.id} is missing events: ${coverage.missing.join(', ')}. ` +
          'Subscribe to all 7 snapshot billing events listed in /api/webhooks/stripe.',
      };
    }

    return {
      id: 'dashboard-destination',
      label,
      status: 'pass',
      ok: true,
      message:
        `Snapshot destination ${match.id} at ${webhookUrl} — all 7 billing events subscribed.`,
    };
  } catch (err) {
    return {
      id: 'dashboard-destination',
      label,
      status: 'fail',
      ok: false,
      message: `Could not list Stripe webhook endpoints: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkVercelWebhookSecret(projectId: string): Promise<StripeWebhookHealthStep> {
  const label = 'Vercel STRIPE_WEBHOOK_SECRET';
  const envValues = await getProjectEnvValues(projectId, ['STRIPE_WEBHOOK_SECRET']);
  const raw = envValues.STRIPE_WEBHOOK_SECRET?.trim();

  if (!raw) {
    return {
      id: 'vercel-webhook-secret',
      label,
      status: 'fail',
      ok: false,
      message:
        'STRIPE_WEBHOOK_SECRET is missing on the tokenizmyapp Vercel project. ' +
        'Paste the Dashboard signing secret (whsec_…) in Organization & Billing → Save Changes.',
    };
  }

  if (raw.startsWith('whsec_')) {
    return {
      id: 'vercel-webhook-secret',
      label,
      status: 'pass',
      ok: true,
      message: 'Production env uses a Stripe webhook signing secret (whsec_…).',
    };
  }

  if (raw.startsWith('eyJ')) {
    return {
      id: 'vercel-webhook-secret',
      label,
      status: 'fail',
      ok: false,
      message:
        'Vercel has a Stripe Marketplace integration token (eyJ…), not whsec_…. ' +
        'Overwrite STRIPE_WEBHOOK_SECRET with the Signing secret from your Stripe snapshot destination.',
    };
  }

  return {
    id: 'vercel-webhook-secret',
    label,
    status: 'fail',
    ok: false,
    message:
      'STRIPE_WEBHOOK_SECRET on Vercel is not a webhook signing secret (expected whsec_ prefix).',
  };
}

/**
 * Stripe CLI `stripe trigger customer.subscription.updated` equivalent — mutates a
 * test subscription so Stripe delivers a real signed event to the dashboard URL.
 */
async function triggerSubscriptionUpdatedViaApi(stripe: Stripe): Promise<StripeWebhookHealthStep> {
  const label = 'Stripe delivery (customer.subscription.updated)';
  const before = Math.floor(Date.now() / 1000);

  let subId: string | undefined;
  const active = await stripe.subscriptions.list({ limit: 1, status: 'active' });
  subId = active.data[0]?.id;
  if (!subId) {
    const any = await stripe.subscriptions.list({ limit: 1 });
    subId = any.data[0]?.id;
  }

  if (!subId) {
    return {
      id: 'stripe-trigger',
      label,
      status: 'warn',
      ok: false,
      message:
        'No test subscription in this Stripe account to trigger an update. ' +
        'Complete one test checkout, or run `stripe trigger customer.subscription.updated` locally once to seed fixtures.',
    };
  }

  try {
    await stripe.subscriptions.update(subId, {
      metadata: { flightcheck_ping: String(Date.now()) },
    });
  } catch (err) {
    return {
      id: 'stripe-trigger',
      label,
      status: 'fail',
      ok: false,
      message: `Stripe API could not update subscription ${subId}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    await sleep(attempt === 0 ? 1500 : 1000);
    const events = await stripe.events.list({
      type: 'customer.subscription.updated',
      limit: 5,
    });
    const fresh = events.data.find((evt) => evt.created >= before - 2);
    if (!fresh) continue;

    if (fresh.pending_webhooks === 0) {
      return {
        id: 'stripe-trigger',
        label,
        status: 'pass',
        ok: true,
        message:
          `Stripe delivered ${fresh.id} to registered endpoints (pending_webhooks=0). ` +
          'Same path as `stripe trigger customer.subscription.updated`.',
      };
    }

    if (attempt === 11) {
      return {
        id: 'stripe-trigger',
        label,
        status: 'fail',
        ok: false,
        message:
          `${fresh.id} was created but ${fresh.pending_webhooks} webhook delivery(ies) still pending — ` +
          'check Stripe Dashboard → Webhooks → Event deliveries for HTTP 400/503.',
      };
    }
  }

  return {
    id: 'stripe-trigger',
    label,
    status: 'warn',
    ok: false,
    message:
      'Subscription updated but no recent customer.subscription.updated event appeared within 12s.',
  };
}

export async function runStripeWebhookHealthCheck(input: {
  projectId?: string | null;
  projectNameHint?: string | null;
  billingTarget?: boolean;
  allowFactoryFallback?: boolean;
  /** Skip Stripe API trigger when only verifying env + signed POST. */
  skipStripeTrigger?: boolean;
}): Promise<StripeWebhookHealthResult> {
  const webhookUrl = FACTORY_WEBHOOK_URL;
  const factoryProjectId = FACTORY_VERCEL_PROJECT_ID;
  const steps: StripeWebhookHealthStep[] = [];

  const stripe = getStripe();
  if (!stripe) {
    steps.push({
      id: 'dashboard-destination',
      label: 'Stripe Dashboard destination',
      status: 'fail',
      ok: false,
      message: 'STRIPE_SECRET_KEY is not configured on the factory deployment — cannot query Stripe Dashboard.',
    });
  } else {
    steps.push(await checkDashboardDestination(stripe, webhookUrl));
  }

  steps.push(await checkVercelWebhookSecret(factoryProjectId));

  const vercelSecretOk = steps.find((s) => s.id === 'vercel-webhook-secret')?.ok === true;
  if (stripe && vercelSecretOk && input.skipStripeTrigger !== true) {
    steps.push(await triggerSubscriptionUpdatedViaApi(stripe));
  } else if (input.skipStripeTrigger === true) {
    steps.push({
      id: 'stripe-trigger',
      label: 'Stripe delivery (customer.subscription.updated)',
      status: 'warn',
      ok: false,
      message: 'Skipped Stripe API trigger (cron quick mode).',
    });
  } else if (!vercelSecretOk) {
    steps.push({
      id: 'stripe-trigger',
      label: 'Stripe delivery (customer.subscription.updated)',
      status: 'warn',
      ok: false,
      message: 'Skipped — fix Vercel STRIPE_WEBHOOK_SECRET (whsec_…) before testing Stripe delivery.',
    });
  }

  const delivery = await testStripeWebhookForProject({
    projectId: input.projectId ?? factoryProjectId,
    projectNameHint: input.projectNameHint,
    billingTarget: input.billingTarget ?? true,
    allowFactoryFallback: input.allowFactoryFallback,
  });

  steps.push({
    id: 'webhook-endpoint',
    label: 'Webhook endpoint (HTTP 200)',
    status: delivery.status,
    ok: delivery.ok,
    message: delivery.message + (delivery.httpStatus != null ? ` · HTTP ${delivery.httpStatus}` : ''),
  });

  const status = overallFromSteps(steps);
  return {
    ok: status === 'pass',
    status,
    steps,
    webhookUrl,
    delivery,
  };
}
