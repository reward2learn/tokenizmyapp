/**
 * Content Pages CRUD API — list & create.
 *
 * GET  /api/admin/content-pages        — list all content pages
 * POST /api/admin/content-pages        — create a new content page
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

const SLUG_REGEX = /^[a-z0-9-]+$/;

const createSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(SLUG_REGEX, 'Slug must be lowercase kebab-case (a-z, 0-9, hyphens)'),
  title: z.string().min(1).max(200),
  body: z.string(),
  format: z.enum(['html', 'markdown']).optional(),
  isPublished: z.boolean().optional(),
});

// ── GET (list) ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ContentPageService(db);

  try {
    const pages = await service.list();
    return jsonOk({ pages });
  } catch (err) {
    console.error('[content-pages] GET error:', err);
    return jsonError('Failed to list content pages', 500);
  }
}

// ── POST (create) ──────────────────────────────────────

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
    return jsonError(
      'Validation error: ' + JSON.stringify(parsed.error.flatten()),
      400,
    );
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new ContentPageService(db);

  try {
    const page = await service.create({
      ...parsed.data,
      updatedBy: guard.session.sub,
    });
    return jsonOk({ page }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/unique|duplicate|already exists/i.test(msg)) {
      return jsonError('A page with that slug already exists', 409);
    }
    console.error('[content-pages] POST error:', err);
    return jsonError('Failed to create content page', 500);
  }
}
