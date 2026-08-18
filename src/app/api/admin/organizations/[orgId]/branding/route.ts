/**
 * Organization branding — logo, background, custom CSS.
 *
 * GET  /api/admin/organizations/[orgId]/branding
 *   Returns the current branding configuration.
 *
 * PATCH /api/admin/organizations/[orgId]/branding
 *   Body: { logoUrl?, backgroundImageUrl?, backgroundVideoUrl?, customCss? }
 *   Updates the branding configuration.
 *
 * Auth: requireWriteAuth + platform admin (or org member).
 */
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;
  const db = createRawClient();

  try {
    const org = await getOrganization(db, orgId);
    if (!org) return jsonError('Organization not found', 404);

    return jsonOk({
      logoUrl: org.logoUrl ?? null,
      backgroundImageUrl: org.backgroundImageUrl ?? null,
      backgroundVideoUrl: org.backgroundVideoUrl ?? null,
      customCss: org.customCss ?? null,
    });
  } catch (err) {
    return jsonError('Failed to read branding: ' + (err as Error).message, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;
  const db = createRawClient();

  try {
    const org = await getOrganization(db, orgId);
    if (!org) return jsonError('Organization not found', 404);

    const body = await request.json();
    const { logoUrl, backgroundImageUrl, backgroundVideoUrl, customCss } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if ('logoUrl' in body) {
      updates.push(`logo_url = $${updates.length + 1}`);
      values.push(logoUrl || null);
    }
    if ('backgroundImageUrl' in body) {
      updates.push(`background_image_url = $${updates.length + 1}`);
      values.push(backgroundImageUrl || null);
    }
    if ('backgroundVideoUrl' in body) {
      updates.push(`background_video_url = $${updates.length + 1}`);
      values.push(backgroundVideoUrl || null);
    }
    if ('customCss' in body) {
      updates.push(`custom_css = $${updates.length + 1}`);
      values.push(customCss || null);
    }

    if (updates.length === 0) {
      return jsonOk({ message: 'No changes' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(orgId);

    await db.$executeRawUnsafe(
      `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${values.length};`,
      ...values,
    );

    return jsonOk({ message: 'Branding updated' });
  } catch (err) {
    return jsonError('Failed to update branding: ' + (err as Error).message, 500);
  }
}
