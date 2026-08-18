/**
 * Cards on file for an organization.
 *
 * GET    — list them
 * POST   — begin attaching one (returns a SetupIntent client secret)
 * PATCH  — make one the invoice default
 * DELETE — detach one
 *
 * Auth: requireWriteAuth + platform admin, matching the credits and checkout
 * routes. A stored card is the instrument every unattended charge runs on.
 *
 * ⚠️ No card data passes through here. The browser talks to Stripe directly
 * with the client secret; this server only ever sees Stripe's ids.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { requireStripeFor } from '@/lib/billing/stripe-client';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  createSetupIntent,
  listPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
  stripeReadiness,
} from '@/domain/billing/stripe-service';
import { resolveTenantStripeConfig } from '@/domain/billing/organization-service';

export const dynamic = 'force-dynamic';

const idSchema = z.object({ paymentMethodId: z.string().trim().min(1) });

async function guardOf(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const denied = await guardOf(request);
  if (denied) return denied;

  const { orgId } = await params;
  const db = createRawClient();
  // Tenant orgs use the tenant's own Stripe keys (saved in the wizard's
  // Organization & Billing step and pushed to the tenant app's Vercel env);
  // the factory's own env only serves the platform's own org.
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);
  const readiness = stripeReadiness(stripeConfig ?? undefined);
  // An empty list plus the reason, not a 500. Payments being unconfigured is a
  // deployment state the page should explain, not an error it should report.
  if (!readiness.hasSecretKey) {
    return jsonOk({ methods: [], readiness });
  }

  try {
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    return jsonOk({ methods: await listPaymentMethods(orgId, db, stripe), readiness });
  } catch (err) {
    return jsonError('Failed to list payment methods: ' + (err as Error).message, 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const denied = await guardOf(request);
  if (denied) return denied;

  const { orgId } = await params;
  const db = createRawClient();
  try {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    const { clientSecret } = await createSetupIntent(orgId, db, stripe);
    return jsonOk({
      clientSecret,
      publishableKey:
        stripeConfig?.publishableKey ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
    });
  } catch (err) {
    return jsonError('Could not start card setup: ' + (err as Error).message, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const denied = await guardOf(request);
  if (denied) return denied;

  const { orgId } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = idSchema.safeParse(body);
  if (!parsed.success) return jsonError('paymentMethodId is required', 400);

  const db = createRawClient();
  try {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    await setDefaultPaymentMethod(orgId, parsed.data.paymentMethodId, db, stripe);
    return jsonOk({ methods: await listPaymentMethods(orgId, db, stripe) });
  } catch (err) {
    return jsonError((err as Error).message, 400);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const denied = await guardOf(request);
  if (denied) return denied;

  const { orgId } = await params;
  const paymentMethodId = new URL(request.url).searchParams.get('paymentMethodId')?.trim();
  if (!paymentMethodId) return jsonError('paymentMethodId is required', 400);

  const db = createRawClient();
  try {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    await removePaymentMethod(orgId, paymentMethodId, db, stripe);
    return jsonOk({ methods: await listPaymentMethods(orgId, db, stripe) });
  } catch (err) {
    return jsonError((err as Error).message, 400);
  }
}
