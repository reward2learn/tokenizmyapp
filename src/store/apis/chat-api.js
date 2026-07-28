import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery,
    tagTypes: ['Conversations', 'AiFindings'],
    endpoints: (builder) => ({
        sendMessage: builder.mutation({
            query: (body) => ({
                url: 'chat',
                method: 'POST',
                body,
            }),
        }),
        synthesizeVoice: builder.mutation({
            query: (body) => ({
                url: 'chat?resource=voice',
                method: 'POST',
                body,
            }),
        }),
        listConversations: builder.query({
            query: (limit = 20) => ({
                url: 'chat',
                params: { resource: 'conversations', limit },
            }),
            providesTags: ['Conversations'],
        }),
        getConversation: builder.query({
            query: (id) => ({
                url: 'chat',
                params: { resource: 'conversations', id },
            }),
            providesTags: (_result, _error, id) => [{ type: 'Conversations', id }],
        }),
        saveConversation: builder.mutation({
            query: (body) => ({
                url: 'chat?resource=conversations',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Conversations'],
        }),
        archiveConversation: builder.mutation({
            query: ({ id, archived }) => ({
                url: `chat?resource=conversations&id=${id}${archived !== undefined ? `&archived=${archived}` : ''}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Conversations'],
        }),
        /** GET /api/chat/ai-findings — list AI findings */
        getAiFindings: builder.query({
            query: () => 'chat/ai-findings',
            providesTags: ['AiFindings'],
        }),
        /** POST /api/chat/ai-findings — create AI finding */
        createAiFinding: builder.mutation({
            query: (body) => ({
                url: 'chat/ai-findings',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AiFindings'],
        }),
        /** DELETE /api/chat/ai-findings — delete by IDs */
        deleteAiFindings: builder.mutation({
            query: (ids) => ({
                url: `chat/ai-findings?ids=${ids.map(encodeURIComponent).join(',')}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AiFindings'],
        }),
        /** POST /api/chat/ai-findings/save-batch — replace all findings */
        saveAiFindingsBatch: builder.mutation({
            query: (body) => ({
                url: 'chat/ai-findings/save-batch',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AiFindings'],
        }),
        /** POST /api/chat/summarize-finding — summarize a finding */
        summarizeFinding: builder.mutation({
            query: (body) => ({
                url: 'chat/summarize-finding',
                method: 'POST',
                body,
            }),
        }),
        /** POST /api/chat/update-review — update review content via AI */
        updateReview: builder.mutation({
            query: (body) => ({
                url: 'chat/update-review',
                method: 'POST',
                body,
            }),
        }),
    }),
});
export const { useSendMessageMutation, useSynthesizeVoiceMutation, useListConversationsQuery, useGetConversationQuery, useLazyGetConversationQuery, useSaveConversationMutation, useArchiveConversationMutation, useGetAiFindingsQuery, useCreateAiFindingMutation, useDeleteAiFindingsMutation, useSaveAiFindingsBatchMutation, useSummarizeFindingMutation, useUpdateReviewMutation, } = chatApi;
