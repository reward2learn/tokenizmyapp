/**
 * Single Tenant API — GET / PUT / DELETE /api/admin/tenants/[slug]
 */
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { ensureTenantConfigColumns } from '@/domain/tenant/tenant-config-service';
// ── Helper: snake_case DB rows → camelCase TenantEntry ──
function mapTenantRow(row) {
    return {
        id: row.id,
        slug: row.slug,
        displayName: row.display_name,
        template: row.template,
        status: row.status,
        vercelProjectId: row.vercel_project_id,
        appUrl: row.app_url,
        dbUrl: row.db_url,
        apiKey: row.api_key,
        primaryColor: row.primary_color,
        secondaryColor: row.secondary_color,
        faviconData: row.favicon_data || null,
        faviconMimeType: row.favicon_mime_type || null,
        metadata: row.metadata,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export const dynamic = 'force-dynamic';
const updateSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    template: z.string().max(50).optional(),
    status: z.enum(['draft', 'deploying', 'live', 'error']).optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    appUrl: z.string().max(500).optional().nullable(),
    vercelProjectId: z.string().max(100).optional().nullable(),
    dbUrl: z.string().max(500).optional().nullable(),
    apiKey: z.string().max(200).optional().nullable(),
    metadata: z.record(z.unknown()).optional(),
});
// ── GET /api/admin/tenants/[slug] ────────────────────
export async function GET(request, { params }) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
    const { slug } = await params;
    const db = createRawClient();
    try {
        await ensureTenantsTable(db);
        await ensureTenantConfigColumns(db);
        const rows = await db.$queryRawUnsafe(`SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
        if (rows.length === 0)
            return jsonError('Tenant not found', 404);
        return jsonOk({ tenant: mapTenantRow(rows[0]) });
    }
    catch (err) {
        console.error(`[tenants] GET /${slug} error:`, err);
        return jsonError('Failed to fetch tenant', 500);
    }
}
// ── PUT /api/admin/tenants/[slug] ────────────────────
export async function PUT(request, { params }) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
    const { slug } = await params;
    let body;
    try {
        body = await request.json();
    }
    catch {
        return jsonError('Invalid JSON body', 400);
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
    }
    const db = createRawClient();
    try {
        await ensureTenantsTable(db);
        await ensureTenantConfigColumns(db);
        const existingRows = await db.$queryRawUnsafe(`SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
        if (existingRows.length === 0)
            return jsonError('Tenant not found', 404);
        // Build SET clause from parsed data
        const updates = [];
        const values = [];
        let idx = 1;
        if (parsed.data.displayName !== undefined) {
            updates.push(`display_name = $${idx++}`);
            values.push(parsed.data.displayName);
        }
        if (parsed.data.template !== undefined) {
            updates.push(`template = $${idx++}`);
            values.push(parsed.data.template);
        }
        if (parsed.data.status !== undefined) {
            updates.push(`status = $${idx++}`);
            values.push(parsed.data.status);
        }
        if (parsed.data.primaryColor !== undefined) {
            updates.push(`primary_color = $${idx++}`);
            values.push(parsed.data.primaryColor);
        }
        if (parsed.data.secondaryColor !== undefined) {
            updates.push(`secondary_color = $${idx++}`);
            values.push(parsed.data.secondaryColor);
        }
        if (parsed.data.appUrl !== undefined) {
            updates.push(`app_url = $${idx++}`);
            values.push(parsed.data.appUrl);
        }
        if (parsed.data.vercelProjectId !== undefined) {
            updates.push(`vercel_project_id = $${idx++}`);
            values.push(parsed.data.vercelProjectId);
        }
        if (parsed.data.dbUrl !== undefined) {
            updates.push(`db_url = $${idx++}`);
            values.push(parsed.data.dbUrl);
        }
        if (parsed.data.apiKey !== undefined) {
            updates.push(`api_key = $${idx++}`);
            values.push(parsed.data.apiKey);
        }
        if (parsed.data.metadata !== undefined) {
            updates.push(`metadata = $${idx++}::jsonb`);
            values.push(JSON.stringify(parsed.data.metadata));
        }
        if (updates.length > 0) {
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(slug);
            await db.$executeRawUnsafe(`UPDATE tenants SET ${updates.join(', ')} WHERE slug = $${idx};`, ...values);
        }
        const updatedRows = await db.$queryRawUnsafe(`SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
        const tenant = updatedRows[0];
        return jsonOk({ tenant: mapTenantRow(tenant) });
    }
    catch (err) {
        console.error(`[tenants] PUT /${slug} error:`, err);
        return jsonError('Failed to update tenant', 500);
    }
}
// ── DELETE /api/admin/tenants/[slug] ─────────────────
export async function DELETE(request, { params }) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
    const { slug } = await params;
    const db = createRawClient();
    try {
        await ensureTenantsTable(db);
        const existingRows = await db.$queryRawUnsafe(`SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
        if (existingRows.length === 0)
            return jsonError('Tenant not found', 404);
        // Hard delete — permanently remove the tenant row
        await db.$executeRawUnsafe(`DELETE FROM tenants WHERE slug = $1;`, slug);
        return jsonOk({ deleted: true });
    }
    catch (err) {
        console.error(`[tenants] DELETE /${slug} error:`, err);
        return jsonError('Failed to delete tenant', 500);
    }
}
