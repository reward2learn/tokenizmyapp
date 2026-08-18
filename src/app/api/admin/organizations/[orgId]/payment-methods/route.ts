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
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  createSetupIntent,
  listPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
  stripeReadiness,
} from '@/domain/billing/stripe-service';

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

  const readiness = stripeReadiness();
  // An empty list plus the reason, not a 500. Payments being unconfigured is a
  // deployment state the page should explain, not an error it should report.
  if (!readiness.hasSecretKey) {
    return jsonOk({ methods: [], readiness });
  }

  const { orgId } = await params;
  try {
    return jsonOk({ methods: await listPaymentMethods(orgId), readiness });
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
  try {
    const { clientSecret } = await createSetupIntent(orgId);
    return jsonOk({
      clientSecret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
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

  try {
    await setDefaultPaymentMethod(orgId, parsed.data.paymentMethodId);
    return jsonOk({ methods: await listPaymentMethods(orgId) });
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

  try {
    await removePaymentMethod(orgId, paymentMethodId);
    return jsonOk({ methods: await listPaymentMethods(orgId) });
  } catch (err) {
    return jsonError((err as Error).message, 400);
  }
}
