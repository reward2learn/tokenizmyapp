/**
 * Tenant Favicon Upload — POST /api/admin/tenants/[slug]/favicon
 *
 * Stores a base64-encoded favicon in the Tenant record.
 * Also serves GET to retrieve the favicon and DELETE to remove it.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { PrismaClient } from '@/generated/prisma';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { data?: string; mimeType?: string };
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }

  if (!body.data) {
    return jsonError('favicon data is required (base64-encoded string)', 400);
  }

  // Validate base64
  try {
    Buffer.from(body.data, 'base64');
  } catch {
    return jsonError('Invalid base64 data', 400);
  }

  const mimeType = body.mimeType || 'image/x-icon';

  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return jsonError('POSTGRES_URL not configured', 500);

  try {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    await prisma.tenant.update({
      where: { slug },
      data: {
        faviconData: body.data,
        faviconMimeType: mimeType,
      },
    });
    await prisma.$disconnect();
    return jsonOk({ message: 'Favicon updated' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(`Failed to save favicon: ${msg}`, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return jsonError('POSTGRES_URL not configured', 500);

  try {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    await prisma.tenant.update({
      where: { slug },
      data: {
        faviconData: null,
        faviconMimeType: null,
      },
    });
    await prisma.$disconnect();
    return jsonOk({ message: 'Favicon removed' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(`Failed to remove favicon: ${msg}`, 500);
  }
}
