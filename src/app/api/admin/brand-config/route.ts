/**
 * Admin Brand & Tenant Config API
 *
 * GET  /api/admin/brand-config
 *   Returns: full brand + tenant config
 *
 * PUT  /api/admin/brand-config   (multipart/form-data or JSON)
 *   Fields:
 *     tenantSlug         — subdomain slug (e.g. "redrubybali")
 *     tenantDisplayName  — human-readable name (e.g. "Red Ruby Bali")
 *     tenantTemplate     — template category (e.g. "nightclub-bar")
 *     brandLogoText      — text string for the header logo
 *     brandLogoUrl       — URL or base64 data-URI of the uploaded logo image
 *     brandPrimaryColor  — hex color
 *     brandSecondaryColor — hex color
 *     themeMode          — "light" | "dark" | "system"
 *   Returns: updated config
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createClientForUrl, createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getAppSettings, updateAppSettings } from '@/domain/config/app-settings-service';
import { resolveLoadingGraphic, syncTenantLoadingGraphicToAppDb } from '@/domain/config/loading-graphic-resolver';
import { getTenantConfig } from '@shared/lib/config/tenant';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';

/** Cross-tenant browsing is a platform-admin-only capability; ignored for
 * any other caller so a tenant's own admin panel keeps editing its own row. */
function resolveScope(request: Request, isPlatformAdmin: boolean): { tenantSlug: string; appId?: string } {
  const envTenant = getTenantConfig();
  if (!isPlatformAdmin) return { tenantSlug: envTenant.slug };
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug') ?? envTenant.slug;
  const appId = searchParams.get('appId') ?? undefined;
  return { tenantSlug, appId };
}

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const putSchema = z.object({
  tenantSlug: z.string().max(50).optional(),
  tenantDisplayName: z.string().max(100).optional(),
  tenantTemplate: z.string().max(50).optional(),
  brandLogoText: z.string().max(100).optional(),
  brandLogoUrl: z.string().max(50000).optional(), // base64 data-URIs can be large
  brandPrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #eb3d28').optional(),
  brandSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #0af9fe').optional(),
  brandLoadingGraphicUrl: z.string().max(500000).optional(),
  tenantLoadingGraphicUrl: z.string().max(500000).optional(),
  themeMode: z.enum(['light', 'dark', 'system']).optional(),
});

// ── GET ─────────────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { tenantSlug: scopeTenantSlug, appId } = resolveScope(request, true);
  // Tenants with their own dedicated database must be read there — see
  // tenant-db-resolver.ts. Falls back to the shared root connection when the
  // tenant has none (e.g. the platform's own root tenant).
  const dbUrl = await resolveDedicatedTenantDbUrl(scopeTenantSlug, appId);
  const db = dbUrl ? createClientForUrl(dbUrl) : createClient();
  let settings;
  let loadingGraphic;
  try {
    settings = await getAppSettings(db, scopeTenantSlug, appId);
    loadingGraphic = await resolveLoadingGraphic(db, scopeTenantSlug, appId);
  } finally {
    if (dbUrl) await db.$disconnect();
  }

  return jsonOk({
    tenantSlug: settings.tenantSlug,
    tenantDisplayName: settings.tenantDisplayName,
    tenantTemplate: settings.tenantTemplate,
    appId: settings.appId,
    brandLogoText: settings.brandLogoText,
    brandLogoUrl: settings.brandLogoUrl,
    brandPrimaryColor: settings.brandPrimaryColor,
    brandSecondaryColor: settings.brandSecondaryColor,
    brandLoadingGraphicUrl: loadingGraphic.brandLoadingGraphicUrl,
    tenantLoadingGraphicUrl: loadingGraphic.tenantLoadingGraphicUrl,
    loadingGraphicUrl: loadingGraphic.loadingGraphicUrl,
    themeMode: settings.themeMode,
    updatedAt: settings.updatedAt.toISOString(),
  });
}

