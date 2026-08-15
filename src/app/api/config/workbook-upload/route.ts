/**
 * Config — Upload Workbook
 *
 * POST /api/config/workbook-upload
 *   Upload the June 2026 Red Ruby workbook and cache it in the database
 *   as a base64-encoded knowledge_snippet. This makes the workbook
 *   available to the AI Content Generation endpoint and the reprocess
 *   pipeline on serverless runtimes where the filesystem is read-only.
 *
 *   The workbook is stored per-tenant (key + appId unique composite),
 *   so different tenants can have different workbooks.
 *
 *   On success, the workbook is immediately available via
 *   GET /api/admin/ai-content and POST /api/config/reprocess.
 *
 *   Payload: multipart/form-data with field "workbook" containing the
 *   Excel file binary. Alternatively, a JSON body with base64-encoded
 *   content can be sent via "content" field.
 *
 *   Returns: { success: true, key, size, message }
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { extractExcelData } from '@/domain/excel/excel-extractor';
import { v4 as uuidv4 } from 'node:uuid';

export const dynamic = 'force-dynamic';
export const config = {
  api: {
    bodyParser: {
      // Increase size limit for Excel files (max 50MB)
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const capabilityGuard = await requireCapability('config:write', request);
  if (!capabilityGuard.ok) return capabilityGuard.response;

  try {
    const contentType = request.headers.get('content-type') || '';

    let base64Content: string | undefined;
    let filename: string | undefined;

    if (contentType.startsWith('multipart/form-data')) {
      // Handle multipart form data (file upload)
      const formData = await request.formData();
      const file = formData.get('workbook') as File | null;
      if (!file) {
        return jsonError('No workbook file provided', 400);
      }
      const bytes = await file.arrayBuffer();
      base64Content = Buffer.from(bytes).toString('base64');
      filename = file.name;
    } else {
      // Handle JSON body with base64 content
      const body = await request.json().catch(() => ({}));
      base64Content = body.content;
      filename = body.filename;
    }

    if (!base64Content) {
      return jsonError('No workbook content provided', 400);
    }

    // Validate it's a valid Excel file by trying to extract data
    try {
      const data = extractExcelData(Buffer.from(base64Content, 'base64'));
      // If extraction succeeds, we have a valid workbook
    } catch (extractErr) {
      return jsonError(
        'Invalid Excel file: ' + (extractErr instanceof Error ? extractErr.message : 'Unknown error'),
        400,
      );
    }

    // Determine the appId for tenant isolation
    // Use tenant slug if available, otherwise empty string for single-app tenant
    const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || 'tokenizmyapp';
    const appId = tenantSlug !== 'tokenizmyapp' ? tenantSlug : '';

    const prisma = new PrismaClient();

    // Store the workbook in knowledge_snippets with unique (key, appId)
    // Key is 'workbook_data', appId is the tenant slug for multi-tenant isolation
    await prisma.knowledgeSnippet.upsert({
      where: { key_appId: { key: 'workbook_data', appId } },
      create: {
        key: 'workbook_data',
        category: 'cache',
        content: base64Content,
        appId,
      },
      update: {
        content: base64Content,
        category: 'cache',
      },
    });

    const sizeKB = Math.round((Buffer.from(base64Content, 'base64').length / 1024));

    return jsonOk({
      success: true,
      key: 'workbook_data',
      appId,
      filename,
      sizeKB,
      message: 'Workbook uploaded and cached successfully. AI Content Generation is now available.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(message, 500);
  }
}