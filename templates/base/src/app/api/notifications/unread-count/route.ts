/**
 * Notifications API — unread count.
 *
 * GET /api/notifications/unread-count   — count of the user's unread,
 *                                         non-dismissed notifications.
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

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new NotificationService(db);

  try {
    const count = await service.getUnreadCount(guard.session.sub);
    return jsonOk({ count });
  } catch (err) {
    console.error('[notifications] unread-count error:', err);
    return jsonError('Failed to get unread count', 500);
  }
}
