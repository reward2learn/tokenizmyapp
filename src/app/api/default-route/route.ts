/**
 * Default Route API
 *
 * GET /api/default-route
 *   Returns: { path: string } — the configured default nav item's path,
 *            or "/dashboard" when none is configured.
 *   No auth required — used by the root page redirect.
 */

import { NextResponse } from 'next/server';
import { getDefaultRoutePath } from '@/lib/navigation/default-route';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ path: await getDefaultRoutePath() });
}
