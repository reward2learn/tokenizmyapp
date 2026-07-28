'use client';
import { useMemo } from 'react';
import { useLazyGetConversationQuery, useListConversationsQuery, } from '@/store/apis/chat-api';
import { useAppDispatch } from '@/store/hooks';
import { setMessages } from '@/store/chat-stream-slice';
import { isChatAttachment } from '@/lib/chat/attachments';
function isConversationSummary(value) {
    return typeof value === 'object'
        && value !== null
        && typeof value.id === 'number';
}
function normalizeLoadedMessages(value) {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((msg) => {
        const row = msg;
        if ((row.role === 'user' || row.role === 'assistant') && typeof row.content === 'string') {
            const attachments = Array.isArray(row.attachments)
                ? row.attachments.filter(isChatAttachment)
                : [];
            return [{
                    role: row.role,
                    content: row.content,
                    ...(attachments.length ? { attachments } : {}),
                }];
        }
        return [];
    });
}
export function useSavedConversations() {
    const dispatch = useAppDispatch();
    const { data: conversationsPayload, isFetching: conversationsLoading } = useListConversationsQuery(20);
    const [loadConversation, { isFetching: isLoadingConversation }] = useLazyGetConversationQuery();
    const conversations = useMemo(() => {
        const data = conversationsPayload?.data;
        return Array.isArray(data) ? data.filter(isConversationSummary) : [];
    }, [conversationsPayload]);
    const load = async (id) => {
        const payload = await loadConversation(id).unwrap();
        const data = payload.data;
        dispatch(setMessages(normalizeLoadedMessages(data?.messages)));
        return true;
    };
    return {
        conversations,
        conversationsLoading,
        isLoadingConversation,
        load,
    };
}
