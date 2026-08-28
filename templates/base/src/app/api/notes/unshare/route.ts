/**
 * POST /api/notes/unshare — revoke sharing for one recipient or everyone.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { loadPersonalNotes, savePersonalNotes } from '@/lib/notes/storage';
import { listNoteTeamMembers, teamMemberLabel } from '@/lib/notes/team-members';
import { removeSharesFromNote, revokeNoteFromRecipients } from '@/lib/notes/sync-shared';

const unshareSchema = z.object({
  noteId: z.string().min(1),
  recipientSub: z.string().optional(),
  revokeAll: z.boolean().optional(),
}).refine((d) => d.revokeAll === true || Boolean(d.recipientSub?.trim()), {
  message: 'recipientSub or revokeAll is required',
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const parsed = unshareSchema.safeParse(body);
  if (!parsed.success) return jsonError('noteId and recipientSub or revokeAll required', 400);

  const db = createClient({
    tier: guard.session.tier as 'public' | 'pin' | 'google',
    sub: guard.session.sub,
  });

  try {
    const notes = await loadPersonalNotes(db, guard.session.sub);
    const noteIndex = notes.findIndex((n) => n.id === parsed.data.noteId);
    if (noteIndex < 0) return jsonError('Note not found', 404);

    const note = notes[noteIndex];
    if (note.ownerSub !== guard.session.sub) {
      return jsonError('Only the note owner can unshare', 403);
    }

    const currentShares = note.shares ?? [];
    if (currentShares.length === 0) {
      return jsonError('Note is not shared with anyone', 400);
    }

    const teamMembers = await listNoteTeamMembers(db, guard.session.sub);

    let recipientSubs: string[];
    if (parsed.data.revokeAll) {
      recipientSubs = currentShares.map((s) => s.sub);
    } else {
      const target = parsed.data.recipientSub!;
      if (!currentShares.some((s) => s.sub === target)) {
        return jsonError('Note is not shared with that teammate', 400);
      }
      recipientSubs = [target];
    }

    const revoked = await revokeNoteFromRecipients(
      db,
      guard.session.sub,
      note.id,
      recipientSubs,
    );

    const updated = removeSharesFromNote(note, recipientSubs);
    notes[noteIndex] = updated;
    await savePersonalNotes(db, guard.session.sub, notes);

    return jsonOk({
      revoked: true,
      removedFromInboxes: revoked,
      recipients: recipientSubs.map((sub) => {
        const share = currentShares.find((s) => s.sub === sub);
        const member = teamMembers.find((m) => m.sub === sub);
        return {
          sub,
          label: share?.name || share?.email || (member ? teamMemberLabel(member) : sub),
        };
      }),
      note: updated,
    });
  } catch (err) {
    return jsonError(`Unshare failed: ${err instanceof Error ? err.message : String(err)}`, 400);
  }
}
