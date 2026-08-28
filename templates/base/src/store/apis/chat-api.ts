import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import type { ChatAttachment } from '@/lib/chat/attachments';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: ChatAttachment[];
}

export type NoteSource = 'manual' | 'assistant' | 'conversation';

export interface NoteShareRecipient {
  sub: string;
  name?: string | null;
  email?: string | null;
  sharedAt: string;
}

export interface AppNote {
  id: string;
  title: string;
  content: string;
  source: NoteSource;
  createdAt: string;
  updatedAt?: string;
  ownerSub: string;
  shares?: NoteShareRecipient[];
}

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

export interface NotesListData {
  mine: AppNote[];
  sharedWithMe: SharedNote[];
  teamMembers: NoteTeamMember[];
  /** @deprecated use mine */
  notes?: AppNote[];
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,
  tagTypes: ['Conversations', 'AiFindings', 'Notes'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation<
      ApiEnvelope<{ reply: string }>,
      { message: string; history?: ChatMessage[]; stream?: boolean }
    >({
      query: (body) => ({
        url: 'chat',
        method: 'POST',
        body,
      }),
    }),
    synthesizeVoice: builder.mutation<
      ApiEnvelope<{ audioChunks: string[]; format: string }>,
      { text: string; voice?: string; speed?: number }
    >({
      query: (body) => ({
        url: 'chat?resource=voice',
        method: 'POST',
        body,
      }),
    }),
    listConversations: builder.query<
      ApiEnvelope<unknown>,
      { limit?: number; archived?: boolean } | number | void
    >({
      query: (arg) => {
        const limit = typeof arg === 'number' ? arg : arg?.limit ?? 20;
        const archived = typeof arg === 'object' && arg !== null ? arg.archived : undefined;
        return {
          url: 'chat',
          params: {
            resource: 'conversations',
            limit,
            ...(archived !== undefined ? { archived: String(archived) } : {}),
          },
        };
      },
      providesTags: ['Conversations'],
    }),
    getConversation: builder.query<ApiEnvelope<unknown>, number>({
      query: (id) => ({
        url: 'chat',
        params: { resource: 'conversations', id },
      }),
      providesTags: (_result, _error, id) => [{ type: 'Conversations', id }],
    }),
    saveConversation: builder.mutation<
      ApiEnvelope<unknown>,
      { title?: string; messages: ChatMessage[] }
    >({
      query: (body) => ({
        url: 'chat?resource=conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversations'],
    }),
    updateConversation: builder.mutation<
      ApiEnvelope<{ id: number; title: string; archived: boolean }>,
      { id: number; title?: string; archived?: boolean }
    >({
      query: ({ id, title, archived }) => ({
        url: `chat?resource=conversations&id=${id}`,
        method: 'PATCH',
        body: {
          ...(title !== undefined ? { title } : {}),
          ...(archived !== undefined ? { archived } : {}),
        },
      }),
      invalidatesTags: ['Conversations'],
    }),
    archiveConversation: builder.mutation<
      ApiEnvelope<{ id: number; archived: boolean }>,
      { id: number; archived?: boolean }
    >({
      query: ({ id, archived }) => ({
        url: `chat?resource=conversations&id=${id}${archived !== undefined ? `&archived=${archived}` : ''}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Conversations'],
    }),
    deleteConversations: builder.mutation<
      ApiEnvelope<{ deleted: number[] }>,
      number[]
    >({
      query: (ids) => ({
        url: `chat?resource=conversations&ids=${ids.join(',')}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),
    /** GET /api/chat/ai-findings — list AI findings */
    getAiFindings: builder.query<ApiEnvelope<unknown[]>, void>({
      query: () => 'chat/ai-findings',
      providesTags: ['AiFindings'],
    }),
    /** POST /api/chat/ai-findings — create AI finding */
    createAiFinding: builder.mutation<ApiEnvelope<unknown>, { content: string; title?: string }>({
      query: (body) => ({
        url: 'chat/ai-findings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiFindings'],
    }),
    /** DELETE /api/chat/ai-findings — delete by IDs */
    deleteAiFindings: builder.mutation<ApiEnvelope<void>, string[]>({
      query: (ids) => ({
        url: `chat/ai-findings?ids=${ids.map(encodeURIComponent).join(',')}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AiFindings'],
    }),
    /** POST /api/chat/ai-findings/save-batch — replace all findings */
    saveAiFindingsBatch: builder.mutation<ApiEnvelope<void>, { findings: unknown[] }>({
      query: (body) => ({
        url: 'chat/ai-findings/save-batch',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiFindings'],
    }),
    /** POST /api/chat/summarize-finding — summarize a finding */
    summarizeFinding: builder.mutation<ApiEnvelope<{ summary: string }>, { content: string }>({
      query: (body) => ({
        url: 'chat/summarize-finding',
        method: 'POST',
        body,
      }),
    }),
    /** POST /api/chat/update-review — update review content via AI */
    updateReview: builder.mutation<ApiEnvelope<unknown>, { messages: ChatMessage[]; summary: string; target?: string }>({
      query: (body) => ({
        url: 'chat/update-review',
        method: 'POST',
        body,
      }),
    }),
    getNotes: builder.query<ApiEnvelope<NotesListData>, void>({
      query: () => 'notes',
      providesTags: ['Notes'],
    }),
    createNote: builder.mutation<
      ApiEnvelope<{ saved: boolean; id: string; note: AppNote }>,
      { content: string; title?: string; source?: NoteSource }
    >({
      query: (body) => ({
        url: 'notes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notes'],
    }),
    updateNote: builder.mutation<
      ApiEnvelope<{ updated: boolean; note: AppNote; syncedTo?: number }>,
      { id: string; title?: string; content?: string }
    >({
      query: (body) => ({
        url: 'notes',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Notes'],
    }),
    shareNote: builder.mutation<
      ApiEnvelope<{
        shared: boolean;
        delivered: number;
        recipients: { sub: string; label: string }[];
        note: AppNote;
      }>,
      { noteId: string; recipientSub?: string; shareWithAll?: boolean }
    >({
      query: (body) => ({
        url: 'notes/share',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notes'],
    }),
    unshareNote: builder.mutation<
      ApiEnvelope<{
        revoked: boolean;
        removedFromInboxes: number;
        recipients: { sub: string; label: string }[];
        note: AppNote;
      }>,
      { noteId: string; recipientSub?: string; revokeAll?: boolean }
    >({
      query: (body) => ({
        url: 'notes/unshare',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notes'],
    }),
    deleteNotes: builder.mutation<
      ApiEnvelope<{ deleted: boolean; remaining: number }>,
      string[]
    >({
      query: (ids) => ({
        url: `notes?ids=${ids.map(encodeURIComponent).join(',')}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notes'],
    }),
    deleteInboxNotes: builder.mutation<
      ApiEnvelope<{ deleted: boolean; remaining: number }>,
      string[]
    >({
      query: (ids) => ({
        url: `notes?scope=inbox&ids=${ids.map(encodeURIComponent).join(',')}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notes'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useSynthesizeVoiceMutation,
  useListConversationsQuery,
  useGetConversationQuery,
  useLazyGetConversationQuery,
  useSaveConversationMutation,
  useUpdateConversationMutation,
  useArchiveConversationMutation,
  useDeleteConversationsMutation,
  useGetAiFindingsQuery,
  useCreateAiFindingMutation,
  useDeleteAiFindingsMutation,
  useSaveAiFindingsBatchMutation,
  useSummarizeFindingMutation,
  useUpdateReviewMutation,
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useShareNoteMutation,
  useUnshareNoteMutation,
  useDeleteNotesMutation,
  useDeleteInboxNotesMutation,
} = chatApi;
