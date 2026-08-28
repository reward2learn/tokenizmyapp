/**
 * POST /api/notes/share — share a personal note with one teammate or the whole team.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import type { AppNote, SharedNote } from '@/lib/notes/types';
import {
  loadInboxNotes,
  loadPersonalNotes,
  saveInboxNotes,
  savePersonalNotes,
} from '@/lib/notes/storage';
import { listNoteTeamMembers, teamMemberLabel } from '@/lib/notes/team-members';
import { recordShareOnOwnerNote, upsertInboxCopy } from '@/lib/notes/sync-shared';

const shareSchema = z.object({
  noteId: z.string().min(1),
  recipientSub: z.string().optional(),
  shareWithAll: z.boolean().optional(),
}).refine((d) => d.shareWithAll === true || Boolean(d.recipientSub?.trim()), {
  message: 'recipientSub or shareWithAll is required',
});

export const dynamic = 'force-dynamic';

type SenderRow = { name: string | null; email: string | null };

async function resolveSender(db: ReturnType<typeof createClient>, sub: string): Promise<SenderRow> {
  try {
    const row = await db.userAccount.findFirst({
      where: { sub },
      select: { name: true, email: true },
    });
    return { name: row?.name ?? null, email: row?.email ?? null };
  } catch {
    return { name: null, email: null };
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) return jsonError('noteId and recipientSub or shareWithAll required', 400);

  const db = createClient({
    tier: guard.session.tier as 'public' | 'pin' | 'google',
    sub: guard.session.sub,
  });

  try {
    const notes = await loadPersonalNotes(db, guard.session.sub);
    const noteIndex = notes.findIndex((n) => n.id === parsed.data.noteId);
    if (noteIndex < 0) return jsonError('Note not found', 404);

    let note = notes[noteIndex];
    if (note.ownerSub !== guard.session.sub) {
      return jsonError('Only the note owner can share', 403);
    }

    const teamMembers = await listNoteTeamMembers(db, guard.session.sub);

    const recipients = parsed.data.shareWithAll
      ? teamMembers
      : teamMembers.filter((m) => m.sub === parsed.data.recipientSub);

    if (!parsed.data.shareWithAll && recipients.length === 0) {
      return jsonError('Recipient is not an active team member', 400);
    }

    if (recipients.length === 0) {
      return jsonError('No team members to share with', 400);
    }

    const sender = await resolveSender(db, guard.session.sub);
    const sharedAt = new Date().toISOString();
    const shareScope = parsed.data.shareWithAll ? 'team' as const : 'direct' as const;
    let delivered = 0;

    for (const recipient of recipients) {
      const inbox = await loadInboxNotes(db, recipient.sub);
      const copy: SharedNote = {
        id: `shared-${note.id}-${recipient.sub}-${Date.now()}`,
        title: note.title,
        content: note.content,
        source: note.source,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        ownerSub: note.ownerSub,
        originalNoteId: note.id,
        sharedFrom: {
          sub: guard.session.sub,
          name: sender.name,
          email: sender.email,
          sharedAt,
        },
        shareScope,
      };
      await saveInboxNotes(db, recipient.sub, upsertInboxCopy(inbox, copy));
      note = recordShareOnOwnerNote(note, recipient, sharedAt);
      delivered += 1;
    }

    notes[noteIndex] = note;
    await savePersonalNotes(db, guard.session.sub, notes);

    return jsonOk({
      shared: true,
      delivered,
      recipients: recipients.map((r) => ({
        sub: r.sub,
        label: teamMemberLabel(r),
      })),
      note,
    });
  } catch (err) {
    return jsonError(`Share failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}
