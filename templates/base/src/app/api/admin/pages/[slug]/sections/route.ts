/**
 * Admin Page Sections CRUD — edit page_sections.config (CMS for block copy).
 *
 * GET    /api/admin/pages/[slug]/sections
 * POST   /api/admin/pages/[slug]/sections — create section
 * PUT    /api/admin/pages/[slug]/sections — batch update
 * DELETE /api/admin/pages/[slug]/sections?ids=...
 *
 * Gated by pages:read (GET) and pages:write (mutations).
 * Any successful write sets app_pages.content_locked = true.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { getCmsTenantAppScope } from '@shared/lib/cms-scope';
import { resolveAppPageRow } from '@shared/lib/page-cms-resolve';
import { type BlockType, PrismaClient } from '@/generated/prisma';
import { requireRead, requireWrite, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensurePageCmsColumns, getPageCmsClient } from '@/lib/page-cms-db';
import {
  PAGE_SECTION_BLOCK_TYPES,
  validatePageSectionConfig,
  type PageSectionBlockType,
} from '@/lib/page-section-config';
import { resolvePage } from '@/lib/page-catalog';
import { ensureHeroNavRoutes } from '@/domain/cms/ensure-hero-nav-routes';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const blockTypeEnum = z.enum(PAGE_SECTION_BLOCK_TYPES);

const createSchema = z.object({
  blockType: blockTypeEnum,
  config: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  sections: z.array(z.object({
    id: z.string().min(1),
    blockType: blockTypeEnum.optional(),
    config: z.record(z.unknown()).optional(),
    sortOrder: z.number().int().optional(),
  })).min(1),
});

async function resolvePageId(
  prisma: PrismaClient,
  routeSlug: string,
): Promise<{ id: string } | null> {
  const cmsScope = getCmsTenantAppScope();
  const page = await resolveAppPageRow(prisma, routeSlug, {
    appId: getCurrentAppId(),
    tenantSlug: cmsScope.tenantSlug,
  });
  return page ? { id: page.id } : null;
}

async function lockPageContent(prisma: PrismaClient, pageId: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE app_pages SET content_locked = true WHERE id = $1`,
    pageId,
  );
}

type RouteContext = { params: Promise<{ slug: string }> };

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

async function provisionHeroRoutesFromConfigs(
  prisma: PrismaClient,
  configs: Record<string, unknown>[],
): Promise<void> {
  const cmsScope = getCmsTenantAppScope();
  for (const config of configs) {
    await ensureHeroNavRoutes(prisma, config, {
      tenantSlug: cmsScope.tenantSlug,
      appId: cmsScope.appId,
      resolveCatalogPage: catalogResolver,
    });
  }
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireRead('pages', request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);
    const page = await resolvePageId(prisma, slug);
    if (!page) return jsonError(`Page "${slug}" not found`, 404);

    const pageMeta = (await prisma.$queryRawUnsafe(
      `SELECT title, COALESCE(content_locked, false) AS "contentLocked"
       FROM app_pages WHERE id = $1`,
      page.id,
    )) as { title: string; contentLocked: boolean }[];

    const sections = await prisma.$queryRawUnsafe<
      {
        id: string;
        sortOrder: number;
        blockType: string;
        config: Record<string, unknown>;
      }[]
    >(
      `SELECT id, sort_order AS "sortOrder", block_type AS "blockType", config
       FROM page_sections WHERE page_id = $1 ORDER BY sort_order ASC`,
      page.id,
    );

    return jsonOk({
      slug,
      title: pageMeta[0]?.title ?? slug,
      contentLocked: pageMeta[0]?.contentLocked ?? false,
      sections: sections.map((s) => ({
        ...s,
        config: (typeof s.config === 'object' && s.config !== null ? s.config : {}) as Record<string, unknown>,
      })),
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireWrite('pages', request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  let config: Record<string, unknown>;
  try {
    config = validatePageSectionConfig(parsed.data.blockType, parsed.data.config);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 400);
  }

  const { blockType, sortOrder } = parsed.data;
  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);
    const page = await resolvePageId(prisma, slug);
    if (!page) return jsonError(`Page "${slug}" not found`, 404);

    const orderRows = (await prisma.$queryRawUnsafe(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM page_sections WHERE page_id = $1`,
      page.id,
    )) as { next: number }[];
    const nextOrder = sortOrder ?? orderRows[0]?.next ?? 0;
    const id = `${slug}:section:${Date.now()}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
       VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb))`,
      id,
      page.id,
      nextOrder,
      blockType as BlockType,
      JSON.stringify(config),
    );
    await lockPageContent(prisma, page.id);

    return jsonOk({ created: true, id, sortOrder: nextOrder }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireWrite('pages', request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  const { sections } = parsed.data;
  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);
    const page = await resolvePageId(prisma, slug);
    if (!page) return jsonError(`Page "${slug}" not found`, 404);

    const heroConfigs: Record<string, unknown>[] = [];

    for (const section of sections) {
      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (section.blockType !== undefined) {
        sets.push(`block_type = CAST($${idx++} AS "BlockType")`);
        params.push(section.blockType);
      }
      if (section.config !== undefined) {
        const blockType =
          section.blockType ??
          (
            (await prisma.$queryRawUnsafe(
              `SELECT block_type AS "blockType" FROM page_sections WHERE id = $1 AND page_id = $2`,
              section.id,
              page.id,
            )) as { blockType: PageSectionBlockType }[]
          )[0]?.blockType;
        if (!blockType) return jsonError(`Section "${section.id}" not found`, 404);
        let config: Record<string, unknown>;
        try {
          config = validatePageSectionConfig(blockType, section.config);
        } catch (err) {
          return jsonError(err instanceof Error ? err.message : String(err), 400);
        }
        sets.push(`config = CAST($${idx++} AS jsonb)`);
        params.push(JSON.stringify(config));
        if (blockType === 'hero') heroConfigs.push(config);
      }
      if (section.sortOrder !== undefined) {
        sets.push(`sort_order = $${idx++}`);
        params.push(section.sortOrder);
      }
      if (sets.length === 0) continue;

      params.push(section.id, page.id);
      const result = await prisma.$executeRawUnsafe(
        `UPDATE page_sections SET ${sets.join(', ')} WHERE id = $${idx++} AND page_id = $${idx}`,
        ...params,
      );
      if (Number(result) === 0) return jsonError(`Section "${section.id}" not found`, 404);
    }

    await provisionHeroRoutesFromConfigs(prisma, heroConfigs);
    await lockPageContent(prisma, page.id);
    return jsonOk({ updated: sections.length, contentLocked: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireWrite('pages', request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) return jsonError('Query param "ids" required (comma-separated)', 400);
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return jsonError('No valid IDs provided', 400);

  const prisma = getPageCmsClient();
  try {
    await ensurePageCmsColumns(prisma);
    const page = await resolvePageId(prisma, slug);
    if (!page) return jsonError(`Page "${slug}" not found`, 404);

    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM page_sections WHERE page_id = $1 AND id = ANY($2::text[])`,
      page.id,
      ids,
    );
    await lockPageContent(prisma, page.id);
    return jsonOk({ deleted: Number(result), contentLocked: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
