/**
 * Personal cards on file (AI credit top-ups).
 *
 * GET    — list them
 * POST   — begin attaching one (returns a SetupIntent client secret)
 * PATCH  — make one the invoice default on the user customer
 * DELETE — detach one
 *
 * Auth: requireWriteAuth + a real `user_accounts` row for the session.
 * Any signed-in user manages **their** cards — not platform-admin-only.
 *
 * `orgId` is query/body only to resolve tenant Stripe keys (same path as topup).
 * This route never lists or mutates the org Stripe customer.
 *
 * ⚠️ No card data passes through here. The browser talks to Stripe directly
 * with the client secret; this server only ever sees Stripe's ids.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { resolveViewerUserId } from '@/lib/auth/resolve-viewer-user';
import { requireStripeFor } from '@/lib/billing/stripe-client';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  createUserSetupIntent,
  listUserPaymentMethods,
  removeUserPaymentMethod,
  setUserDefaultPaymentMethod,
  stripeReadiness,
} from '@/domain/billing/stripe-service';
import { resolveTenantStripeConfig } from '@/domain/billing/organization-service';

export const dynamic = 'force-dynamic';

const idSchema = z.object({ paymentMethodId: z.string().trim().min(1) });

async function resolveAuthedUser(request: Request): Promise<
  | { ok: true; userId: string; email: string | null; name: string | null }
  | { ok: false; response: NextResponse }
> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return { ok: false, response: guard.response };

  const userId = await resolveViewerUserId(guard.session.sub);
  if (!userId) {
    return { ok: false, response: jsonError('No user account for this session', 404) };
  }

  return {
    ok: true,
    userId,
    email: typeof guard.session.email === 'string' ? guard.session.email : null,
    name: typeof guard.session.name === 'string' ? guard.session.name : null,
  };
}

function orgIdFrom(request: Request, body?: Record<string, unknown>): string | null {
  const fromQuery = new URL(request.url).searchParams.get('orgId')?.trim();
  if (fromQuery) return fromQuery;
  const fromBody = body?.orgId;
  return typeof fromBody === 'string' && fromBody.trim() ? fromBody.trim() : null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await resolveAuthedUser(request);
  if (!auth.ok) return auth.response;

  const orgId = orgIdFrom(request);
  if (!orgId) return jsonError('orgId is required', 400);

  const db = createRawClient();
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);
  const readiness = stripeReadiness(stripeConfig ?? undefined);
  if (!readiness.hasSecretKey) {
    return jsonOk({ methods: [], readiness });
  }

  try {
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    return jsonOk({
      methods: await listUserPaymentMethods(auth.userId, db, stripe),
      readiness,
    });
  } catch (err) {
    return jsonError('Failed to list payment methods: ' + (err as Error).message, 500);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await resolveAuthedUser(request);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    // orgId may still come from the query string
  }

  const orgId = orgIdFrom(request, body);
  if (!orgId) return jsonError('orgId is required', 400);

  const db = createRawClient();
  try {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    const { clientSecret } = await createUserSetupIntent(
      auth.userId,
      { email: auth.email, name: auth.name, orgId },
      db,
      stripe,
    );
    return jsonOk({
      clientSecret,
      publishableKey:
        stripeConfig?.publishableKey ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
    });
  } catch (err) {
    return jsonError('Could not start card setup: ' + (err as Error).message, 500);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const auth = await resolveAuthedUser(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = idSchema.safeParse(body);
  if (!parsed.success) return jsonError('paymentMethodId is required', 400);

  const orgId = orgIdFrom(
    request,
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : undefined,
  );
  if (!orgId) return jsonError('orgId is required', 400);

  const db = createRawClient();
  try {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    await setUserDefaultPaymentMethod(auth.userId, parsed.data.paymentMethodId, db, stripe);
    return jsonOk({ methods: await listUserPaymentMethods(auth.userId, db, stripe) });
  } catch (err) {
    return jsonError((err as Error).message, 400);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const auth = await resolveAuthedUser(request);
  if (!auth.ok) return auth.response;

  const paymentMethodId = new URL(request.url).searchParams.get('paymentMethodId')?.trim();
  if (!paymentMethodId) return jsonError('paymentMethodId is required', 400);

  const orgId = orgIdFrom(request);
  if (!orgId) return jsonError('orgId is required', 400);

  const db = createRawClient();
  try {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    await removeUserPaymentMethod(auth.userId, paymentMethodId, db, stripe);
    return jsonOk({ methods: await listUserPaymentMethods(auth.userId, db, stripe) });
  } catch (err) {
    return jsonError((err as Error).message, 400);
  }
}
