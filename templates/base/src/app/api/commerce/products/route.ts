import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ProductService } from '@/domain/commerce/product-service';

export const dynamic = 'force-dynamic';

const listSchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

const createSchema = z.object({
  type: z.string().optional(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  summary: z.string().min(1).max(500),
  description: z.string(),
  price: z.number().int().nonnegative(),
  currency: z.string().optional(),
  compareAtPrice: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  stockCount: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ProductService(db);

  const { searchParams } = new URL(request.url);
  const params = listSchema.safeParse(Object.fromEntries(searchParams));
  if (!params.success) {
    return jsonError('Invalid query parameters', 400);
  }

  try {
    const products = await service.list(params.data);
    return jsonOk({ products });
  } catch (err) {
    console.error('[commerce/products] GET error:', err);
    return jsonError('Failed to list products', 500);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ProductService(db);

  try {
    const product = await service.create(parsed.data);
    return jsonOk({ product }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/unique|duplicate|already exists/i.test(msg)) {
      return jsonError('A product with that slug already exists', 409);
    }
    console.error('[commerce/products] POST error:', err);
    return jsonError('Failed to create product', 500);
  }
}