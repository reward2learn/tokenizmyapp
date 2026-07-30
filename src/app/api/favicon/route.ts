/**
 * Public Favicon Serve — GET /api/favicon
 *
 * Serves the tenant\'s custom favicon from the database.
 * Reads the tenant slug from NEXT_PUBLIC_TENANT_SLUG env var.
 * Returns the favicon with the correct Content-Type for browser use.
 *
 * Usage (in layout metadata):
 *   icons: { icon: '/api/favicon' }
 */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const slug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim();
  if (!slug) {
    return new NextResponse(null, { status: 204 });
  }

  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { faviconData: true, faviconMimeType: true },
    });
    await prisma.$disconnect();

    if (!tenant || !tenant.faviconData) {
      return new NextResponse(null, { status: 204 });
    }

    const buf = Buffer.from(tenant.faviconData, 'base64');
    const mimeType = tenant.faviconMimeType || 'image/x-icon';

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
