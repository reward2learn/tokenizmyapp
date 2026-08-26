/**
 * Organization branding — logo, background, loading graphic, custom CSS.
 *
 * GET  /api/admin/organizations/[orgId]/branding
 *   Returns the current branding configuration.
 *
 * PATCH /api/admin/organizations/[orgId]/branding
 *   Body: { logoUrl?, backgroundImageUrl?, backgroundVideoUrl?, loadingGraphicUrl?, customCss? }
 *   Updates the branding configuration.
 *
 * Auth: platform admin on factory, or signed-in tenant user for their org.
 */
import { createRawClient } from '@/lib/db';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import { requireOrgBrandingAccess } from '@/lib/auth/branding-guards';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const guard = await requireOrgBrandingAccess(request, orgId);
  if (!guard.ok) return guard.response;

  const db = createRawClient();

  try {
    const org = await getOrganization(db, orgId);
    if (!org) return jsonError('Organization not found', 404);

    return jsonOk({
      logoUrl: org.logoUrl ?? null,
      backgroundImageUrl: org.backgroundImageUrl ?? null,
      backgroundVideoUrl: org.backgroundVideoUrl ?? null,
      loadingGraphicUrl: org.loadingGraphicUrl ?? null,
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
  const { orgId } = await params;
  const guard = await requireOrgBrandingAccess(request, orgId);
  if (!guard.ok) return guard.response;

  const db = createRawClient();

  try {
    const org = await getOrganization(db, orgId);
    if (!org) return jsonError('Organization not found', 404);

    const body = await request.json();
    const { logoUrl, backgroundImageUrl, backgroundVideoUrl, loadingGraphicUrl, customCss } = body;

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
    if ('loadingGraphicUrl' in body) {
      updates.push(`loading_graphic_url = $${updates.length + 1}`);
      values.push(loadingGraphicUrl || null);
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
