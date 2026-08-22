/**
 * Stripe webhook flight-check — signs a snapshot customer.subscription.updated
 * event with the project's Vercel STRIPE_WEBHOOK_SECRET and POSTs it to the
 * live *.vercel.app deployment.
 *
 * Never returns secret values — only key names, HTTP status, and messages.
 */
import Stripe from 'stripe';
import {
  getProjectEnvValues,
  getVercelProjectName,
  listProjectEnvKeyNames,
} from '@/domain/tenant/vercel-stripe-marketplace-service';
import { getVercelClient, TEAM_ID, withTeamId404Null } from '@/domain/tenant/vercel-sdk-client';

/** Factory control-plane project (tokenizmyapp.vercel.app billing webhooks). */
export const FACTORY_VERCEL_PROJECT_ID =
  process.env.VERCEL_PROJECT_ID?.trim() || 'prj_ia654I3nS8CWUu6uA57oSKDR01IE';

export const FACTORY_WEBHOOK_URL = 'https://tokenizmyapp.vercel.app/api/webhooks/stripe';

export type StripeWebhookTestStatus = 'pass' | 'fail' | 'warn';

export type StripeWebhookTestResult = {
  status: StripeWebhookTestStatus;
  ok: boolean;
  message: string;
  webhookUrl: string;
  httpStatus: number | null;
  eventType: string;
  eventId: string;
  /** Which Vercel project supplied the signing secret. */
  secretsProjectId: string;
  /** true when the app URL had no route and factory billing URL was used. */
  usedFactoryFallback: boolean;
  env: {
    secretKeyPresent: boolean;
    webhookSecretPresent: boolean;
    publishableKeyPresent: boolean;
    priceKeyCount: number;
    stripeKeyNames: string[];
  };
  responseSnippet?: string;
};

const TEST_EVENT_TYPE = 'customer.subscription.updated';

function stripeKeyNames(keys: string[]): string[] {
  return keys
    .filter((k) => k.startsWith('STRIPE_') || k.startsWith('NEXT_PUBLIC_STRIPE_'))
    .sort();
}

function countPriceKeys(keys: string[]): number {
  return keys.filter((k) => k.startsWith('STRIPE_PRICE_')).length;
}

function buildTestEvent(eventId: string): Stripe.Event {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: eventId,
    object: 'event',
    api_version: '2026-07-29.dahlia',
    created: now,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: TEST_EVENT_TYPE,
    data: {
      object: {
        id: 'sub_flightcheck_test',
        object: 'subscription',
        customer: 'cus_flightcheck_test',
        status: 'active',
        metadata: {},
        items: {
          object: 'list',
          data: [],
          has_more: false,
          url: '/v1/subscription_items?subscription=sub_flightcheck_test',
        },
      } as unknown as Stripe.Subscription,
    },
  };
}

async function resolveProjectIdByName(name: string): Promise<string | null> {
  try {
    const client = await getVercelClient();
    const project = await withTeamId404Null((teamId) =>
      client.projects.getProject({ idOrName: name, teamId }),
    );
    return project?.id ?? null;
  } catch {
    return null;
  }
}

function webhookUrlForProjectName(projectName: string): string {
  return `https://${projectName}.vercel.app/api/webhooks/stripe`;
}

async function postSignedTestEvent(input: {
  webhookUrl: string;
  webhookSecret: string;
  eventId: string;
}): Promise<{ httpStatus: number; body: string }> {
  const event = buildTestEvent(input.eventId);
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: input.webhookSecret,
  });

  const res = await fetch(input.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
    },
    body: payload,
  });
  const body = await res.text().catch(() => '');
  return { httpStatus: res.status, body: body.slice(0, 500) };
}

/** Exported for unit tests — maps deployment HTTP response to flight-check verdict. */
export function interpretStripeWebhookHttpStatus(httpStatus: number, body: string): {
  status: StripeWebhookTestStatus;
  ok: boolean;
  message: string;
} {
  if (httpStatus === 200) {
    return {
      status: 'pass',
      ok: true,
      message:
        `Webhook accepted (${TEST_EVENT_TYPE}) — HTTP 200. ` +
        'Signature verified; check Vercel logs for [stripe-webhook].',
    };
  }
  if (httpStatus === 400 && /signature/i.test(body)) {
    return {
      status: 'fail',
      ok: false,
      message:
        'HTTP 400 — signature verification failed. STRIPE_WEBHOOK_SECRET on Vercel ' +
        'does not match the Stripe snapshot destination whsec_ for this URL.',
    };
  }
  if (httpStatus === 503) {
    return {
      status: 'fail',
      ok: false,
      message:
        'HTTP 503 — Stripe not configured on this deployment (missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET).',
    };
  }
  if (httpStatus === 404) {
    return {
      status: 'fail',
      ok: false,
      message:
        'HTTP 404 — /api/webhooks/stripe is not deployed on this app. ' +
        'Factory billing uses https://tokenizmyapp.vercel.app/api/webhooks/stripe.',
    };
  }
  return {
    status: httpStatus >= 500 ? 'warn' : 'fail',
    ok: false,
    message: `HTTP ${httpStatus} — ${body.slice(0, 200) || 'unexpected response'}`,
  };
}

