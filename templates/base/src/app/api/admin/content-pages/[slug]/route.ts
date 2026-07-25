/**
 * Content Pages CRUD API — single page by slug.
 *
 * GET    /api/admin/content-pages/[slug]   — read one page
 * PUT    /api/admin/content-pages/[slug]   — update one page
 * DELETE /api/admin/content-pages/[slug]   — delete one page
 *
 * Requires write auth (pin | google tier).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ContentPageService } from '@/domain/content/content-page-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  format: z.enum(['html', 'markdown']).optional(),
  isPublished: z.boolean().optional(),
});

// ── GET (detail) ───────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ContentPageService(db);

  try {
    const page = await service.getBySlug(slug);
    if (!page) return jsonError('Content page not found', 404);
    return jsonOk({ page });
  } catch (err) {
    console.error(`[content-pages] GET /${slug} error:`, err);
    return jsonError('Failed to fetch content page', 500);
  }
}

// ── PUT (update) ───────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      'Validation error: ' + JSON.stringify(parsed.error.flatten()),
      400,
    );
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ContentPageService(db);

  try {
    const page = await service.update(slug, {
      ...parsed.data,
      updatedBy: guard.session.sub,
    });
    return jsonOk({ page });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Content page not found', 404);
    console.error(`[content-pages] PUT /${slug} error:`, err);
    return jsonError('Failed to update content page', 500);
  }
}

// ── DELETE ─────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ContentPageService(db);

  try {
    await service.delete(slug);
    return jsonOk({ deleted: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Content page not found', 404);
    console.error(`[content-pages] DELETE /${slug} error:`, err);
    return jsonError('Failed to delete content page', 500);
  }
}
