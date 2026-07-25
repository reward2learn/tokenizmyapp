import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiEnvelope } from '@/store/api-types';
import type { NotificationDto, NotificationListFilter } from '@/domain/notifications/notification-service';

export type Notification = NotificationDto;

export interface NotificationCreateInput {
  userSub: string;
  type?: string;
  title: string;
  body: string;
  linkUrl?: string | null;
  metadata?: Record<string, unknown>;
}

export interface NotificationPatch {
  isRead?: boolean;
  isDismissed?: boolean;
}

/**
 * RTK Query API for in-app notifications (Phase 10D).
 * Base URL: /api/notifications — mutations hit the [id] sub-route for
 * single-notification patch/delete and mark-all-read for bulk read.
 */
export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/notifications' }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    listNotifications: builder.query<ApiEnvelope<{ notifications: Notification[] }>, NotificationListFilter | void>({
      query: (params) => {
        if (!params) return '';
        const search = new URLSearchParams();
        if (params.includeDismissed) search.set('includeDismissed', 'true');
        if (params.unreadOnly) search.set('unreadOnly', 'true');
        const qs = search.toString();
        return qs ? `?${qs}` : '';
      },
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<ApiEnvelope<{ count: number }>, void>({
      query: () => 'unread-count',
      providesTags: ['Notification'],
    }),
    createNotification: builder.mutation<ApiEnvelope<{ notification: Notification }>, NotificationCreateInput>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    markRead: builder.mutation<ApiEnvelope<{ notification: Notification }>, string>({
      query: (id) => ({
        url: id,
        method: 'PATCH',
        body: { isRead: true },
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: builder.mutation<ApiEnvelope<{ updated: number }>, void>({
      query: () => ({
        url: 'mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    dismissNotification: builder.mutation<ApiEnvelope<{ notification: Notification }>, string>({
      query: (id) => ({
        url: id,
        method: 'PATCH',
        body: { isDismissed: true },
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<ApiEnvelope<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: id,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useGetUnreadCountQuery,
  useCreateNotificationMutation,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDismissNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;
