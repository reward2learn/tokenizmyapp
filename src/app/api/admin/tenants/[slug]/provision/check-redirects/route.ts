/**
 * Check Redirect URIs — POST /api/admin/tenants/[slug]/provision/check-redirects
 *
 * Proxies HEAD requests to the tenant's callback endpoints to verify they're
 * reachable. Runs server-side so it bypasses browser CSP restrictions.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const URIS = [
  '/api/auth?action=google-callback',
  '/api/auth/callback/google',
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const baseUrl = `https://${slug}.vercel.app`;

  const results: { uri: string; status: number | string }[] = [];

  for (const uri of URIS) {
    try {
      const res = await fetch(`${baseUrl}${uri}`, { method: 'HEAD' });
      results.push({ uri, status: res.status });
    } catch {
      results.push({ uri, status: 'UNREACHABLE' });
    }
  }

  return jsonOk({ results });
}
