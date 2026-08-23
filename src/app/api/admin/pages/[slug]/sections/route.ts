/**
 * Admin Page Sections CRUD — edit Neon page_sections.config (CMS for block copy).
 *
 * GET    /api/admin/pages/[slug]/sections?tenantSlug=&appId=
 * POST   /api/admin/pages/[slug]/sections — create section
 * PUT    /api/admin/pages/[slug]/sections — batch update config / sortOrder / blockType
 * DELETE /api/admin/pages/[slug]/sections?ids=...&tenantSlug=&appId=
 *
 * Any successful write sets app_pages.content_locked = true so re-seed keeps CMS copy.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ZodError } from 'zod';
import { PrismaClient, type BlockType } from '@/generated/prisma';
import { requireRead, requireWrite, requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { resolveAppPageRow } from '@shared/lib/page-cms-resolve';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { resolveBlockAnimate } from '@/lib/schemas/block-animate';
import type { BlockType as CatalogBlockType } from '@/lib/page-catalog';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient(url: string) {
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const BLOCK_TYPES = [
  'hero', 'metric_grid', 'chart_financial', 'lever_accordion', 'action_checklist',
  'doc_markdown', 'pnl_table', 'z_report_form', 'costs_form', 'calendar_import',
  'chat_panel', 'kpi_cards', 'ops_admin_tabs', 'review_blocks', 'reports_rollup',
  'sheet_viewer', 'pack_table', 'feature_grid', 'testimonials',
  'marketing_hero', 'capability_marquee', 'product_showcase', 'customer_proof',
  'faq', 'cta_banner', 'pricing_table',
] as const satisfies readonly CatalogBlockType[];

const createSchema = z.object({
  blockType: z.enum(BLOCK_TYPES),
  config: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().optional(),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

const updateSchema = z.object({
  sections: z.array(z.object({
    id: z.string().min(1),
    blockType: z.enum(BLOCK_TYPES).optional(),
    config: z.record(z.unknown()).optional(),
    sortOrder: z.number().int().optional(),
  })).min(1),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

function validateConfig(blockType: CatalogBlockType, config: Record<string, unknown>) {
  const animate = resolveBlockAnimate(config.animate);
  const { animate: _drop, ...blockOnly } = config;
  // marketing_hero requires headline/subheadline — seed empty creates with component defaults.
  const withDefaults: Record<string, unknown> =
    blockType === 'marketing_hero'
      ? {
          headline: 'Build software for your business',
          subheadline: 'Describe what you need and get a working app.',
          ...blockOnly,
        }
      : blockOnly;
  try {
    const parsed = parseBlockConfig(blockType, withDefaults) as Record<string, unknown>;
    return { ...parsed, animate };
  } catch (err) {
    if (err instanceof ZodError) {
      throw new Error(
        `Invalid config for ${blockType}: ${err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      );
    }
    throw err;
  }
}

async function resolvePageId(
  prisma: PrismaClient,
  routeSlug: string,
  scope?: { appId?: string | null; tenantSlug?: string | null },
): Promise<{ id: string } | null> {
  const page = await resolveAppPageRow(prisma, routeSlug, {
    appId: scope?.appId ?? '',
    tenantSlug: scope?.tenantSlug ?? undefined,
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

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireRead('pages', request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const tenantSlug = isPlatformAdmin ? searchParams.get('tenantSlug') : null;
  const appId = isPlatformAdmin ? searchParams.get('appId') : null;

  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);
    const page = await resolvePageId(prisma, slug, { tenantSlug, appId });
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
    config = validateConfig(parsed.data.blockType, parsed.data.config);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 400);
  }

  const { tenantSlug, appId, blockType, sortOrder } = parsed.data;
  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);
    const page = await resolvePageId(prisma, slug, { tenantSlug, appId });
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

  const { tenantSlug, appId, sections } = parsed.data;
  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);
    const page = await resolvePageId(prisma, slug, { tenantSlug, appId });
    if (!page) return jsonError(`Page "${slug}" not found`, 404);

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
            )) as { blockType: CatalogBlockType }[]
          )[0]?.blockType;
        if (!blockType) return jsonError(`Section "${section.id}" not found`, 404);
        let config: Record<string, unknown>;
        try {
          config = validateConfig(blockType, section.config);
        } catch (err) {
          return jsonError(err instanceof Error ? err.message : String(err), 400);
        }
        sets.push(`config = CAST($${idx++} AS jsonb)`);
        params.push(JSON.stringify(config));
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
  const tenantSlug = searchParams.get('tenantSlug');
  const appId = searchParams.get('appId');

  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await addTenantColumnsIfMissing(prisma);
    const page = await resolvePageId(prisma, slug, { tenantSlug, appId });
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
