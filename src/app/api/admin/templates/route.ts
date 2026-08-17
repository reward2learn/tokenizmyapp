/**
 * Merged template list — built-ins plus stored custom templates.
 *
 * GET /api/admin/templates
 *
 * Exists because template pickers live in client components that import
 * `listTemplates()` synchronously from the code catalog, which cannot see
 * DB-backed custom templates. Those pickers read this endpoint instead; the
 * synchronous import stays valid for built-ins and for server code that only
 * ever deals with them.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { listAllTemplates } from '@/domain/tenant/custom-template-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  try {
    const templates = await listAllTemplates(db);
    return jsonOk({
      templates,
      builtinCount: templates.filter((t) => t.source !== 'custom').length,
      customCount: templates.filter((t) => t.source === 'custom').length,
    });
  } catch (err) {
    return jsonError('Failed to list templates: ' + (err as Error).message, 500);
  }
}
