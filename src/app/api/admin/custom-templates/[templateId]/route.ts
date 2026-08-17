/**
 * Single custom template.
 *
 * GET    /api/admin/custom-templates/[templateId]
 * DELETE /api/admin/custom-templates/[templateId]
 *
 * Deleting does NOT touch apps already provisioned from the template — they
 * carry their own materialised pages and nav. It only removes the template from
 * the picker, so an existing app never breaks because someone tidied up.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  deleteCustomTemplate,
  getCustomTemplate,
} from '@/domain/tenant/custom-template-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { templateId } = await params;
  const db = createRawClient();
  try {
    const template = await getCustomTemplate(templateId, db);
    if (!template) return jsonError('Custom template not found', 404);
    return jsonOk({ template });
  } catch (err) {
    return jsonError('Failed to load custom template: ' + (err as Error).message, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { templateId } = await params;
  const db = createRawClient();
  try {
    const removed = await deleteCustomTemplate(templateId, db);
    if (!removed) return jsonError('Custom template not found', 404);
    return jsonOk({ templateId, deleted: true });
  } catch (err) {
    return jsonError('Failed to delete custom template: ' + (err as Error).message, 500);
  }
}
