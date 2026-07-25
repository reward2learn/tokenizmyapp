/**
 * Notifications API — single notification by id.
 *
 * PATCH  /api/notifications/[id]   — mark read or dismissed
 * DELETE /api/notifications/[id]   — delete a notification
 *
 * Requires write auth (pin | google tier). Ownership is enforced in the
 * service layer — only the notification's owner may modify or delete it.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { NotificationService } from '@/domain/notifications/notification-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const patchSchema = z.object({
  isRead: z.boolean().optional(),
  isDismissed: z.boolean().optional(),
});

// ── PATCH (mark read / dismissed) ──────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      'Validation error: ' + JSON.stringify(parsed.error.flatten()),
      400,
    );
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new NotificationService(db);

  try {
    if (parsed.data.isRead) {
      const notification = await service.markRead(id, guard.session.sub);
      return jsonOk({ notification });
    }
    if (parsed.data.isDismissed) {
      const notification = await service.dismiss(id, guard.session.sub);
      return jsonOk({ notification });
    }
    return jsonError('No valid patch field supplied (isRead | isDismissed)', 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Notification not found', 404);
    console.error(`[notifications] PATCH /${id} error:`, err);
    return jsonError('Failed to update notification', 500);
  }
}

// ── DELETE ─────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new NotificationService(db);

  try {
    await service.delete(id, guard.session.sub);
    return jsonOk({ deleted: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Notification not found', 404);
    console.error(`[notifications] DELETE /${id} error:`, err);
    return jsonError('Failed to delete notification', 500);
  }
}
