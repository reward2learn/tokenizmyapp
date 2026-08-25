/**
 * POST /api/admin/tenants/[slug]/generate-legal-docs
 *
 * Regenerates Terms of Service + Privacy Policy (knowledge snippets) for the
 * tenant and every suite app DB, including pending-invoice / plan-restriction
 * clauses from the legal-doc generator.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { regenerateTenantLegalDocs } from '@/domain/legal/regenerate-tenant-legal-docs';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  const { slug } = await params;
  try {
    const result = await regenerateTenantLegalDocs(slug);
    return jsonOk({
      generated: true,
      updated: result.updated,
      failed: result.failed,
      results: result.results,
      message:
        result.failed === 0
          ? `Legal docs updated for ${result.updated} app(s)`
          : `Legal docs updated for ${result.updated} app(s); ${result.failed} failed`,
    });
  } catch (err) {
    return jsonError(
      'Failed to generate legal docs: ' + (err instanceof Error ? err.message : String(err)),
      500,
    );
  }
}
