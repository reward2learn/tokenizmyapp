/**
 * Notes API
 *
 * GET    /api/notes                    — list personal notes, shared inbox, team members
 * POST   /api/notes                    — create a personal note
 * PATCH  /api/notes                    — update a personal note (owner only)
 * DELETE /api/notes?ids=a,b             — delete personal notes
 * DELETE /api/notes?scope=inbox&ids=…  — remove shared notes from inbox
 *
 * Share:   POST /api/notes/share
 * Unshare: POST /api/notes/unshare
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireSession, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import type { AppNote, NoteSource } from '@/lib/notes/types';
import {
  loadInboxNotes,
  loadPersonalNotes,
  saveInboxNotes,
  savePersonalNotes,
} from '@/lib/notes/storage';
import { listNoteTeamMembers } from '@/lib/notes/team-members';
import { revokeNoteFromRecipients, syncNoteToShareRecipients } from '@/lib/notes/sync-shared';

export type { AppNote, NoteSource, SharedNote, NotesListPayload } from '@/lib/notes/types';

const NOTE_SOURCES = ['manual', 'assistant', 'conversation'] as const;

const postSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  source: z.enum(NOTE_SOURCES).optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
}).refine((d) => d.title !== undefined || d.content !== undefined, {
  message: 'title or content is required',
});

export const dynamic = 'force-dynamic';

function defaultTitle(content: string, source: NoteSource): string {
  const firstLine = content
    .split('\n')[0]
    ?.replace(/^#{1,3}\s+/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .trim() ?? '';
  if (firstLine) return firstLine.slice(0, 80);
  switch (source) {
    case 'assistant':
      return 'Assistant note';
    case 'conversation':
      return 'Chat conversation';
    case 'manual':
      return 'Note';
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const db = createClient({
    tier: guard.session.tier as 'public' | 'pin' | 'google',
    sub: guard.session.sub,
  });

  try {
    const [mine, sharedWithMe, teamMembers] = await Promise.all([
      loadPersonalNotes(db, guard.session.sub),
      loadInboxNotes(db, guard.session.sub),
      listNoteTeamMembers(db, guard.session.sub),
    ]);
    return jsonOk({ mine, sharedWithMe, teamMembers, notes: mine });
  } catch (err) {
    return jsonError(`Read failed: ${err instanceof Error ? err.message : String(err)}`, 500);
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return jsonError('content (string) is required', 400);

  const source: NoteSource = parsed.data.source ?? 'manual';
  const content = parsed.data.content;
  const title = (parsed.data.title?.trim() || defaultTitle(content, source));

  const db = createClient({
    tier: guard.session.tier as 'public' | 'pin' | 'google',
    sub: guard.session.sub,
  });

  try {
    const notes = await loadPersonalNotes(db, guard.session.sub);
    const now = new Date().toISOString();

    const note: AppNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      content,
      source,
      createdAt: now,
      ownerSub: guard.session.sub,
    };
    notes.unshift(note);
    await savePersonalNotes(db, guard.session.sub, notes);

    return jsonOk({ saved: true, id: note.id, note });
  } catch (err) {
    return jsonError(`Save failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError('id and title or content required', 400);

  const db = createClient({
    tier: guard.session.tier as 'public' | 'pin' | 'google',
    sub: guard.session.sub,
  });

  try {
    const notes = await loadPersonalNotes(db, guard.session.sub);
    const index = notes.findIndex((n) => n.id === parsed.data.id);
    if (index < 0) return jsonError('Note not found', 404);

    const existing = notes[index];
    if (existing.ownerSub !== guard.session.sub) {
      return jsonError('Only the note owner can edit', 403);
    }

    const updated: AppNote = {
      ...existing,
      title: parsed.data.title?.trim() || existing.title,
      content: parsed.data.content ?? existing.content,
      updatedAt: new Date().toISOString(),
    };
    notes[index] = updated;
    await savePersonalNotes(db, guard.session.sub, notes);

    const syncedTo = (updated.shares?.length ?? 0) > 0
      ? await syncNoteToShareRecipients(db, guard.session.sub, updated)
      : 0;

    return jsonOk({ updated: true, note: updated, syncedTo });
  } catch (err) {
    return jsonError(`Update failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids');
  const scope = url.searchParams.get('scope');

  const db = createClient({
    tier: guard.session.tier as 'public' | 'pin' | 'google',
    sub: guard.session.sub,
  });

  try {
    if (scope === 'inbox') {
      let inbox = await loadInboxNotes(db, guard.session.sub);
      if (idsParam) {
        const ids = new Set(idsParam.split(',').map((id) => id.trim()).filter(Boolean));
        inbox = inbox.filter((n) => !ids.has(n.id));
      } else {
        inbox = [];
      }
      await saveInboxNotes(db, guard.session.sub, inbox);
      return jsonOk({ deleted: true, remaining: inbox.length, scope: 'inbox' });
    }

    let notes = await loadPersonalNotes(db, guard.session.sub);
    const ids = idsParam
      ? new Set(idsParam.split(',').map((id) => id.trim()).filter(Boolean))
      : null;

    const toRemove = notes.filter((n) =>
      n.ownerSub === guard.session.sub && (ids ? ids.has(n.id) : true),
    );

    for (const note of toRemove) {
      const recipientSubs = (note.shares ?? []).map((s) => s.sub);
      if (recipientSubs.length > 0) {
        await revokeNoteFromRecipients(db, guard.session.sub, note.id, recipientSubs);
      }
    }

    if (ids) {
      notes = notes.filter((n) => !ids.has(n.id) || n.ownerSub !== guard.session.sub);
    } else {
      notes = notes.filter((n) => n.ownerSub !== guard.session.sub);
    }
    await savePersonalNotes(db, guard.session.sub, notes);

    return jsonOk({ deleted: true, remaining: notes.length, scope: 'personal' });
  } catch (err) {
    return jsonError(`Delete failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}
