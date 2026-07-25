/**
 * Notifications API — mark all as read.
 *
 * POST /api/notifications/mark-all-read   — mark all of the user's unread,
 *                                          non-dismissed notifications as read.
 *
 * Requires write auth (pin | google tier).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { NotificationService } from '@/domain/notifications/notification-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new NotificationService(db);

  try {
    const updated = await service.markAllRead(guard.session.sub);
    return jsonOk({ updated });
  } catch (err) {
    console.error('[notifications] mark-all-read error:', err);
    return jsonError('Failed to mark notifications as read', 500);
  }
}
