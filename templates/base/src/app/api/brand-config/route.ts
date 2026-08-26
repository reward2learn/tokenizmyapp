/**
 * Public Tenant Config API
 *
 * GET /api/brand-config
 *   Returns brand config including resolved loadingGraphicUrl.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { getAppSettings } from '@/domain/config/app-settings-service';
import { resolveLoadingGraphic } from '@/domain/config/loading-graphic-resolver';
import { getTenantConfig, getCurrentAppId } from '@shared/lib/config/tenant';
import { jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const envTenant = getTenantConfig();

  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return jsonOk({
      tenantSlug: envTenant.slug,
      tenantDisplayName: envTenant.displayName,
      tenantTemplate: 'default',
      brandLogoText: '',
      brandLogoUrl: '',
      brandPrimaryColor: '#eb3d28',
      brandSecondaryColor: '#0af9fe',
      loadingGraphicUrl: null,
      themeMode: 'system',
    });
  }

  try {
    const db = createClient();
    const appId = getCurrentAppId() || undefined;
    const settings = await getAppSettings(db, envTenant.slug, appId);
    const loadingGraphic = await resolveLoadingGraphic(db, envTenant.slug, appId);
    return jsonOk({
      tenantSlug: settings.tenantSlug || envTenant.slug,
      tenantDisplayName: settings.tenantDisplayName || envTenant.displayName,
      tenantTemplate: settings.tenantTemplate || 'default',
      brandLogoText: settings.brandLogoText,
      brandLogoUrl: settings.brandLogoUrl,
      brandPrimaryColor: settings.brandPrimaryColor,
      brandSecondaryColor: settings.brandSecondaryColor,
      loadingGraphicUrl: loadingGraphic.loadingGraphicUrl,
      themeMode: settings.themeMode || 'system',
    });
  } catch (err) {
    console.error('[brand-config] Failed to read:', err);
    return jsonOk({
      tenantSlug: envTenant.slug,
      tenantDisplayName: envTenant.displayName,
      tenantTemplate: 'default',
      brandLogoText: '',
      brandLogoUrl: '',
      brandPrimaryColor: '#eb3d28',
      brandSecondaryColor: '#0af9fe',
      loadingGraphicUrl: null,
      themeMode: 'system',
    });
  }
}
