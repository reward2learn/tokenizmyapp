/**
 * GET/PUT /api/admin/billing/catalog-prices
 * Platform-admin catalog USD overrides.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  getBillingCatalog,
  upsertCatalogPrices,
} from '@/domain/billing/catalog-price-service';
import { findPriceMismatches } from '@/domain/billing/stripe-service';
import { catalogStripeEnvConfig } from '@/domain/billing/catalog-price-service';

export const dynamic = 'force-dynamic';

const faceSchema = z.object({
  monthlyCents: z.number().int().min(0),
  yearlyCents: z.number().int().min(0),
});

const putSchema = z.object({
  confirm: z.literal(true),
  plans: z
    .object({
      free: faceSchema.optional(),
      pro: faceSchema.optional(),
      business: faceSchema.optional(),
    })
    .optional(),
  packs: z
    .object({
      'pack-25': z.number().int().min(0).optional(),
      'pack-50': z.number().int().min(0).optional(),
      'pack-100': z.number().int().min(0).optional(),
    })
    .optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const record = await getBillingCatalog();
  const { prices, catalog } = await catalogStripeEnvConfig();
  let mismatches: string[] = [];
  try {
    const found = await findPriceMismatches(
      { prices },
      {
        free: {
          priceMonthly: catalog.plans.free.monthlyCents,
          priceYearly: catalog.plans.free.yearlyCents,
        },
        pro: {
          priceMonthly: catalog.plans.pro.monthlyCents,
          priceYearly: catalog.plans.pro.yearlyCents,
        },
        business: {
          priceMonthly: catalog.plans.business.monthlyCents,
          priceYearly: catalog.plans.business.yearlyCents,
        },
      },
    );
    mismatches = found.map((m) => m.message);
  } catch {
    mismatches = [];
  }

  return jsonOk({ ...record, stripeDrift: mismatches });
}

export async function PUT(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}. Explicit confirm: true required.`,
      400,
    );
  }

  const actor = String(guard.session.sub ?? guard.session.email ?? 'platform-admin');
  try {
    const record = await upsertCatalogPrices({
      confirm: true,
      updatedBy: actor,
      plans: parsed.data.plans,
      packs: parsed.data.packs,
      notes: parsed.data.notes,
    });
    return jsonOk(record);
  } catch (err) {
    return jsonError(
      `Catalog update failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