export async function testStripeWebhookForProject(input: {
  projectId: string | null;
  /** Used when projectId is unknown (pre-deploy wizard). */
  projectNameHint?: string | null;
  /** When true, test factory billing URL if app URL returns 404. */
  allowFactoryFallback?: boolean;
}): Promise<StripeWebhookTestResult> {
  const eventId = `evt_flightcheck_${Date.now().toString(36)}`;
  let projectId = input.projectId?.trim() || null;
  let projectName = input.projectNameHint?.trim() || null;

  if (!projectId && projectName) {
    projectId = await resolveProjectIdByName(projectName);
  }
  if (projectId && !projectName) {
    projectName = await getVercelProjectName(projectId);
  }

  if (!projectId) {
    return {
      status: 'warn',
      ok: false,
      message: projectName
        ? `Vercel project "${projectName}" not found yet — deploy the app first, then re-run this test.`
        : 'No Vercel project linked — deploy the app first, then re-run this test.',
      webhookUrl: projectName ? webhookUrlForProjectName(projectName) : FACTORY_WEBHOOK_URL,
      httpStatus: null,
      eventType: TEST_EVENT_TYPE,
      eventId,
      secretsProjectId: '',
      usedFactoryFallback: false,
      env: {
        secretKeyPresent: false,
        webhookSecretPresent: false,
        publishableKeyPresent: false,
        priceKeyCount: 0,
        stripeKeyNames: [],
      },
    };
  }

  const keyNames = await listProjectEnvKeyNames(projectId);
  const stripeKeys = stripeKeyNames(keyNames);
  const envValues = await getProjectEnvValues(projectId, [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]);

  const secretKeyPresent = Boolean(envValues.STRIPE_SECRET_KEY?.trim());
  const webhookSecretPresent = Boolean(envValues.STRIPE_WEBHOOK_SECRET?.trim());
  const publishableKeyPresent = Boolean(envValues.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const priceKeyCount = countPriceKeys(keyNames);

  const envBlock = {
    secretKeyPresent,
    webhookSecretPresent,
    publishableKeyPresent,
    priceKeyCount,
    stripeKeyNames: stripeKeys,
  };

  if (!webhookSecretPresent) {
    return {
      status: 'fail',
      ok: false,
      message:
        'STRIPE_WEBHOOK_SECRET is missing on this Vercel project. ' +
        'Push it via Organization & Billing → Save, or register a snapshot destination in Stripe.',
      webhookUrl: projectName ? webhookUrlForProjectName(projectName) : FACTORY_WEBHOOK_URL,
      httpStatus: null,
      eventType: TEST_EVENT_TYPE,
      eventId,
      secretsProjectId: projectId,
      usedFactoryFallback: false,
      env: envBlock,
    };
  }

  const webhookSecret = envValues.STRIPE_WEBHOOK_SECRET!.trim();
  const primaryUrl = projectName ? webhookUrlForProjectName(projectName) : FACTORY_WEBHOOK_URL;

  let webhookUrl = primaryUrl;
  let secretsProjectId = projectId;
  let usedFactoryFallback = false;

  let attempt = await postSignedTestEvent({
    webhookUrl: primaryUrl,
    webhookSecret,
    eventId,
  });

  if (
    attempt.httpStatus === 404
    && input.allowFactoryFallback !== false
    && primaryUrl !== FACTORY_WEBHOOK_URL
  ) {
    const factoryEnv = await getProjectEnvValues(FACTORY_VERCEL_PROJECT_ID, ['STRIPE_WEBHOOK_SECRET']);
    const factorySecret = factoryEnv.STRIPE_WEBHOOK_SECRET?.trim();
    if (factorySecret) {
      webhookUrl = FACTORY_WEBHOOK_URL;
      secretsProjectId = FACTORY_VERCEL_PROJECT_ID;
      usedFactoryFallback = true;
      attempt = await postSignedTestEvent({
        webhookUrl: FACTORY_WEBHOOK_URL,
        webhookSecret: factorySecret,
        eventId,
      });
    }
  }

  const verdict = interpretStripeWebhookHttpStatus(attempt.httpStatus, attempt.body);
  let message = verdict.message;
  if (usedFactoryFallback && verdict.ok) {
    message +=
      ' (App template has no webhook route — verified factory billing endpoint at tokenizmyapp.vercel.app.)';
  }
  if (verdict.ok && priceKeyCount === 0) {
    message += ' Note: no STRIPE_PRICE_* keys on this project — subscription checkout may still fail.';
  }

  return {
    status: verdict.status,
    ok: verdict.ok,
    message,
    webhookUrl,
    httpStatus: attempt.httpStatus,
    eventType: TEST_EVENT_TYPE,
    eventId,
    secretsProjectId,
    usedFactoryFallback,
    env: envBlock,
    responseSnippet: attempt.body || undefined,
  };
}
