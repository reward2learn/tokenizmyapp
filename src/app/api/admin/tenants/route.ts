/**
 * Tenant Registry API — CRUD for tenant applications
 *
 * GET    /api/admin/tenants         — list all tenants
 * POST   /api/admin/tenants         — create a new tenant
 * GET    /api/admin/tenants/[slug]  — get tenant by slug
 * PUT    /api/admin/tenants/[slug]  — update tenant
 * DELETE /api/admin/tenants/[slug]  — delete a tenant (soft)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { deployTenant } from '@/domain/tenant/vercel-deploy-service';
import { seedTenantDefaults, seedTemplateSecurityGroups } from '@/domain/tenant/tenant-seed-service';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  displayName: z.string().min(1).max(100),
  template: z.string().max(50).optional().default('default'),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#eb3d28'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#0af9fe'),
  metadata: z.record(z.unknown()).optional().default({}),
});

const updateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  template: z.string().max(50).optional(),
  status: z.enum(['draft', 'deploying', 'live', 'error']).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  appUrl: z.string().max(500).optional(),
  vercelProjectId: z.string().max(100).optional(),
  dbUrl: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ── GET /api/admin/tenants ───────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);

    // status filter applied in raw SQL below

    const query = status
      ? `SELECT * FROM tenants WHERE status = $1 ORDER BY created_at DESC`
      : `SELECT * FROM tenants ORDER BY created_at DESC`;
    const tenants = status
      ? await db.$queryRawUnsafe(query, status)
      : await db.$queryRawUnsafe(query);

    return jsonOk({ tenants });
  } catch (err) {
    console.error('[tenants] GET error:', err);
    return jsonError('Failed to list tenants', 500);
  }
}

// ── POST /api/admin/tenants ──────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);

    // Check for duplicate slug
    const existingRows = await db.$queryRawUnsafe(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`,
      parsed.data.slug,
    ) as { id: string }[];
    if (existingRows.length > 0) {
      return jsonError(`Tenant slug "${parsed.data.slug}" already exists`, 409);
    }

    const tenantId = `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.$executeRawUnsafe(
      `INSERT INTO tenants (id, slug, display_name, template, status, primary_color, secondary_color, metadata, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
      tenantId,
      parsed.data.slug,
      parsed.data.displayName,
      parsed.data.template,
      'deploying',
      parsed.data.primaryColor,
      parsed.data.secondaryColor,
      JSON.stringify(parsed.data.metadata),
      guard.session.sub ?? guard.session.email ?? null,
    );
    const tenant = { id: tenantId, slug: parsed.data.slug, status: 'deploying' } as const;

    // Seed template defaults (pages, nav, brand, groups) asynchronously
    // Don't block the response — seeding runs in the background
    const seedInput = {
      slug: parsed.data.slug,
      displayName: parsed.data.displayName,
      template: parsed.data.template,
      primaryColor: parsed.data.primaryColor,
      secondaryColor: parsed.data.secondaryColor,
    };

    // Seed immediately using the same DB connection
    try {
      const rawDb = db; // Same raw client
      await seedTenantDefaults({ ...seedInput, db: rawDb });
      await seedTemplateSecurityGroups(rawDb, parsed.data.template);

      // Update status to 'live' after successful seed
      await db.$executeRawUnsafe(
        `UPDATE tenants SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
        'live', parsed.data.slug,
      );
      (tenant as { status: string }).status = 'live';

      // Trigger Vercel project creation asynchronously (non-blocking)
      deployTenant({
        slug: parsed.data.slug,
        displayName: parsed.data.displayName,
        template: parsed.data.template,
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
      }).then((result: { projectId: string; appUrl: string }) => {
        console.log('[tenants] Vercel project created:', result.projectId);
        // Update tenant record with Vercel project ID
        db.$executeRawUnsafe(
          `UPDATE tenants SET vercel_project_id = $1, app_url = $2, updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`,
          result.projectId, result.appUrl, parsed.data.slug,
        ).catch((e: unknown) => console.error('[tenants] Failed to save vercel_project_id:', e));
      }).catch((deployErr: unknown) => {
        console.error('[tenants] Vercel deploy failed:', deployErr instanceof Error ? deployErr.message : String(deployErr));
      });

    } catch (seedErr) {
      console.error('[tenants] Seed failed:', seedErr instanceof Error ? seedErr.message : String(seedErr));
      // Tenant is created but seeding failed — status stays 'deploying'
      // Admin can retry seeding from the tenant dashboard
    }

    return jsonOk({ tenant });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? (err.stack ?? '').split('\n').slice(0, 3).join(' | ') : '';
    console.error('[tenants] POST error:', msg);
    if (stack) console.error('[tenants] POST stack:', stack);
    return jsonError('Failed to create tenant: ' + msg.slice(0, 100), 500);
  }
}
