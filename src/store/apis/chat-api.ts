import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import type { ChatAttachment } from '@/lib/chat/attachments';
import type { AiProviderId } from '@/store/apis/config-api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: ChatAttachment[];
}

export type ChatAiHealthStatus = 'healthy' | 'unhealthy' | 'unconfigured';

export interface ChatAiProviderHealth {
  status: ChatAiHealthStatus;
  message?: string;
}

export interface ChatAiProviderOption {
  id: AiProviderId;
  label: string;
  configured: boolean;
  defaultModel: string | null;
  health?: ChatAiProviderHealth;
}

export interface ChatAiOptionsData {
  providers: ChatAiProviderOption[];
  activeProviderId: AiProviderId;
  activeModel: string | null;
  providerId: AiProviderId;
  models: { id: string; label: string; description?: string }[];
  providerHealth?: ChatAiProviderHealth;
  modelHealth?: { status: 'healthy' | 'unhealthy'; message?: string };
}

export type StudioWarmStatus = 'idle' | 'warming' | 'ready' | 'error';

export interface WarmStudioModelResult {
  status: 'ready' | 'warming' | 'skipped';
  providerId?: string;
  model?: string;
  reason?: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,
  tagTypes: ['Conversations', 'AiFindings'],
  endpoints: (builder) => ({
    /** GET /api/chat/ai-options — provider/model picker for the chat composer. */
    getChatAiOptions: builder.query<
      ApiEnvelope<ChatAiOptionsData>,
      { providerId?: string } | void
    >({
      query: (args) => ({
        url: 'chat/ai-options',
        params: args?.providerId ? { providerId: args.providerId } : undefined,
      }),
    }),
    /** POST /api/chat/warm-model — start background Mac Studio warm (returns immediately). */
    warmStudioModel: builder.mutation<
      ApiEnvelope<WarmStudioModelResult>,
      { model: string; providerId?: string }
    >({
      query: (body) => ({
        url: 'chat/warm-model',
        method: 'POST',
        body,
      }),
    }),
    /** GET /api/chat/warm-model — poll Ollama /api/ps until model is in VRAM. */
    getStudioWarmStatus: builder.query<
      ApiEnvelope<WarmStudioModelResult>,
      { model: string; providerId?: string }
    >({
      query: ({ model, providerId }) => ({
        url: 'chat/warm-model',
        params: { model, ...(providerId ? { providerId } : {}) },
      }),
    }),
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
  }),
});

export const {
  useGetChatAiOptionsQuery,
  useWarmStudioModelMutation,
  useGetStudioWarmStatusQuery,
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
} = chatApi;
