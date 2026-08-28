import type { DbClient } from '@/lib/db';
import type { AppNote, SharedNote } from '@/lib/notes/types';
import { loadInboxNotes, saveInboxNotes } from '@/lib/notes/storage';

export function findInboxCopyIndex(
  inbox: SharedNote[],
  originalNoteId: string,
  ownerSub: string,
): number {
  return inbox.findIndex(
    (n) => n.originalNoteId === originalNoteId && n.sharedFrom.sub === ownerSub,
  );
}

export function upsertInboxCopy(inbox: SharedNote[], copy: SharedNote): SharedNote[] {
  const index = findInboxCopyIndex(inbox, copy.originalNoteId, copy.sharedFrom.sub);
  if (index >= 0) {
    const next = [...inbox];
    next[index] = { ...copy, id: inbox[index].id };
    return next;
  }
  return [copy, ...inbox];
}

export function applyNoteContentToInboxCopy(existing: SharedNote, note: AppNote): SharedNote {
  return {
    ...existing,
    title: note.title,
    content: note.content,
    source: note.source,
    updatedAt: note.updatedAt,
  };
}

export function recordShareOnOwnerNote(
  note: AppNote,
  recipient: { sub: string; name?: string | null; email?: string | null },
  sharedAt: string,
): AppNote {
  const shares = [...(note.shares ?? [])];
  const existingIndex = shares.findIndex((s) => s.sub === recipient.sub);
  const entry = {
    sub: recipient.sub,
    name: recipient.name,
    email: recipient.email,
    sharedAt,
  };
  if (existingIndex >= 0) shares[existingIndex] = entry;
  else shares.push(entry);
  return { ...note, shares };
}

export function removeSharesFromNote(note: AppNote, recipientSubs: string[]): AppNote {
  const subs = new Set(recipientSubs);
  return {
    ...note,
    shares: (note.shares ?? []).filter((s) => !subs.has(s.sub)),
  };
}

/** Push the owner's latest title/content to every recipient inbox copy. */
export async function syncNoteToShareRecipients(
  db: DbClient,
  ownerSub: string,
  note: AppNote,
): Promise<number> {
  const recipients = note.shares ?? [];
  if (recipients.length === 0) return 0;

  let synced = 0;
  for (const recipient of recipients) {
    const inbox = await loadInboxNotes(db, recipient.sub);
    const index = findInboxCopyIndex(inbox, note.id, ownerSub);
    if (index < 0) continue;

    const next = [...inbox];
    next[index] = applyNoteContentToInboxCopy(inbox[index], note);
    await saveInboxNotes(db, recipient.sub, next);
    synced += 1;
  }
  return synced;
}

/** Remove inbox copies for the given recipients (or all shares on the note). */
export async function revokeNoteFromRecipients(
  db: DbClient,
  ownerSub: string,
  noteId: string,
  recipientSubs: string[],
): Promise<number> {
  let revoked = 0;
  for (const recipientSub of recipientSubs) {
    const inbox = await loadInboxNotes(db, recipientSub);
    const next = inbox.filter(
      (n) => !(n.originalNoteId === noteId && n.sharedFrom.sub === ownerSub),
    );
    if (next.length === inbox.length) continue;
    await saveInboxNotes(db, recipientSub, next);
    revoked += 1;
  }
  return revoked;
}