// ── PUT (multipart or JSON) ─────────────────────────────

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const guard = await requireWriteAuth(request);
    if (!guard.ok) return guard.response;
    if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

    const scope = resolveScope(request, true);

    let tenantSlug: string | undefined;
    let tenantDisplayName: string | undefined;
    let tenantTemplate: string | undefined;
    let brandLogoText: string | undefined;
    let brandLogoUrl: string | undefined;
    let brandPrimaryColor: string | undefined;
    let brandSecondaryColor: string | undefined;
    let brandLoadingGraphicUrl: string | undefined;
    let tenantLoadingGraphicUrl: string | undefined;
    let themeMode: 'light' | 'dark' | 'system' | undefined;

    const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    // Handle file upload + text fields via FormData
    try {
      const formData = await request.formData();

      const slugField = formData.get('tenantSlug');
      if (slugField && typeof slugField === 'string') tenantSlug = slugField.trim();

      const nameField = formData.get('tenantDisplayName');
      if (nameField && typeof nameField === 'string') tenantDisplayName = nameField;

      const templateField = formData.get('tenantTemplate');
      if (templateField && typeof templateField === 'string') tenantTemplate = templateField;

      const textField = formData.get('brandLogoText');
      if (textField && typeof textField === 'string') brandLogoText = textField;

      const fileField = formData.get('brandLogo');
      if (fileField instanceof File && fileField.size > 0) {
        if (fileField.size > 2 * 1024 * 1024) {
          return jsonError('Logo image must be under 2 MB', 400);
        }
        const buffer = Buffer.from(await fileField.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mime = fileField.type || 'image/png';
        brandLogoUrl = `data:${mime};base64,${base64}`;
      }

      const urlField = formData.get('brandLogoUrl');
      if (urlField && typeof urlField === 'string' && urlField.trim()) {
        brandLogoUrl = urlField.trim();
      }

      const primaryField = formData.get('brandPrimaryColor');
      if (primaryField && typeof primaryField === 'string' && /^#[0-9a-fA-F]{6}$/.test(primaryField.trim())) {
        brandPrimaryColor = primaryField.trim();
      }

      const secondaryField = formData.get('brandSecondaryColor');
      if (secondaryField && typeof secondaryField === 'string' && /^#[0-9a-fA-F]{6}$/.test(secondaryField.trim())) {
        brandSecondaryColor = secondaryField.trim();
      }

      const loadingGraphicField = formData.get('brandLoadingGraphic');
      if (loadingGraphicField instanceof File && loadingGraphicField.size > 0) {
        if (loadingGraphicField.size > 1024 * 1024) {
          return jsonError('Loading graphic must be under 1 MB', 400);
        }
        const buffer = Buffer.from(await loadingGraphicField.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mime = loadingGraphicField.type || 'image/gif';
        brandLoadingGraphicUrl = `data:${mime};base64,${base64}`;
      }

      const loadingGraphicUrlField = formData.get('brandLoadingGraphicUrl');
      if (loadingGraphicUrlField !== null && typeof loadingGraphicUrlField === 'string') {
        brandLoadingGraphicUrl = loadingGraphicUrlField.trim();
      }

      const tenantLoadingGraphicField = formData.get('tenantLoadingGraphic');
      if (tenantLoadingGraphicField instanceof File && tenantLoadingGraphicField.size > 0) {
        if (tenantLoadingGraphicField.size > 1024 * 1024) {
          return jsonError('Loading graphic must be under 1 MB', 400);
        }
        const buffer = Buffer.from(await tenantLoadingGraphicField.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mime = tenantLoadingGraphicField.type || 'image/gif';
        tenantLoadingGraphicUrl = `data:${mime};base64,${base64}`;
      }

      const tenantLoadingGraphicUrlField = formData.get('tenantLoadingGraphicUrl');
      if (tenantLoadingGraphicUrlField !== null && typeof tenantLoadingGraphicUrlField === 'string') {
        tenantLoadingGraphicUrl = tenantLoadingGraphicUrlField.trim();
      }

      const themeField = formData.get('themeMode');
      if (themeField === 'light' || themeField === 'dark' || themeField === 'system') {
        themeMode = themeField;
      }
    } catch {
      return jsonError('Failed to parse multipart form data', 400);
    }
  } else {
    // Handle JSON body
    try {
      const body = await request.json();
      const parsed = putSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError('Invalid request body', 400);
      }
      tenantSlug = parsed.data.tenantSlug;
      tenantDisplayName = parsed.data.tenantDisplayName;
      tenantTemplate = parsed.data.tenantTemplate;
      brandLogoText = parsed.data.brandLogoText;
      brandLogoUrl = parsed.data.brandLogoUrl;
      brandPrimaryColor = parsed.data.brandPrimaryColor;
      brandSecondaryColor = parsed.data.brandSecondaryColor;
      brandLoadingGraphicUrl = parsed.data.brandLoadingGraphicUrl;
      tenantLoadingGraphicUrl = parsed.data.tenantLoadingGraphicUrl;
      themeMode = parsed.data.themeMode;
    } catch {
      return jsonError('Expected JSON or multipart/form-data body', 400);
    }
  }

  const dbUrl = await resolveDedicatedTenantDbUrl(scope.tenantSlug, scope.appId);
  const db = dbUrl ? createClientForUrl(dbUrl) : createClient();
  let settings;
  let loadingGraphic;
  try {
    if (tenantLoadingGraphicUrl !== undefined && !scope.appId) {
      const rootDb = createRawClient();
      await rootDb.$executeRawUnsafe(
        `ALTER TABLE tenants ADD COLUMN IF NOT EXISTS loading_graphic_url TEXT;`,
      );
      await rootDb.$executeRawUnsafe(
        `UPDATE tenants SET loading_graphic_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
        tenantLoadingGraphicUrl.trim() ? tenantLoadingGraphicUrl.trim() : null,
        scope.tenantSlug,
      );
      await syncTenantLoadingGraphicToAppDb(
        scope.tenantSlug,
        tenantLoadingGraphicUrl.trim() ? tenantLoadingGraphicUrl.trim() : null,
      );
    }

    settings = await updateAppSettings(db, {
      ...(tenantSlug !== undefined ? { tenantSlug } : {}),
      ...(tenantDisplayName !== undefined ? { tenantDisplayName } : {}),
      ...(tenantTemplate !== undefined ? { tenantTemplate } : {}),
      ...(brandLogoText !== undefined ? { brandLogoText } : {}),
      ...(brandLogoUrl !== undefined ? { brandLogoUrl } : {}),
      ...(brandPrimaryColor !== undefined ? { brandPrimaryColor } : {}),
      ...(brandSecondaryColor !== undefined ? { brandSecondaryColor } : {}),
      ...(brandLoadingGraphicUrl !== undefined && scope.appId ? { brandLoadingGraphicUrl } : {}),
      ...(themeMode !== undefined ? { themeMode } : {}),
    }, scope.tenantSlug, scope.appId);

    loadingGraphic = await resolveLoadingGraphic(db, scope.tenantSlug, scope.appId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('brand-config PUT error:', msg, err instanceof Error ? err.stack : '');
    return NextResponse.json(
      { success: false, error: msg, step: 'updateAppSettings' },
      { status: 500 },
    );
  } finally {
    if (dbUrl) await db.$disconnect();
  }

  return jsonOk({
    tenantSlug: settings.tenantSlug,
    tenantDisplayName: settings.tenantDisplayName,
    tenantTemplate: settings.tenantTemplate,
    appId: settings.appId,
    brandLogoText: settings.brandLogoText,
    brandLogoUrl: settings.brandLogoUrl,
    brandPrimaryColor: settings.brandPrimaryColor,
    brandSecondaryColor: settings.brandSecondaryColor,
    brandLoadingGraphicUrl: loadingGraphic.brandLoadingGraphicUrl,
    tenantLoadingGraphicUrl: loadingGraphic.tenantLoadingGraphicUrl,
    loadingGraphicUrl: loadingGraphic.loadingGraphicUrl,
    themeMode: settings.themeMode,
    updatedAt: settings.updatedAt.toISOString(),
  });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('brand-config PUT outer error:', msg, err instanceof Error ? err.stack : '');
    return NextResponse.json(
      { success: false, error: msg, step: 'outer' },
      { status: 500 },
    );
  }
}
