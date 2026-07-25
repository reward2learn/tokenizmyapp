/**
 * Notifications API — list & create.
 *
 * GET  /api/notifications                 — list the signed-in user's notifications
 * POST /api/notifications                 — create a notification (admin only)
 *
 * Requires write auth (pin | google tier).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  NotificationService,
  type NotificationListFilter,
} from '@/domain/notifications/notification-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const createSchema = z.object({
  userSub: z.string().min(1),
  type: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(200),
  body: z.string(),
  linkUrl: z.string().url().nullish(),
  metadata: z.record(z.unknown()).optional(),
});

// ── GET (list) ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const filter: NotificationListFilter = {
    includeDismissed: searchParams.get('includeDismissed') === 'true',
    unreadOnly: searchParams.get('unreadOnly') === 'true',
  };

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new NotificationService(db);

  try {
    const notifications = await service.list(guard.session.sub, filter);
    return jsonOk({ notifications });
  } catch (err) {
    console.error('[notifications] GET error:', err);
    return jsonError('Failed to list notifications', 500);
  }
}

// ── POST (create — admin only) ─────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      'Validation error: ' + JSON.stringify(parsed.error.flatten()),
      400,
    );
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new NotificationService(db);

  try {
    const notification = await service.create(parsed.data);
    return jsonOk({ notification }, { status: 201 });
  } catch (err) {
    console.error('[notifications] POST error:', err);
    return jsonError('Failed to create notification', 500);
  }
}
