import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ProductService } from '@/domain/commerce/product-service';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  type: z.string().optional(),
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).optional(),
  summary: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  price: z.number().int().nonnegative().optional(),
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ProductService(db);

  try {
    const product = await service.getById(params.id);
    if (!product) return jsonError('Product not found', 404);
    return jsonOk({ product });
  } catch (err) {
    console.error('[commerce/products/[id]] GET error:', err);
    return jsonError('Failed to get product', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ProductService(db);

  try {
    const product = await service.update(params.id, parsed.data);
    return jsonOk({ product });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Product not found', 404);
    console.error('[commerce/products/[id]] PUT error:', err);
    return jsonError('Failed to update product', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ProductService(db);

  try {
    await service.delete(params.id);
    return jsonOk({ deleted: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Product not found', 404);
    console.error('[commerce/products/[id]] DELETE error:', err);
    return jsonError('Failed to delete product', 500);
  }
}