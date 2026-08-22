/**
 * Stripe webhook flight-check — signs a snapshot customer.subscription.updated
 * event with the project's Vercel STRIPE_WEBHOOK_SECRET and POSTs it to the
 * live *.vercel.app deployment.
 *
 * Never returns secret values — only key names, HTTP status, and messages.
 */
import Stripe from 'stripe';
import {
  diagnoseWebhookSigningSecretEnv,
  getProjectEnvValues,
  getVercelProjectName,
  isStripeMarketplaceIntegrationToken,
  listProjectEnvKeyNames,
  TOKENIZ_SNAPSHOT_WHSEC_KEY,
  SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS,
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
        'HTTP 400 — signature verification failed. The STRIPE_WEBHOOK_SECRET on the ' +
        'deployment does not match the signing secret (whsec_…) for the Stripe snapshot ' +
        'destination registered at this URL. Copy the destination signing secret from ' +
        'Stripe → Developers → Webhooks and update Vercel STRIPE_WEBHOOK_SECRET, then Save ' +
        'in Organization & Billing if you push keys from the tenant wizard.',
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
  /**
   * When true, skip the app URL and test factory billing directly
   * (https://tokenizmyapp.vercel.app/api/webhooks/stripe).
   */
  billingTarget?: boolean;
  /** Tenant metadata whsec_ — used for signed POST when Vercel API shows encrypted envelopes. */
  metadataWebhookSecret?: string | null;
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
    TOKENIZ_SNAPSHOT_WHSEC_KEY,
    'STRIPE_SNAPSHOT_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]);

  const useBillingTarget =
    input.billingTarget === true
    || projectName === 'tokenizmyapp'
    || projectId === FACTORY_VERCEL_PROJECT_ID;

  const signingProjectId = useBillingTarget ? FACTORY_VERCEL_PROJECT_ID : projectId;
  const signingEnvValues =
    signingProjectId === projectId
      ? envValues
      : await getProjectEnvValues(signingProjectId, [
          'STRIPE_WEBHOOK_SECRET',
          TOKENIZ_SNAPSHOT_WHSEC_KEY,
          'STRIPE_SNAPSHOT_WEBHOOK_SECRET',
        ]);

  const signingDiagnostic = await diagnoseWebhookSigningSecretEnv(signingProjectId).catch(() => null);

  const metaWhsec = input.metadataWebhookSecret?.trim();
  const envWhsec =
    signingEnvValues[TOKENIZ_SNAPSHOT_WHSEC_KEY]?.trim() ||
    signingEnvValues.STRIPE_SNAPSHOT_WEBHOOK_SECRET?.trim() ||
    signingEnvValues.STRIPE_WEBHOOK_SECRET?.trim();

  let resolvedSigningSecret =
    metaWhsec?.startsWith('whsec_')
      ? metaWhsec
      : envWhsec?.startsWith('whsec_')
        ? envWhsec
        : null;

  if (!resolvedSigningSecret && signingDiagnostic?.selectedPrefix === 'whsec' && metaWhsec?.startsWith('whsec_')) {
    resolvedSigningSecret = metaWhsec;
  }

  const secretKeyPresent = Boolean(envValues.STRIPE_SECRET_KEY?.trim());
  const webhookSecretPresent =
    Boolean(resolvedSigningSecret) || signingDiagnostic?.selectedPrefix === 'whsec';
  const publishableKeyPresent = Boolean(envValues.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const priceKeyCount = countPriceKeys(keyNames);

  const envBlock = {
    secretKeyPresent,
    webhookSecretPresent,
    publishableKeyPresent,
    priceKeyCount,
    stripeKeyNames: stripeKeys,
  };

  if (!webhookSecretPresent || !resolvedSigningSecret) {
    const rawMarketplace = signingEnvValues.STRIPE_WEBHOOK_SECRET?.trim();
    const marketplaceOnly =
      rawMarketplace && isStripeMarketplaceIntegrationToken(rawMarketplace) && !signingDiagnostic?.selectedPrefix;
    return {
      status: 'fail',
      ok: false,
      message: marketplaceOnly
        ? 'STRIPE_WEBHOOK_SECRET on Vercel is a Vercel Stripe Marketplace token (starts with eyJ…), ' +
          'not a Stripe webhook signing secret (whsec_…). Push TOKENIZ_SNAPSHOT_WHSEC via Organization & Billing → Save Changes.'
        : 'STRIPE_WEBHOOK_SECRET is missing on this Vercel project. ' +
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

  const primaryUrl = useBillingTarget
    ? FACTORY_WEBHOOK_URL
    : projectName
      ? webhookUrlForProjectName(projectName)
      : FACTORY_WEBHOOK_URL;

  const signingSecret = resolvedSigningSecret;
  let webhookUrl = primaryUrl;
  let secretsProjectId = signingProjectId;
  let usedFactoryFallback = useBillingTarget && projectId !== FACTORY_VERCEL_PROJECT_ID;

  let attempt = await postSignedTestEvent({
    webhookUrl: primaryUrl,
    webhookSecret: signingSecret,
    eventId,
  });

  if (
    attempt.httpStatus === 404
    && input.allowFactoryFallback !== false
    && primaryUrl !== FACTORY_WEBHOOK_URL
  ) {
    const factoryEnv = await getProjectEnvValues(FACTORY_VERCEL_PROJECT_ID, [
      'STRIPE_WEBHOOK_SECRET',
      TOKENIZ_SNAPSHOT_WHSEC_KEY,
      'STRIPE_SNAPSHOT_WEBHOOK_SECRET',
    ]);
    const factorySecret =
      metaWhsec?.startsWith('whsec_')
        ? metaWhsec
        : factoryEnv[TOKENIZ_SNAPSHOT_WHSEC_KEY]?.trim()?.startsWith('whsec_')
          ? factoryEnv[TOKENIZ_SNAPSHOT_WHSEC_KEY]!.trim()
          : factoryEnv.STRIPE_SNAPSHOT_WEBHOOK_SECRET?.trim()?.startsWith('whsec_')
            ? factoryEnv.STRIPE_SNAPSHOT_WEBHOOK_SECRET!.trim()
            : factoryEnv.STRIPE_WEBHOOK_SECRET?.trim()?.startsWith('whsec_')
              ? factoryEnv.STRIPE_WEBHOOK_SECRET!.trim()
              : null;
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
