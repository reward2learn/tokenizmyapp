/**
 * Tenant Loading Graphic — POST / DELETE /api/admin/tenants/[slug]/loading-graphic
 *
 * Stores a URL or data-URI loading graphic on the tenant registry row.
 * Inner tenant apps inherit this unless they set their own app_settings override.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { createRawClient } from '@/lib/db';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { syncTenantLoadingGraphicToAppDb } from '@/domain/config/loading-graphic-resolver';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_LOADING_GRAPHIC_BYTES = 1024 * 1024;

function validateLoadingGraphicUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:')) {
    const comma = trimmed.indexOf(',');
    if (comma === -1) return 'Invalid data URI';
    const payload = trimmed.slice(comma + 1);
    try {
      const bytes = Buffer.from(payload, 'base64');
      if (bytes.length > MAX_LOADING_GRAPHIC_BYTES) {
        return `Loading graphic must be under ${MAX_LOADING_GRAPHIC_BYTES / 1024} KB`;
      }
    } catch {
      return 'Invalid base64 data URI';
    }
    return null;
  }
  if (trimmed.length > 50000) return 'URL is too long';
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { loadingGraphicUrl?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  if (typeof body.loadingGraphicUrl !== 'string' || !body.loadingGraphicUrl.trim()) {
    return jsonError('loadingGraphicUrl is required', 400);
  }

  const validationError = validateLoadingGraphicUrl(body.loadingGraphicUrl);
  if (validationError) return jsonError(validationError, 400);

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);
    await db.$executeRawUnsafe(
      `ALTER TABLE tenants ADD COLUMN IF NOT EXISTS loading_graphic_url TEXT;`,
    );
    await db.$executeRawUnsafe(
      `UPDATE tenants SET loading_graphic_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
      body.loadingGraphicUrl.trim(),
      slug,
    );
    await syncTenantLoadingGraphicToAppDb(slug, body.loadingGraphicUrl.trim());
    return jsonOk({ message: 'Loading graphic updated' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(`Failed to save loading graphic: ${msg}`, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);
    await db.$executeRawUnsafe(
      `UPDATE tenants SET loading_graphic_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`,
      slug,
    );
    await syncTenantLoadingGraphicToAppDb(slug, null);
    return jsonOk({ message: 'Loading graphic removed' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(`Failed to remove loading graphic: ${msg}`, 500);
  }
}
