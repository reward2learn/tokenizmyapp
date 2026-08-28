export type NoteSource = 'manual' | 'assistant' | 'conversation';

export interface NoteShareRecipient {
  sub: string;
  name?: string | null;
  email?: string | null;
  sharedAt: string;
}

/** A note owned by the signed-in user (personal until shared). */
export interface AppNote {
  id: string;
  title: string;
  content: string;
  source: NoteSource;
  createdAt: string;
  updatedAt?: string;
  ownerSub: string;
  /** Outbound shares initiated from this note (audit on the owner's copy). */
  shares?: NoteShareRecipient[];
}

/** A note copy delivered to the recipient's inbox. */
export interface SharedNote extends Omit<AppNote, 'shares'> {
  originalNoteId: string;
  sharedFrom: {
    sub: string;
    name?: string | null;
    email?: string | null;
    sharedAt: string;
  };
  shareScope: 'direct' | 'team';
}

export interface NoteTeamMember {
  sub: string;
  name: string | null;
  email: string | null;
}

export interface NotesListPayload {
  mine: AppNote[];
  sharedWithMe: SharedNote[];
  teamMembers: NoteTeamMember[];
}
