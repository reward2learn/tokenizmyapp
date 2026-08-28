import type { AppNote, SharedNote } from '@/lib/notes/types';
import type { DbClient } from '@/lib/db';
import { getCurrentAppId } from '@shared/lib/config/tenant';

export function personalNotesKey(sub: string): string {
  return `notes:${sub}`;
}

export function inboxNotesKey(sub: string): string {
  return `notes:inbox:${sub}`;
}

function normalizePersonalNote(
  raw: Record<string, unknown>,
  ownerSub: string,
): AppNote | null {
  if (typeof raw.id !== 'string' || typeof raw.content !== 'string') return null;
  const source = raw.source;
  const noteSource: AppNote['source'] =
    source === 'assistant' || source === 'conversation' || source === 'manual'
      ? source
      : 'manual';
  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : 'Note',
    content: raw.content,
    source: noteSource,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    ownerSub: typeof raw.ownerSub === 'string' ? raw.ownerSub : ownerSub,
    shares: Array.isArray(raw.shares) ? (raw.shares as AppNote['shares']) : undefined,
  };
}

export function parsePersonalNotes(
  raw: string | null | undefined,
  ownerSub?: string,
): AppNote[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) =>
        item && typeof item === 'object'
          ? normalizePersonalNote(item as Record<string, unknown>, ownerSub ?? '')
          : null,
      )
      .filter((n): n is AppNote => n != null);
  } catch {
    return [];
  }
}

export function parseInboxNotes(raw: string | null | undefined): SharedNote[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is SharedNote =>
      Boolean(n)
      && typeof n === 'object'
      && typeof (n as SharedNote).id === 'string'
      && typeof (n as SharedNote).originalNoteId === 'string'
      && typeof (n as SharedNote).sharedFrom?.sub === 'string',
    );
  } catch {
    return [];
  }
}

export async function readSnippetContent(
  db: DbClient,
  key: string,
): Promise<string | null> {
  const snippet = await db.knowledgeSnippet.findUnique({
    where: { key_appId: { key, appId: getCurrentAppId() } },
  });
  return snippet?.content ?? null;
}

export async function writeSnippetContent(
  db: DbClient,
  key: string,
  content: string,
): Promise<void> {
  await db.knowledgeSnippet.upsert({
    where: { key_appId: { key, appId: getCurrentAppId() } },
    create: {
      key,
      category: 'document',
      content,
      appId: getCurrentAppId(),
    },
    update: {
      content,
      category: 'document',
    },
  });
}

export async function loadPersonalNotes(db: DbClient, sub: string): Promise<AppNote[]> {
  const raw = await readSnippetContent(db, personalNotesKey(sub));
  return parsePersonalNotes(raw, sub);
}

export async function savePersonalNotes(
  db: DbClient,
  sub: string,
  notes: AppNote[],
): Promise<void> {
  await writeSnippetContent(db, personalNotesKey(sub), JSON.stringify(notes));
}

export async function loadInboxNotes(db: DbClient, sub: string): Promise<SharedNote[]> {
  const raw = await readSnippetContent(db, inboxNotesKey(sub));
  return parseInboxNotes(raw);
}

export async function saveInboxNotes(
  db: DbClient,
  sub: string,
  notes: SharedNote[],
): Promise<void> {
  await writeSnippetContent(db, inboxNotesKey(sub), JSON.stringify(notes));
}
