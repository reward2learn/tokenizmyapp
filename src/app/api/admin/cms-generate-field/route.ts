/**
 * POST /api/admin/cms-generate-field
 * Generate a single CMS block config field with the active AI provider.
 */

import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveActiveAiConfig } from '@/lib/ai-providers';
import { generateCmsFieldValue } from '@/domain/ai-content/cms-field-generator';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { normalizeCmsScope } from '@shared/lib/cms-scope';
import { ensureHeroNavRoutes } from '@/domain/cms/ensure-hero-nav-routes';
import { resolvePage } from '@/lib/page-catalog';
import { CREDIT_FLOORS, requireCreditsForTenant } from '@/domain/billing/credit-service';
import type { CmsFieldValueType } from '@/lib/cms-block-field-catalog';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { PrismaClient } from '@/generated/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  pageSlug: z.string().min(1).max(120),
  pageTitle: z.string().min(1).max(200),
  blockType: z.string().min(1).max(80),
  fieldKey: z.string().min(1).max(80),
  fieldPath: z.string().max(120).optional(),
  fieldType: z.string().max(40).optional(),
  currentConfig: z.record(z.unknown()).default({}),
  currentValue: z.unknown().optional(),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

function catalogResolver(slug: string) {
  const page = resolvePage(slug);
  if (!page) return null;
  return {
    slug: page.slug,
    title: page.title,
    authTier: page.authTier,
    navLabel: page.navLabel ?? page.title,
    showInNav: page.showInNav,
    sections: page.sections.map((s) => ({
      blockType: s.blockType,
      config: s.config as Record<string, unknown>,
    })),
  };
}

export async function POST(request: Request) {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Invalid request body', 400);
  }

  const db = createClient();
  const ai = await resolveActiveAiConfig(undefined, db);
  if (!ai) {
    return jsonError('No AI provider configured. Set up AI in Config → AI Provider.', 503);
  }

  const cmsScope = normalizeCmsScope({
    tenantSlug: body.tenantSlug ?? getTenantConfig().slug,
    appId: body.appId ?? (getCurrentAppId() || undefined),
  });

  if (ai.keySource === 'env') {
    const gate = await requireCreditsForTenant(
      cmsScope.deploymentSlug,
      undefined,
      auth.session.email,
      CREDIT_FLOORS.contentGeneration,
    );
    if (!gate.ok) {
      return gate.response;
    }
  }

  try {
    const value = await generateCmsFieldValue({
      pageSlug: body.pageSlug,
      pageTitle: body.pageTitle,
      blockType: body.blockType,
      fieldKey: body.fieldKey,
      fieldPath: body.fieldPath,
      fieldType: body.fieldType as CmsFieldValueType | undefined,
      currentConfig: body.currentConfig,
      currentValue: body.currentValue,
      ai,
      tenantSlug: cmsScope.deploymentSlug,
    });

    const fieldType = body.fieldType ?? body.fieldKey;
    if (
      body.blockType === 'hero' &&
      (fieldType === 'nav_buttons' || body.fieldKey === 'navButtons') &&
      Array.isArray(value)
    ) {
      const dbUrl = await resolveTenantDbUrl(cmsScope.tenantSlug, cmsScope.appId);
      const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
      try {
        await addTenantColumnsIfMissing(prisma);
        await ensureHeroNavRoutes(prisma, value as { label: string; href: string }[], {
          tenantSlug: cmsScope.deploymentSlug,
          appId: cmsScope.appId,
          resolveCatalogPage: catalogResolver,
        });
      } finally {
        await prisma.$disconnect();
      }
    }

    return jsonOk({ value });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'AI generation failed', 500);
  }
}
